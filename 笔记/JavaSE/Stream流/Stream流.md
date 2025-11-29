---
share: "true"
created: 星期一, 十月 27日 2025, 2:49:11 下午
date modified: 星期六, 十一月 29日 2025, 6:36:56 晚上
---
![Pasted image 20251027150608](../../img/Pasted%20image%2020251027150608.png)
![Pasted image 20251027150624](../../img/Pasted%20image%2020251027150624.png)
![Pasted image 20251027150638](../../img/Pasted%20image%2020251027150638.png)
```Java
ArrayList<String> list = new ArrayList<>();  
Collections.addAll(list,"a","b","c","d");  
//获取Stream流，并调用forEach方法打印数据
list.stream().forEach(s -> System.out.println(s));
```
## 双列集合获取Stream流
```Java
HashMap<String,Integer> hm = new HashMap<>();  
hm.put("zhangsan",18);  
hm.put("lisi",19);  
hm.put("wangwu",20);  
hm.put("zhaoliu",21);
//双列集合获取Stream流的方式一：通过可以Set（）获取键的Set集合，再获取Stream流  
hm.keySet().stream().forEach(s -> System.out.println(s));  
//双列集合获取Stream流的方式二：通过entrySet()获取键值对的Set集合，再获取Stream流  
hm.entrySet().stream().forEach(e -> System.out.println(e));
```
## 数组获取Stream流
```Java
int[] arr = {1,2,3,4,5,6,7,8,9,10};  
//数组获取Stream流的方式一：通过Arrays.stream()方法  
Arrays.stream(arr).forEach(i -> System.out.println(i));
```
## 零散数据获取Stream流
```java
//一堆零散数据获取Stream流(数据类型必须统一)  
Stream.of(1,2,3,4,5,6,7,8,9,10).forEach(i -> System.out.println(i));
```
## 注意

> [!NOTE] Title
> 	Stream接口中静态方法of的细节
> 	方法的形参是一个可变参数，可以传递一些零散的数据，也可以传递数组
> 	但是数组必须是引用数据类型的，如果传递基本数据类型，是会把整个数组当作一个元素，放到Stream当中。

## 总结
![Pasted image 20251030212411](../../img/Pasted%20image%2020251030212411.png)
