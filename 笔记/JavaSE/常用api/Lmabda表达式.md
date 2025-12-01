---

share: "true"
date modified: 2025年-12月-01日 19:30
created: 2025年-10月-17日 18:41
---
## 函数式编程
![Pasted image 20251017184610](../../img/Pasted%20image%2020251017184610.png)
## Lambda的格式
![Pasted image 20251017184654](../../img/Pasted%20image%2020251017184654.png)
![Pasted image 20251017184741](../../img/Pasted%20image%2020251017184741.png)
![Pasted image 20251017185446](../../img/Pasted%20image%2020251017185446.png)
## Lambda表达式的省略写法
![Pasted image 20251017185538](../../img/Pasted%20image%2020251017185538.png)
```txt
lambda的省略规则:
	1.参数类型可以省略不写。
	2.如果只有一个参数，参数类型可以省略，同时()也可以省略。
	3.如果Lambda表达式的方法体只有一行，大括号，
	分，return可以省略不写，需要同时省略。
```
```java
Integer[] arr = {2, 3, 1, 5, 6, 7, 8, 4, 9};  
Arrays.sort(arr,(Integer o1, Integer o2) -> {  
        return o1 - o2;  
    }  
);  
//省略格式
Arrays.sort(arr, (Integer o1, Integer o2) -> o1 - o2);  
System.out.println(Arrays.toString(arr));
```
![Pasted image 20251017190015](../../img/Pasted%20image%2020251017190015.png)
