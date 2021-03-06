---
icon: book
date: 2022-05-22
category:
  - design-pattern
tag:
  - design-pattern
---


# 单例模式

## 简介

保证系统中某个类只存在一个实例;

比如比较占资源的实例,系统只有一个比较好

### 1.饿汉式(静态常量)

>  java程序启动时,就实例化单例类,并只能通过方法获取,无法new出此实例

```java
//饿汉式(静态变量)

class Singleton {
	
	//1. 构造器私有化, 外部不能new
	private Singleton() {
		
	}
	
	//2.本类内部创建对象实例
	private final static Singleton instance = new Singleton();
	
	//3. 提供一个公有的静态方法，返回实例对象
	public static Singleton getInstance() {
		return instance;
	}
	
}
```



### 2.饿汉式(静态变量)

> 类似,在静态代码块中实例化

```java
//饿汉式(静态变量)

class Singleton {
	
	//1. 构造器私有化, 外部不能new
	private Singleton() {
		
	}
	

	//2.本类内部创建对象实例
	private  static Singleton instance;
	
	static { // 在静态代码块中，创建单例对象
		instance = new Singleton();
	}
	
	//3. 提供一个公有的静态方法，返回实例对象
	public static Singleton getInstance() {
		return instance;
	}
	
}
```

### 3.懒汉式(有线程安全问题)

```java
class Singleton {
	private static Singleton instance;
	
	private Singleton() {}
	
	//提供一个静态的公有方法，当使用到该方法时，才去创建 instance
	//即懒汉式
	public static Singleton getInstance() {
		if(instance == null) {
			instance = new Singleton();
		}
		return instance;
	}
}
```

### 4.懒汉式(线程安全,并发性能不好)

```java
// 懒汉式(线程安全，同步方法)
class Singleton {
	private static Singleton instance;
	
	private Singleton() {}
	
	//提供一个静态的公有方法，加入同步处理的代码，解决线程安全问题
	//即懒汉式
	public static synchronized Singleton getInstance() {
		if(instance == null) {
			instance = new Singleton();
		}
		return instance;
	}
}
```

### 5.懒汉式(线程不安全)

```java
// 懒汉式(线程安全，同步方法)
class Singleton {
	private static Singleton instance;
	
	private Singleton() {}
	
	//懒汉式;虽然同步了实例化部分的代码,但是判断为空时,可能存在两个线程同时进入判断;导致实例化两次
	public static Singleton getInstance() {
		if(instance == null) {
            synchronized(Singleton.class){
                instance = new Singleton();
            }
		}
		return instance;
	}
}
```

### 6.双检锁

```java
class Singleton {
    // 使用volatile可以将数据刷新到主存,比起synchronized轻量,而且可以防止指令重排序
    // 原理是内存屏障,在volatile修饰的变量写操作后加上写屏障,让写的最新数据刷新到主存,确保后面的代码获取到的变量值是最新的.
    // 在读操作前加上读屏障,让读操作读到的数据是主存中的数据;读写屏障共同保证了可见性
    // 同时有序性是写屏障确保写操作之前的代码不会指令重排;读屏障之后的代码不会指令重排
	private static volatile Singleton instance;
	
	private Singleton() {}
	
    // 此处判断了两次,即使两个线程同时进入第一个判断,但是同步代码块保证只有一个方法会去实例化
	//提供一个静态的公有方法，加入双重检查代码，解决线程安全问题, 同时解决懒加载问题
	//同时保证了效率, 推荐使用
	
	public static synchronized Singleton getInstance() {
		if(instance == null) {
			synchronized (Singleton.class) {
				if(instance == null) {
                    // 这里在字节码是几个步骤(分配空间;复制引用地址;调用构造方法;给instance赋值引用地址),如果指令重排,这两个指令调换位置,先赋值了引用地址,而马上有个线程在外层if中判断不为空,但是这时候还没有调用构造方法,所以引用是空的,而突入的线程拿空值去做事,就会出错.
					instance = new Singleton();
				}
			}
			
		}
		return instance;
	}
}
```

### 7.静态内部类

```java
// 静态内部类完成， 推荐使用
class Singleton {
	private static volatile Singleton instance;
	
	//构造器私有化
	private Singleton() {}
	
	//写一个静态内部类,该类中有一个静态属性 Singleton
	private static class SingletonInstance {
		private static final Singleton INSTANCE = new Singleton(); 
	}
	
	//提供一个静态的公有方法，直接返回 SingletonInstance.INSTANCE
	
	public static synchronized Singleton getInstance() {
		
		return SingletonInstance.INSTANCE;
	}
}
```

### 8.枚举类

```java
public class SingletonTest08 {
	public static void main(String[] args) {
		Singleton instance = Singleton.INSTANCE;
		Singleton instance2 = Singleton.INSTANCE;
		System.out.println(instance == instance2);
		
		System.out.println(instance.hashCode());
		System.out.println(instance2.hashCode());
		
		instance.sayOK();
	}
}

//使用枚举，可以实现单例, 推荐
enum Singleton {
	INSTANCE; //属性
	public void sayOK() {
		System.out.println("ok~");
	}
}
```

