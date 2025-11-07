## BigInteger
![[Pasted image 20251011110425.png]]
![[Pasted image 20251011110452.png]]
![[Pasted image 20251011110509.png]]
## BigInteger.valueOf()
	相比于第二种方法，表示的范围比较小，只能在long的取值范围之内，如果超出long的范围就不行了
	在内部对常用数字：-16 ~ 16 进行了内部优化。
	提前把-16 ~ 16 的数字创建好BigInteger的对象，如果多次获取不会创建新的

![[Pasted image 20251011112541.png]]
## BigInteger的方法
![[Pasted image 20251011112623.png]]
## BigDecimal
![[Pasted image 20251011124103.png]]
```java
	//1.通过传递double类型的小数来创建对象
	//细节:
	//这种方式有可能是不精确的，所以不建议使用
	BigDecimal bd1=new BigDecimal(val:0.01);
	BigDecimal bd2 =new BigDecimal(val:0.09);
	// system.out.println(bd1);
	// system.out.println(bd2);
	//2.通过传递字符串表示的小数来创建对象
	BigDecimal bd3 = new BigDecimal( val: "0.01");
	BigDecimal bd4 = new BigDecimal( val: "0.09");
	BigDecimal bd5 = bd3.add(bd4);
	System.out.println(bd3);
	System.out.println(bd4);
	System.out.println(bd5);
	//3.通过静态方法获取对象
	BigDecimal bd6 = BigDecimal.valueOf(10);
	System.out.println(bd6);
	//细节:
	//1.如果要表示的数字不大，没有超出double的取值范围，建议使用静态方法
	//2.如果要表示的数字比较大，超出了double的取值范围，建议使用构造方法
	//3.如果我们传递的是8~10之间的整数，包含8，包含1，那么方法会返回已经创建好的对象，不会重新new
```
## BigDecimal的使用
![[Pasted image 20251011124759.png]]
