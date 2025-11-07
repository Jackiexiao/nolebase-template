## 帮助我们用于数学计算的工具类
## Math的常用方法![[Pasted image 20251009161658.png]]
## Math的bug
![[Pasted image 20251009162007.png]]
## 1. 使用 `Math.pow()` 方法（最常用）

```java
	double result = Math.pow(2, 3); // 2的3次方 = 8
	double result2 = Math.pow(5.5, 3); // 5.5的3次方
```
## 2. 直接相乘（性能更好）

```java
	double x = 2;
	double result = x * x * x; // 8
```