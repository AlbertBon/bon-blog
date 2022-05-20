---
icon: edit
date: 2022-05-19
category:
  - hucai
tag:
  - hzero
---

# 汉得使用笔记及源码解析

## 本地使用ktconnect连接集群
使用ktconnct连接集群(本地为windows版)
1. 下载`ktctl`

[ktconnct文档地址](https://alibaba.github.io/kt-connect/#/zh-cn/guide/quickstart)

2. 下载windows版`k8s`

>　文件已放附件也可以自行去官网下载 

[文档地址](https://kuboard.cn/install/install-k8s.html)

3. 安装 `k8s` 和 `ktctl`

> 将下载的文件放到自己的文件夹下,并配置环境变量

![](./image/20220518_1.png)

![](./image/20220518_2.png)

4. 将集群配置文件放入 `~/.kube/` 文件夹下

> 在 `用户文件夹` 新建 `.kube` 文件夹,并把 `config` 文件放在此文件夹下

![](./image/20220518_3.png)

5. 使用ktctl命令连接集群

* 连接

```shell script
ktctl connect
```

* 连接成功后界面

> 连接成功后窗口不要关闭

![](./image/20220518_6.png)

6. 创建一个shadow容器转发流量到本地

> 这里使用iam服务为例
> -n devp-hy-cb-middle-env 是命名空间
> hy-cb-middle-back-iam-s-4dc505 是service
> --expose 8030 暴露端口

```shell script
ktctl mesh -n devp-hy-cb-middle-env hy-cb-middle-back-iam-s-4dc505 --expose 8030
```

![](./image/20220518_4.png)


7. 本地代码设置服务nacos ip为生成的shadow容器的pod id

* pod id 使用 kubectl 命令获取

```shell script
kubectl get pods -o wide -A
```

* 配置nacos ip

![](./image/20220518_5.png)

## 短信发送源码解析

1. 从注册发送短信接口作为调试入口
    ```java
    @ApiOperation("验证码 - 注册时发送手机验证码")
    @Permission(
        permissionPublic = true
    )
    @GetMapping({"/users/register-phone/send-captcha"})
    public ResponseEntity<Map> sendRegisterPhoneCaptcha(@ApiParam("国际冠码，默认+86") @RequestParam(defaultValue = "+86") String internationalTelCode, @ApiParam("发送验证码的手机号") @RequestParam String phone, @ApiParam("用户类型：P/C") @RequestParam(required = false,defaultValue = "P") String userType, @ApiParam("验证码业务范围") @RequestParam(required = false) String businessScope) {
        SmsPreResult smsPreResult = this.userCaptchaService.sendPhoneCaptchaNew(internationalTelCode, phone, UserType.ofDefault(userType), businessScope, false, false, this.configGetter.getValue(ProfileCode.MSG_CODE_REGISTER_USER));
        return Results.success(captchaResultMap(smsPreResult));
    }
    ```

2. 进入 `sendPhoneCaptchaNew` 验证码方法

    > Sms是一个静态内部类 
    
    ```java
    
    public SmsPreResult sendPhoneCaptchaNew(String internationalTelCode, String phone, UserType userType, String businessScope, boolean userPhone, boolean checkRegister, String template) {
            if (checkRegister && !this.userRepository.existsByPhone(phone, userType.value())) {
                throw new CommonException("hiam.warn.user.notFoundWithPhone", new Object[0]);
            } else {
                if (userPhone) {
                    CustomUserDetails details = UserUtils.getUserDetails();
                    UserSecurityUtil.open();
                    User user = (User)this.userRepository.selectByPrimaryKey(details.getUserId());
                    Assert.isTrue(StringUtils.equals(user.getPhone(), phone), "user.send-captcha.phone.error");
                    internationalTelCode = user.getInternationalTelCode();
                }
    
               // 这里的Sms使用建造者模式,主要是组装需要发送的手机号等信息
               SmsPreResult smsPreResult = (SmsPreResult)Sms.of(phone).setCrownCode(internationalTelCode).setPrefix("hiam").setUserType(userType.value()).setBusinessScope(businessScope).execute().failureThrow((result) -> {
                    return new MessageException(result.getMessage());
                });
                Map<String, String> params = new HashMap(8);
                params.put("captcha", smsPreResult.getCaptcha());
    
                try {
    // 这里是将验证码放入线程池,设置为异步请求
                    this.messageClient.async().sendMessage(Constants.SITE_TENANT_ID, template, (String)null, Collections.singletonList((new Receiver()).setPhone(phone).setIdd(internationalTelCode)), params, Collections.singletonList("SMS"), new Attachment[0]);
                } catch (Exception var11) {
                    throw new CommonException("hiam.warn.sendPhoneError", new Object[0]);
                }
    
                smsPreResult.clearCaptcha();
                return smsPreResult;
            }
        }
    
    ```

3. `Sms.execute()` 方法,通过 `CaptchaHelper` 获取验证码管理类 `CaptchaManager`, 再通过 `CaptchaManager` 的执行方法执行
    
    ```java
    // CaptchaHelper 通过 CaptchaManagerSetter 从spring容器中拿到CaptchaManager
    public static final class CaptchaManagerSetter {
        public CaptchaManagerSetter() {
        }
    
        public void setCaptchaManager(@NonNull CaptchaManager captchaManger) {
            CaptchaHelper.captchaManager = captchaManger;
        }
    }
    
    // CaptchaConfiguration 配置 CaptchaManager,可以知道spring默认注入的 DefaultCaptchaManager
        @Bean
        @ConditionalOnMissingBean({CaptchaManager.class})
        public CaptchaManager captchaManager(CaptchaProperties captchaProperties, @Autowired(required = false) List<CaptchaProvider> captchaProviders) {
            return new DefaultCaptchaManager(captchaProperties, captchaProviders);
        }
    
        @Bean
        public CaptchaManagerSetter captchaManagerSetter(@NonNull CaptchaManager captchaManager) {
            CaptchaManagerSetter captchaManagerSetter = new CaptchaManagerSetter();
            captchaManagerSetter.setCaptchaManager(captchaManager);
            return captchaManagerSetter;
        }
    
    // CaptchaHelper 执行
        public static SmsPreResult execute(@NonNull SmsPreParameter parameter) {
            return (SmsPreResult)getCaptchaManager().preProcess(parameter);
        }
    ```

4. `DefaultCaptchaManager` 的执行方法
    
    ```java
    // DefaultCaptchaManager 的 preProcess()
        public CaptchaPreResult<?> preProcess(CaptchaPreParameter preParameter) {
    // 使用 CaptchaProvider::preProcess 和 ExceptionHandler::handPreProcess 传参给 execute的函数接口
            return (CaptchaPreResult)this.execute(preParameter, CaptchaProvider::preProcess, ExceptionHandler::handPreProcess);
        }
    
        private <P extends Parameter, R> R execute(P parameter, @NonNull BiFunction<CaptchaProvider, P, R> execution, @NonNull BiFunction<ExceptionHandler, Exception, R> handException) {
            if (Objects.isNull(parameter)) {
                throw new CommonException("hzero.captcha.validate.parameter-non-null", new Object[0]);
            } else if (this.captchaProviders.containsKey(parameter.getCaptchaType())) {
    // 根据验证码类型,获取对应 `CaptchaProvider` 处理类
                CaptchaProvider supportedProvider = (CaptchaProvider)this.captchaProviders.get(parameter.getCaptchaType());
    
                try {
                    if (parameter.valid()) {
    // 因为execution由CaptchaProvider::preProcess传入,所以execution.apply 是指 调用supportedProvider的preProcess(parameter),将parameter作为入参;
                        return execution.apply(supportedProvider, parameter);
                    } else {
                        throw new CommonCaptchaException("hzero.captcha.validate.parameter-invalid", new Object[]{parameter});
                    }
                } catch (Exception var6) {
                    return handException.apply(supportedProvider.getExceptionHandler(), var6);
                }
            } else {
                throw new CommonException("hzero.captcha.validate.unknown-provider", new Object[]{parameter});
            }
        }
    ```

5. 最终进入主要方法 `SmsCaptchaProvider` 的 `preProcess()`
    
    ```java
        @NonNull
        public SmsPreResult preProcess(@NonNull CaptchaPreParameter preParameter) {
    // 确保是Sms类型消息
            Assert.isInstanceOf(SmsPreParameter.class, preParameter, "Only SmsPreParameter.class Support!");
            SmsPreParameter smsPreParameter = (SmsPreParameter)preParameter;
    // 发送前校验
            this.preProcessValid(smsPreParameter);
            String captchaKey = this.generateCaptchaKey();
    // 生成验证码
            String captcha = CaptchaGenerator.generateNumberCaptcha(this.smsCaptchaProperties.getCharLength(), this.smsCaptchaProperties.getCharSource());
    // 保存验证码,默认使用的redis保存
            this.storeCaptcha(smsPreParameter, captchaKey, captcha);
            return SmsPreResult.success(captchaKey, captcha, smsPreParameter, this.smsCaptchaProperties);
        }
    
    // 发送前校验
        private void preProcessValid(@NonNull SmsPreParameter smsPreParameter) {
            String intervalStoreKey = getStoreKey(smsPreParameter, SmsCaptchaProvider.CacheType.INTERVAL, smsPreParameter.getMobile());
            Long interval = this.getCaptchaRepository().expire(intervalStoreKey, TimeUnit.SECONDS);
    // 校验是否过期
            if (Objects.nonNull(interval) && interval > 0L) {
                throw new IntervalCaptchaException(interval);
            } else {
    // 校验是否超过最大发送次数,由此可知 `smsCaptchaProperties` 的 getLimitTime 和 getLimitInterval 两个配置值
                if (this.smsCaptchaProperties.getLimitTime() > 0) {
                    String sendTimeKey = getStoreKey(smsPreParameter, SmsCaptchaProvider.CacheType.SEND_TIME, smsPreParameter.getMobile());
                    String sendTime = this.getCaptchaRepository().value(sendTimeKey);
                    if (StringUtils.isNotBlank(sendTime) && Integer.parseInt(sendTime) >= this.smsCaptchaProperties.getLimitTime()) {
                        throw new CommonCaptchaException("hzero.captcha.send.time-over", new Object[]{this.smsCaptchaProperties.getLimitInterval()});
                    }
                }
    
            }
        }
    ```

6. 前面是生成验证码流程,接下来是发送验证码流程
    
    > 
    
    ```java
    // 第1步中有发送方法
        this.messageClient.async().sendMessage(Constants.SITE_TENANT_ID, template, (String)null, Collections.singletonList((new Receiver()).setPhone(phone).setIdd(internationalTelCode)), params, Collections.singletonList("SMS"), new Attachment[0]);
    
    // 这里是messageClient的sendMessage()方法
        public void sendMessage(long tenantId, String messageCode, String lang, List<Receiver> receiverAddressList, Map<String, String> args, List<String> typeCodeList, Attachment... attachments) {
            if (attachments == null) {
                attachments = new Attachment[0];
            }
    
            Map<String, Object> objectArgs = new HashMap(16);
            if (args != null) {
                ((Map)objectArgs).putAll(args);
            }
    
    // 远程调用hzero-message服务获取消息模板  
            List<TemplateServerLine> templateServerLines = (List)ResponseUtils.getResponse(this.messageRemoteService.listTemplateServerLine(tenantId, messageCode), new TypeReference<List<TemplateServerLine>>() {
            });
    
            TemplateServerLine line;
            for(Iterator var11 = templateServerLines.iterator(); var11.hasNext(); objectArgs = this.appendSqlParam(tenantId, line.getTemplateCode(), (Map)objectArgs, lang)) {
                line = (TemplateServerLine)var11.next();
            }
    
            MessageSender messageSender = (new MessageSender()).setTenantId(tenantId).setMessageCode(messageCode).setLang(lang).setReceiverAddressList(receiverAddressList).setArgs(args).setObjectArgs((Map)objectArgs).setTypeCodeList(typeCodeList);
            if (attachments.length > 0) {
                messageSender.setAttachmentList(Arrays.asList(attachments));
            }
    
            if (this.async) {
    // 异步发送,是让hzero-message去发送
                this.messageAsyncService.sendMessage(messageSender);
            } else {
    // 同步发送,是让hzero-message去发送
                this.messageRemoteService.sendMessage(tenantId, messageSender);
            }
    
        }
    ```

7. 扩展: 在message服务里 `SmsSendServiceImpl` 的 `sendMessageWithLang()` 是发送短信的主要方法

8. 扩展: 短信测试接口
    ```java
    @ApiOperation("关联发送消息，邮件/短信/站内信/微信")
    @Permission(
        level = ResourceLevel.SITE
    )
    @PostMapping({"/all"})
    public ResponseEntity<Map<String, Integer>> sendAllMessage(@RequestBody @Encrypt AllSender sender) {
        return Results.success(this.relSendMessageService.sendAllMessage((Long)null, sender));
    }
    ```
    
    ```http request
    POST http://develop-gateway.cb.hucai.cn/hmsg/v1/message/relevance/all
    Authorization: bearer 95486003-3130-42ee-8daa-6ec5e1f1cc29
    Content-Type: application/json
    
    {
      "messageSender": {
        "lang": "zh_CN",
        "messageCode": "HIAM.REGISTER_USER",
        "tenantId": 0,
        "receiverAddressList": [
          {
            "phone": "15814371650"
          }
        ],
        "typeCodeList": [
          "SMS"
        ],
        "args": {
          "captcha":"622260" # 短信参数 args: Map<String,String>
        }
      }
    }
    ```

## 数据权限原理分析
* 配置数据语句拦截器`SqlParserInterceptorConfiguration`
```java
@Configuration
public class SqlParserInterceptorConfiguration {
    @Value("${spring.application.name:application}")
    private String serviceName;
    private List<SqlInterceptor> sqlInterceptors;

// 将拦截器注册到spring容器里
    @Bean
    @ConditionalOnMissingBean
    public SqlParserInterceptor sqlParserInterceptor() {
        return new SqlParserInterceptor(serviceName, sqlInterceptors);
    }

    // 这里会接收所有实现了`SqlInterceptor`接口并注入了spring的bean
    @Autowired(required = false)
    public SqlParserInterceptorConfiguration setSqlInterceptors(List<SqlInterceptor> sqlInterceptors) {
        this.sqlInterceptors = sqlInterceptors;
        return this;
    }

}
```
* 汉得的自定义数据权限的sql拦截器`SqlParserInterceptor`
```java
// 实现了Interceptor,所以会被mybatis加入拦截sql
public class SqlParserInterceptor implements Interceptor {

    ...
// 主要方法
public Object intercept(Invocation invocation) throws Throwable {
        if (CollectionUtils.isEmpty(sqlInterceptors) || SqlParserHelper.isClose()) {
            return invocation.proceed();
        }
        // update -> prepared key
        if (invocation.getArgs().length == 2) {
            preparedGenerateKey(invocation);
        }
        BoundSql boundSql = SqlUtils.getBoundSql(invocation);
        if (boundSql == null) {
            return invocation.proceed();
        }
        currentBoundSql.set(boundSql);
        currentInvocation.set(invocation);
        String sqlId = SqlUtils.getSqlId(invocation);
        Statement statement;
        try {
            statement = CCJSqlParserUtil.parse(boundSql.getSql());
            CustomUserDetails userDetails = DetailsHelper.getUserDetails();
// 循环执行定义的SqlInterceptor拦截器
            for (SqlInterceptor sqlInterceptor : sqlInterceptors) {
                sqlInterceptor.before();
                statement = sqlInterceptor.handleStatement(statement, serviceName, sqlId, getArgs(invocation, statement), userDetails != null ? userDetails : DetailsHelper.getAnonymousDetails());
                sqlInterceptor.after();
            }
        } catch (Exception e) {
            logger.error("Error parser sql.", e);
            return invocation.proceed();
        } finally {
            currentInvocation.remove();
            currentBoundSql.remove();
        }
        return SqlUtils.resetSql(invocation, boundSql, statement.toString()).proceed();
    }

...

}
```
* 自定义的sql拦截器接口`SqlInterceptor`
```java
// 比如查询简单语句的拼接
default PlainSelect handlePlainSelect(PlainSelect plainSelect, String serviceName, String sqlId, Map args, CustomUserDetails userDetails) {
    // 拦截列
    List<SelectItem> selectItems = plainSelect.getSelectItems();
    if (!CollectionUtils.isEmpty(selectItems)) {
        for (int i = 0; i < selectItems.size(); ++i) {
            SelectItem selectItem = selectItems.get(i);
            if (selectItem instanceof SelectExpressionItem && ((SelectExpressionItem) selectItem).getExpression() instanceof SubSelect) {
                SelectExpressionItem selectExpressionItem = (SelectExpressionItem) selectItem;
//handleSubSelect由实现类自己实现
                selectExpressionItem.setExpression(handleSubSelect((SubSelect) selectExpressionItem.getExpression(), serviceName, sqlId, args, userDetails));
            } else if (selectItem instanceof SelectExpressionItem && ((SelectExpressionItem) selectItem).getExpression() instanceof CaseExpression) {
                SelectExpressionItem selectExpressionItem = (SelectExpressionItem) selectItem;
                selectExpressionItem.setExpression(handleCase((CaseExpression) selectExpressionItem.getExpression(), serviceName, sqlId, args, userDetails));
            } else {
                selectItem = handleSelectItem(selectItem, serviceName, sqlId, args, userDetails);
            }
            selectItems.set(i, selectItem);
        }
    }
    // 拦截FROM
    FromItem fromItem = plainSelect.getFromItem();
    if (fromItem instanceof Table) {
//handleTable由实现类自己实现
        FromItem afterHandlerFromItem = handleTable((Table) fromItem, serviceName, sqlId, args, userDetails);
        plainSelect.setFromItem(afterHandlerFromItem);
    } else if (fromItem instanceof SubSelect) {
        handleSubSelect((SubSelect) fromItem, serviceName, sqlId, args, userDetails);
    }
    // 拦截JOIN
    List<Join> joins = plainSelect.getJoins();
    if (!CollectionUtils.isEmpty(joins)) {
        for (Join join : joins) {
            handleJoin(join, serviceName, sqlId, args, userDetails);
        }
    }
    // 拦截WHERE
    Expression where = plainSelect.getWhere();
    if (where != null) {
        handleExpression(where, serviceName, sqlId, args, userDetails);
    }
    return plainSelect;
}
```
* `SqlInterceptor`接口的实现类`PermissionSqlBuilder`

> 这个拦截器是用于数据权限的实现类


```java
// 拦截前
    @Override
    public void before() {
        permissionSqlRepository.resetCache();
        onlyHandlePrefix.remove();
        tableAliasNumber.set(new AtomicInteger(0));
    }
// 拦截后
    @Override
    public void after() {
        permissionSqlRepository.resetCache();
        onlyHandlePrefix.remove();
    }
// 处理拦截,主要的方法其实接口类已经实现,这里只做数据权限相关的处理
    @Override
    public FromItem handleTable(Table table, String serviceName, String sqlId, Map args, CustomUserDetails userDetails) {
        init(getInitFilterSqlInterceptors());
        return handleTable2FromItem(table, serviceName, sqlId, args, userDetails == null ? DetailsHelper.getAnonymousDetails() : userDetails);
    }
    private FromItem handleTable2FromItem(Table table, String serviceName, String sqlId, Map args, CustomUserDetails userDetails) {
        FromItem fromItem = table;
        PermissionRangeVO permissionRange = getPermissionRange(table, serviceName, sqlId, args, userDetails);
        if (permissionRange != null) {
            if (StringUtils.hasText(permissionRange.getDbPrefix())) {
                String dbPrefix = permissionRange.getDbPrefix();
                if (permissionDataProperties != null && StringUtils.hasText(permissionDataProperties.getDbOwner())) {
                    dbPrefix = dbPrefix + "." + permissionDataProperties.getDbOwner();
                }
                fromItem = SqlUtils.generateTablePrefix(table, dbPrefix);
            }
            if (!CollectionUtils.isEmpty(permissionRange.getSqlList())) {
                if (!BooleanUtils.isTrue(onlyHandlePrefix.get())) {
                    try {
                        onlyHandlePrefix.set(true);
                        fromItem = handleSubSelect(SqlUtils.generateSubSelect(table, permissionRange.getSqlList(), args, userDetails, tableAliasNumber.get().getAndIncrement()),
                                serviceName, sqlId, args, userDetails);
                    } catch (JSQLParserException e) {
                        logger.error("Error generateSubSelect.", e);
                    } finally {
                        onlyHandlePrefix.remove();
                    }
                }
            }
        }
        return fromItem;
    }
```

## 值集配置注解大致源码解析
> 看文档可以知道大概是利用aop来扫描注解,有两个注解`@ProcessLovValue`和`@LovValue`

1. 处理值集值映射的切面`LovValueAspect`,从此处代码可知,需要在加上`@ProcessLovValue`注解才能被增强;

 ```java
 @Aspect
 public class LovValueAspect {

     private LovValueHandle lovValueHandle;

     public LovValueAspect(LovValueHandle lovValueHandle) {
         this.lovValueHandle = lovValueHandle;
     }

     @AfterReturning(value = "@annotation(org.hzero.boot.platform.lov.annotation.ProcessLovValue)",returning="result") 
     public Object afterReturning(JoinPoint proceedingJoinPoint, Object result) throws Throwable {
         MethodSignature signature = (MethodSignature) proceedingJoinPoint.getSignature();
         Method method = signature.getMethod();
         ProcessLovValue processLovValue = method.getAnnotation(ProcessLovValue.class);
         result = this.lovValueHandle.process(processLovValue.targetField(), result);
         return result;
     }

 }
 ```
2. 主要处理逻辑在`LovValueHandle`中,有个默认实现的handle: `DefaultLovValueHandle`

 ```java
 @Override
 public Object process(String[] targetFields, Object result) {
     try {
         if (result == null) {
             this.logger.debug("result is null, skip translate");
             return null;
         }
         this.logger.debug("lov translate begin");
         if(this.logger.isDebugEnabled()) {
             this.logger.debug("target fields is [{}]", ArrayUtils.isEmpty(targetFields) ? "[]" : Arrays.toString(targetFields));
         }
         // 有其他解析需求的话可以在这里扩展
         if (result instanceof Collection) {
             // 如果传入对象为集合,则直接处理其中的Elements
             this.processCollection(targetFields, (Collection<?>) result);
         } else {
             // 未命中任何解析方式,进行默认解析,方法里面对`@LovValue`注解字段进行扫描
             this.processDefault(targetFields, result);
         }
         this.logger.debug("lov translate end");
     } catch (IllegalArgumentException | IllegalAccessException | NoSuchFieldException | SecurityException e) {
         logger.error(e.getMessage(), e);
     }
     return result;
 }
 ```
3. `LovValueHandle`在`LovAutoConfiguration`中注入

 > `hzero.lov.value.enable` 配置为true生效,不过默认也是为true的.

 ```java
 @ConditionalOnProperty(prefix = "hzero.lov" + '.' + "value", name = "enabled", havingValue = "true", matchIfMissing = true)
 @EnableAspectJAutoProxy
 static class LovValue {

    //Hzero平台HTTP协议,默认http;   服务远程调用方式配置,因为值集会去platform服务获取.
     @Value("${hzero.platform.httpProtocol:http}")
     private String hzeroPlatformHttpProtocol;

     @Bean
     @ConditionalOnMissingBean
     public LovValueHandle lovValueHandle(LovAdapter lovAdapter, RestTemplate restTemplate) {
         return new DefaultLovValueHandle(lovAdapter, restTemplate, this.hzeroPlatformHttpProtocol);
     }

     @Bean
     public LovValueAspect lovValueAspect(LovValueHandle lovValueHandle) {
         return new LovValueAspect(lovValueHandle);
     }
 }
 ```

## 加密路径id值
      
* 前言 

> hzero请求接口时有些id字段需要加密,导致postman等外部调用测试不了接口,会报类似错误: `主键EncryptionService.java:67加密功能解密值：2时失败，原因：2不是一个加密数。`
> 因此通过查看汉得的id加密代码,写了一个id加密值的类,供参考使用

* 使用方法

> 根据需要自行设置(id,表名,token)三个值,一般来说请求只根据id和token加密,表名可以不填;

* 加密代码

```java
public class EncryptTest {

  public static void main(String[] args) {

      List<String> encryptKeyList = new ArrayList(8);
      encryptKeyList.add("297010915528814633");// id
      encryptKeyList.add("");// 表名
      encryptKeyList.add(getSubToken("b093f338-266a-471d-ada8-7cbe8af1466c")); // token
      // A5/vRTuHzZshct28bZSAiw== 是汉得目前放入的默认密钥值,如果配置了自己的密钥,需要修改这个值
      String s = wrap(EncryptionUtils.AES.encryptWithUrlEncoder(StringUtils.collectionToDelimitedString(encryptKeyList, ":"), "A5/vRTuHzZshct28bZSAiw=="));
      System.out.println(s);
  }

  String getSubToken(String token) {
      if (StringUtils.hasText(token)) {
          if (token.toLowerCase().startsWith("bearer ")) {
              token = token.substring("bearer ".length());
          }

          token = org.apache.commons.lang3.StringUtils.substring(token.replace("-", ""), 0, 10);
      } else {
          token = "NO_TOKEN";
      }

      return token;
  }
  private String wrap(String content) {
      return "=" + content + "=";
  }

}
```

## 创建内部用户源码查看记录

1. 以 `UserPublicController` 作为入口查看源码

    ```java
    @Permission(permissionWithin = true)
        @ApiOperation(value = "创建用户 - 内部调用接口，需传入默认分配的角色；如果传入了 type ，则校验验证码，不传则不校验")
        @PostMapping("/users/internal")
        public ResponseEntity<User> createUserInternal(
                @RequestBody User user,
                @ApiParam(value = "验证码业务范围") @RequestParam(required = false) String businessScope,
                @ApiParam(value = "创建类型：手机-phone/邮箱-email") @RequestParam(required = false) String type,
                @ApiParam(value = "是否校验验证码") @RequestParam(required = false, defaultValue = "true") boolean validateCaptcha,
                @ApiParam(value = "验证码Key：发送验证码时返回的 captchaKey") @RequestParam(required = false) String captchaKey,
                @ApiParam(value = "验证码：用户输入的验证码") @RequestParam(required = false) String captcha) {
            // 手机注册
            if (StringUtils.equalsIgnoreCase(type, User.FIELD_PHONE)) {
                if (validateCaptcha) {
                    userCaptchaService.validateCaptcha(captchaKey, captcha, user.getPhone(),
                            UserType.ofDefault(user.getUserType()), businessScope);
                }
                user.setPhoneCheckFlag(BaseConstants.Flag.YES);
            }
            // 邮箱注册
            else if (StringUtils.equalsIgnoreCase(type, User.FIELD_EMAIL)) {
                if (validateCaptcha) {
                    userCaptchaService.validateCaptcha(captchaKey, captcha, user.getEmail(),
                            UserType.ofDefault(user.getUserType()), businessScope);
                }
                user.setEmailCheckFlag(BaseConstants.Flag.YES);
            }
            user.setUserType(UserType.ofDefault(user.getUserType()).value());
            validObject(user);
            return Results.success(userService.createUserInternal(user));// 此步正式创建用户
        }
    ```

2. `UserServiceImpl`的`createUserInternal`使用了拦截器链模式

    > userInterceptorChainManager是一个拦截器管理器;只为注册为bean,主要操作在其父类`AbstractInterceptorChainManager`
    
    ```java
    @Override
        @Transactional(rollbackFor = Exception.class)
        public User createUserInternal(User user) {
            userInterceptorChainManager.doInterceptor(UserOperation.CREATE_USER_INTERNAL, user, (u) -> {
                // 创建用户
                userCreateInternalService.createUser(u);
            });
    
            return user;
        }
    ```

3. `AbstractInterceptorChainManager`初始化拦截器`initInterceptorChain`

    ```java
    private Map<ChainId, InterceptorChain<T>> initInterceptorChain(List<HandlerInterceptor<T>> interceptorList,
                                                                       List<InterceptorChainConfigurer<T, InterceptorChainBuilder<T>>> configurerList) {
            if (CollectionUtils.isEmpty(interceptorList)) {
                throw new IllegalArgumentException("Interceptors is empty.");
            }
    
            if (CollectionUtils.isEmpty(configurerList)) {
                throw new IllegalArgumentException("Interceptor configurers is empty.");
            }
            // 让拦截器构造器将注册到spring的拦截器管理起来
            InterceptorChainBuilder<T> builder = new InterceptorChainBuilder<>(interceptorList);
            // 对拦截器配置类排序;配置类上有@order注解
            configurerList.sort(AnnotationAwareOrderComparator.INSTANCE);
            // 循环调用配置类的配置,配置是可以多个,此处可以扩展
            configurerList.forEach(configurer -> {
                configurer.configure(builder);// 开始配置
                builder.clearChain();// 清楚当前chainId
            });
    
            List<InterceptorChain<T>> chains = builder.performBuild();// 开始构造
    
            return chains.stream().collect(Collectors.toMap(InterceptorChain::getChainId, Function.identity()));
        }
    ```

4. 用户拦截器配置类`UserInterceptorChainConfigurer`
    
    > 用户这里有几种用户操作类型,根据对应的操作类型,给配置对应的拦截器,实现对于不同操作拦截器可插拔,拦截器的里代码复用
    > 如果要加一个新的拦截器,需要在这里加一个配置逻辑
    
    ```java
    @Order(0)
    @Component
    public class UserInterceptorChainConfigurer implements InterceptorChainConfigurer<User, InterceptorChainBuilder<User>> {
    
        @Override
        public void configure(InterceptorChainBuilder<User> builder) {
            builder
                    .selectChain(UserOperation.CREATE_USER)// 选择操作类型,确定拦截器链
                    .pre()// 前置操作调用的拦截器标识
                    .addInterceptor(ValidationInterceptor.class)// 前置拦截器
                    .post()// 后置拦截器标识
                    .async() // 开启异步执行(这里表示后置拦截器异步执行)
                    .addInterceptor(CommonMemberRoleInterceptor.class) // 后置拦截器
                    .addInterceptor(UserConfigInterceptor.class)// 后置拦截器
                    .addInterceptor(SendMessageInterceptor.class)// 后置拦截器
                    .addInterceptor(LastHandlerInterceptor.class);// 后置拦截器
    
            builder
                    .selectChain(UserOperation.UPDATE_USER)
                    .pre()
                    .addInterceptor(ValidationInterceptor.class)
                    .post()
                    .addInterceptor(CommonMemberRoleInterceptor.class)
                    .addInterceptor(UserConfigInterceptor.class)
                    .addInterceptor(LastHandlerInterceptor.class);
    
            builder
                    .selectChain(UserOperation.REGISTER_USER)
                    .post()
                    .async()
                    .addInterceptor(RegisterMemberRoleInterceptor.class)
                    .addInterceptor(UserConfigInterceptor.class)
                    .addInterceptor(LastHandlerInterceptor.class);
    
            builder
                    .selectChain(UserOperation.CREATE_USER_INTERNAL)
                    .pre()
                    .addInterceptor(ValidationInterceptor.class)
                    .post()
                    .async()
                    .addInterceptor(InternalMemberRoleInterceptor.class)
                    .addInterceptor(UserConfigInterceptor.class)
                    .addInterceptor(LastHandlerInterceptor.class);
    
            builder
                    .selectChain(UserOperation.UPDATE_USER_INTERNAL)
                    .pre()
                    .addInterceptor(ValidationInterceptor.class)
                    .post()
                    .addInterceptor(LastHandlerInterceptor.class);
    
            builder
                    .selectChain(UserOperation.IMPORT_USER)
                    .post()
                    .addInterceptor(InternalMemberRoleInterceptor.class)
                    .addInterceptor(UserConfigInterceptor.class)
                    .addInterceptor(LastHandlerInterceptor.class);
        }
    }
    ```

5. 拦截器构造类`InterceptorChainBuilder`开始构造`performBuild`

    > 这一步直接将要实现的核心操作封装成consumer放入拦截器链里了
    
    ```java
    /**
         * 构建拦截器链
         *
         * @return 一组拦截器链
         */
        public List<InterceptorChain<T>> performBuild() {
            List<InterceptorChain<T>> chains = new ArrayList<>();
    
            for (ChainId chainId : chainIds) {
                // 根据链的id得到对应的前置拦截器列表和后置拦截器列表
                List<HandlerInterceptor<T>> preInterceptors = filterInterceptor(preInterMap.get(chainId));
                List<HandlerInterceptor<T>> postInterceptors = filterInterceptor(postInterMap.get(chainId));
    
                if (preInterceptors.isEmpty() && postInterceptors.isEmpty()) {
                    throw new IllegalStateException("Registered Pre-Interceptors and Post-Interceptors is empty.");
                }
    
                // 初始化前置和后置拦截器消费者方法
                Consumer<T> preConsumer = (T t) -> {
                };
                Consumer<T> postConsumer = (T t) -> {
                };
    
                if (!preInterceptors.isEmpty()) {
                    // 如果是异步操作,将各个拦截器的操作交给线程池异步执行
                    if (preAsyncMap.get(chainId)) {
                        preConsumer = (T obj) -> {
                            List<AsyncTask<T>> tasks = createAsyncTask(preInterceptors, obj);
                            CommonExecutor.batchExecuteAsync(tasks, PRE + chainId.id());
                        };
                    } else {
                        // 同步操作,将拦截器的拦截操作给消费者函数接口,后期外部直接调用此函数接口方法,就直接执行拦截器的代码
                        preConsumer = (T obj) -> {
                            for (HandlerInterceptor<T> item : preInterceptors) {
                                item.interceptor(obj);
                            }
                        };
                    }
                }
    
                if (!postInterceptors.isEmpty()) {
                    if (postAsyncMap.get(chainId)) {
                        postConsumer = (T obj) -> {
                            List<AsyncTask<T>> tasks = createAsyncTask(postInterceptors, obj);
                            CommonExecutor.batchExecuteAsync(tasks, POST_PRE + chainId.id());
                        };
                    } else {
                        postConsumer = (T obj) -> {
                            for (HandlerInterceptor<T> item : postInterceptors) {
                                item.interceptor(obj);
                            }
                        };
                    }
                }
    
                // 根据chainId添加了一组拦截器链
                chains.add(new InterceptorChain<T>(chainId, preConsumer, postConsumer));
            }
    
            return chains;
        }
    ```



6. service调用及通用拦截器的执行操作

    ```java
        
    //service方法
    //----------------
        public User createUserInternal(User user) {
            // 此处调用接口
            userInterceptorChainManager.doInterceptor(UserOperation.CREATE_USER_INTERNAL, user, (u) -> {
                // 创建用户
                userCreateInternalService.createUser(u);
            });
    
            return user;
        }
        
    //拦截器管理类方法
    //--------------
        /**
         * 拦截器调用入口，将核心操作封装成 Consumer 对象传入。
         *
         * @param target    The target to handle.
         * @param operation The core operation to intercept.
         */
        public final void doInterceptor(ChainId chainId, T target, Operation<T> operation) {
            InterceptorChain<T> chain = chainMap.get(chainId);
            if (chain == null) {
                throw new NotFoundException("InterceptorChain Not Found For [" + chainId.id() + "]");
            }
    
            chain.doExecute(target, operation);
        }
    
    //通用拦截器方法
    //----------
        /**
         * 拦截器调用入口，将核心操作封装成 Consumer 对象传入。
         *
         * @param target      The target to handle.
         * @param operation The core operation to intercept.
         */
        public final void doExecute(T target, Operation<T> operation) {
            // 前置拦截器的操作已经封装成consumer,此时调用调用accept方法,就执行了拦截器里的操作
            preConsumer.accept(target);
    
            // 具体操作,此处就是service,创建用户操作`userCreateInternalService.createUser(u);`
            if (operation != null) {
                operation.execute(target);
            }
    
            // 后置拦截器
            postConsumer.accept(target);
        }
    ```

7. 总结

   1. 先写拦截器,实现 `HandlerInterceptor`; 参照 `ValidationInterceptor`
   2. 写好配置类实现 `InterceptorChainConfigurer`;在配置类里面使用写好的拦截器; 参照 `UserInterceptorChainConfigurer`; 可配置拦截器的顺序 `@Order`
   3. 在代码中使用

   ```java
   // 拦截器管理器`userInterceptorChainManager`根据`UserOperation.CREATE_USER_INTERNAL`拦截器标识来知道执行哪个拦截器链,自己方法的操作使用函数接口方法提供
   userInterceptorChainManager.doInterceptor(UserOperation.CREATE_USER_INTERNAL, user, (u) -> {
       // 创建用户
       userCreateInternalService.createUser(u);
   });
   ```