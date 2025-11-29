---
share: "true"
created: 星期二, 十月 21日 2025, 9:08:50 晚上
date modified: 星期六, 十一月 29日 2025, 6:36:56 晚上
---
![Pasted image 20251021210915](../../img/Pasted%20image%2020251021210915.png)
## put方法的细节
> [!NOTE]
添加/覆盖
在添加数据时，如果键不存在，那么直接把键值对对象添加到map集合中
在添加数据时，如果键是存在的，那么会把原有的键值对对象覆盖，会把被覆盖的值进行返回
## Map的遍历方式
![Pasted image 20251022084042](../../img/Pasted%20image%2020251022084042.png)
## 键找值遍历
> [!NOTE]
> 通过（Map集合名）.keySet()获取键，并返回一个单列集合
> 再遍历单列集合得到每一个键，再通过  （Map集合名）.get（）方法获取对应的值
```Java
	Map<Integer,String> map = new HashMap<>();  
	map.put(1,"张三");  
	map.put(2,"李四");  
	map.put(3,"王五");  
	map.put(4,"赵六");  
	Set<Integer> keys = map.keySet();  
	for (Integer key : keys) {  
		System.out.println(key + "=" + map.get(key));  
	}
```
```txt
	1=张三
	2=李四
	3=王五
	4=赵六
```
## 键值对对象进行遍历
> [!NOTE] 
> 通过（Map集合名）.entrySet（）方法获取所有的键值对对象，并返回一个Set集合，遍历这个集合，得到里面的每一个键值对对象，利用get方法获取键和值
```java
	Map<String,String> map = new HashMap<>();  
	map.put("1001","zhangsan");  
	map.put("1002","lisi");  
	map.put("1003","wangwu");  
	map.put("1004","zhaoliu");  
	Set<Map.Entry<String, String>> entries = map.entrySet();  
	for (Map.Entry<String, String> entry : entries) {  
	    String key = entry.getKey();  
	    String value = entry.getValue();  
	    System.out.println(key + " = " + value);  
	}
```
```txt
1004 = zhaoliu
1003 = wangwu
1002 = lisi
1001 = zhangsan
```
## 用Lambda方式进行遍历
> [!NOTE] 
> 	使用(集合名).forEach(new BigConsumer<String,String>())
> 	底层：
> 	forEach其实是利用第二种方式进行遍历，依次得到每一个键和值
> 	再调用accept方法
```java
	Map<Integer, String> map = new HashMap<>();  
	map.put(1, "张三");  
	map.put(2, "李四");  
	map.put(3, "王五");  
	map.put(4, "赵六");  
	map.put(5, "钱七");  
	map.put(6, "孙八");  
	map.put(7, "周九");  
	map.put(8, "吴十");  
	map.put(9, "郑十一");  
	map.forEach((key, value) -> System.out.println(key + " = " + value));
```
```txt
	1 = 张三
	2 = 李四
	3 = 王五
	4 = 赵六
	5 = 钱七
	6 = 孙八
	7 = 周九
	8 = 吴十
	9 = 郑十一
```
