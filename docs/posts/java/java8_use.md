---
icon: book
date: 2022-05-19
category:
  - java
tag:
  - java
---

# java8使用

## BiFunction使用
### 实现四则运算

```java
public class BiFunctionTest {

    @Test
    public void test() {
        BiFunctionTest test = new BiFunctionTest();
        //实现四则运算
        System.out.println(test.compute(4, 2, (value1, value2) -> value1 + value2));
        System.out.println(test.compute(4, 2, (v1, v2) -> v1 - v2));
        System.out.println(test.compute(1, 2, (v1, v2) -> v1 * v2));
        System.out.println(test.compute(3, 2, (v1, v2) -> v1 / v2));
        System.out.println(test.calcute(3, 4, (v1, v2) -> v1 + v2, v -> v * v,v-> {System.out.println(v);return 1;}));
    }

    public int compute(int num1, int num2, BiFunction<Integer, Integer, Integer> biFunction) {
        return biFunction.apply(num1, num2);
    }

    public int calcute(int num1, int num2, BiFunction<Integer, Integer, Integer> biFunction, Function<Integer, Integer> function, Function<Integer,Integer> f2) {
        //调用addThen首先对接收的两个参数进行bifunction的apply，然后在进行function的apply
        return biFunction.andThen(function).andThen(f2).apply(num1, num2);

    }
}
```

### 配合::使用

```java
public class BiFunctionTest {

    @Test
    public void test() {
        BiFunctionTest test = new BiFunctionTest();
        // bifunction调用
        Param param = new SonParam();
        // Parent::execution 给到testParameter(),由testParameter()接收到的execution接口函数会映射成 BiFunction<Parent, Param, Result>
        // Parent::execution作用:
        // 将Parent作为BiFunction第一个参数类型
        // execution方法的参数作为BiFunction的第二个参数类型
        // execution方法的返回类型作为BiFunction的第三个参数类型
        // 总结: 由此调用,结合将方法提供者->Parent,方法参数->Param,方法返回类型->ResultTest定义为抽象类,可以规范传入的值;并且可以在调用 testParameter 时自定义传入的具体类型;
        Result result = test.testParameter(param, Parent::execution);
        System.out.println(result);
        // 而且testParameter()执行时也可以定义任何Parent的具体实现类来执行方法
        // return execution.apply(new Son1(),p); // Son1也是Parent的实现类型,所以此次执行将有Son1来执行
        // 扩展: 同时testParameter还可以接收Parent的任何有一个参数和返回值的方法;
        String s = "123";
        Integer integer = test.testParameter(s,Parent::execution1);
        System.out.println(integer);


        // 传统调用,在客户端调用时就确定了方法提供者,参数,返回类型的具体类型;对比一下,使用BiFunction可以用来实现策略模式
        Parent parent = new Son();
        Result oldResult = parent.execution(param);
        System.out.println(oldResult);

    }

    private <P,R> R testParameter(P p, BiFunction<Parent, P, R> execution) {
        return execution.apply(new Son(),p);
    }

    interface Parent{
        Result execution(Param param);
        Integer execution1(String s);
    }

    class Son implements Parent{

        @Override
        public Result execution(Param param) {
            System.out.println("这是执行方法");
            return new Result("Result");
        }

        @Override
        public Integer execution1(String s) {
            System.out.println("这是 execution1");
            return Integer.valueOf(s);
        }


    }

    class Son1 implements Parent{

        @Override
        public Result execution(Param param) {
            System.out.println("这是Son1执行方法");
            return new Result("Result");
        }

        @Override
        public Integer execution1(String s) {
            System.out.println("这是 Son1 execution1");
            return Integer.valueOf(s);
        }
        
    }

    interface Param{

    }

    class SonParam implements Param{

    }

    @Data
    class Result {
        private String msg;

        public Result(String msg) {
            this.msg = msg;
        }
    }

}
```

