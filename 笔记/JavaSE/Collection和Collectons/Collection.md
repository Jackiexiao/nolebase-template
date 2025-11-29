---
share: "true"
created: 星期六, 十月 18日 2025, 10:14:01 上午
date modified: 星期六, 十一月 29日 2025, 6:36:56 晚上
---
![Pasted image 20251018101607](../../img/Pasted%20image%2020251018101607.png)
```txt
注意点:
	Collection是一个接口,我们不能直接创建他的对象。
	所以，现在我们学习他的方法时，只能创建他实现类的对象。
	实现类:ArrayList
	细节1：如果我们往要往List系列集合中添加数据，那么永远返回true，因为List系列的是允许元素重复的。
	细节2：如果我们要往Set系列集合中添加数据，如果当前要添加的元素不存在，方法返回true，表示添加成功。如果当前添加的元素已经存在，方法返回false，表示添加失败，因为Set系列的集合不允许重复。
```
## 删除
	注意:因为co11ection里面定义的是共性的方法，所以此时不能通过索引进行删除。只能通过元素的对象进行删除。
	方法会有一个布尔类型的返回值，删除成功返回true，删除失败返回false，如果删除的元素不存在，就会删除失败。
## contains
	因为contains方法在底层依赖equals方法判对象是否一致的。
	如果存的是自定义对象，没有重写equa1s方法，那么默认使用object类中的equa1s方法进行判断，而object类中equals方法，依赖地址值进行判断
	需求:如果同姓名和同年龄，就认为是同一个学生。
	所以，需要在自定义的Javabean类中，重写eguals方法可以了
## Collection 的遍历方式
![Pasted image 20251018103206](../../img/Pasted%20image%2020251018103206.png)
### 迭代器遍历
![Pasted image 20251018103320](../../img/Pasted%20image%2020251018103320.png)
![Pasted image 20251018104723](../../img/Pasted%20image%2020251018104723.png)
	如果要删除，可以用迭代器提供的remove方法进行删除。(要添加暂时没有办法)
```Java
	Iterator<String> it = coll.iterator();
	while(it.hasNext()){
		String str = it.next();
		if (str.equals("bbb")){
			it.remove();
		}
	}
```
![Pasted image 20251018110611](../../img/Pasted%20image%2020251018110611.png)
### 增强for遍历
![Pasted image 20251018110723](../../img/Pasted%20image%2020251018110723.png)
![Pasted image 20251018110937](../../img/Pasted%20image%2020251018110937.png)
### Lambda表达式遍历
```java
	Collection<String> coll = new ArrayList<>();  
	coll.add("hello");  
	coll.add("world");  
	coll.add("java");
	coll.forEach(str -> System.out.println(str));
```
![Pasted image 20251018111406](../../img/Pasted%20image%2020251018111406.png)
