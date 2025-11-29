---
share: "true"
created: 星期六, 十月 11日 2025, 9:57:09 上午
date modified: 星期六, 十一月 29日 2025, 6:36:56 晚上
---
## Object
![Pasted image 20251011095759](../../img/Pasted%20image%2020251011095759.png)
Object只有空参构造放法
## Object 的成员方法
![Pasted image 20251011100017](../../img/Pasted%20image%2020251011100017.png)
## toString的方法结论
	如果我们打印一个对象，想要看到属性值的话，那么重写toString方法就可以了
	在重写的方法中将对象的属性值进行拼接就可以了
## equals
	如果没有重写equals方法，会默认使用Object中的equals方法，比较的是地址值是否相等
	一般来讲地址值对我们没用，都会重写equals方法，重写之后比较的就是对象内部的属性值
## clone
![Pasted image 20251011101757](../../img/Pasted%20image%2020251011101757.png)
![Pasted image 20251011102016](../../img/Pasted%20image%2020251011102016.png)
	如果一个接口里面没有抽象方法
	表示当前的接口是一个标记性接口
	现在Cloneable表示一旦了实现，那么当前类的对象就可以被克隆
	如果没有实现，当前类的对象就不能克隆
![Pasted image 20251011103329](../../img/Pasted%20image%2020251011103329.png)
![Pasted image 20251011104712](../../img/Pasted%20image%2020251011104712.png)
## Objects
![Pasted image 20251011104837](../../img/Pasted%20image%2020251011104837.png)
## Objects的成员方法
![Pasted image 20251011104903](../../img/Pasted%20image%2020251011104903.png)
![Pasted image 20251011110157](../../img/Pasted%20image%2020251011110157.png)
