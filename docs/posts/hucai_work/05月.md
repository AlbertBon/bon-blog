# 05月

### 05-05

### 今日任务

1. 创建用户及相应字段插入数据库
2. 拉取到对应用户的信息
3. 字段加密工具
4. 远程拉取用户数据

### 用户管理功能模块

#### 创建用户

* 接口地址

http://192.168.56.104:8080/iam/v1/extend/{organizationId}/users

* 请求参数

```json
{
  "userType": "P",
  "loginName": "ht_test2",
  "realName": "华图测试4",
  "gender": "",
  "organizationId": "6",
  "internationalTelCode": "+86",
  "startDateActive": "2022-04-27",
  "tenantName": "华图",
  "defaultRoles": [],
  "memberRoleList": [
    {
      "code": "cbtest",
      "level": "organization",
      "tenantId": 7,
      "tenantName": "华图",
      "name": "华图租户角色",
      "sourceType": "organization",
      "memberType": "user",
      "assignLevel": "organization",
      "assignLevelValue": 7,
      "assignLevelValueMeaning": "华图",
      "_status": "create",
      "manageableFlag": 1,
      "roleId": "7",
      "sourceId": "7"
    }
  ],
  "extendUserInfo": {
    "applyType": "申请（代理）类型",
    "businessLicense": "营业执照",
    "idArdPicBack": "身份证反面",
    "userTypeYun": "出版云印用户类型",
    "subDomain": "子域名",
    "idCardNo": "身份证号码",
    "businessLicenseCode": "营业执照号",
    "bookLicense": "图书许可证",
    "menuLogo": "菜单logo",
    "userBelonging": "1",
    "abbreviationName": "公司简称",
    "moduleId": "1",
    "_innerMap": "{}",
    "adPic": "广告语图片",
    "proxyLogo": "代理LOGO图片",
    "upCustomer": "1",
    "companyType": "1",
    "bankLicense": "银行开户许可证",
    "companyId": "1",
    "themeColor": "主题颜色",
    "background": "登录图",
    "loginLogo": "登录logo",
    "idArdPicFront": "身份证正面",
    "taxLicense": "税务登记证",
    "proxyId": "1"
  }
}
```

