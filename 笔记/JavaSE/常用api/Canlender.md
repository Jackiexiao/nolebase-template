---
share: "true"
created: 星期三, 十月 15日 2025, 1:01:20 下午
date modified: 星期六, 十一月 29日 2025, 6:36:56 晚上
---
![Pasted image 20251015130212](../../img/Pasted%20image%2020251015130212.png)

## 细节

```txt
	//1.获取日历对象
	//细:1:Calendar是一个抽象类，不能直接new，而是通过一个静态方法获取到子类对象
	//底层原理:
	//会根据系统的不同时区来获取不同的日历对象,默认表示当前时间。
	//把会把时间中的纪元，年，月，日，时，分，秒，星期，等等的都放到一个数组当中
	//细节2:
	//月份:范围0~11 如果获取出来的是0.那么实际上是1月。
	//星期:在老外的眼里，星期日是一周中的第一天
	1(星期日)2(星期一)3(星期二)4(星期三)5(星期四)6(星期五)7(星期六)
```

```Java
// 获取当前时间的Calendar实例
Calendar calendar = Calendar.getInstance();
// 获取指定时区的Calendar实例
Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("GMT+8"));
// 获取指定地区的Calendar实例
Calendar calendar = Calendar.getInstance(Locale.CHINA);
// 获取年份
int year = calendar.get(Calendar.YEAR);
// 获取月份（注意：月份从0开始，0表示1月，11表示12月）
int month = calendar.get(Calendar.MONTH);
```

## JDK8 增加的时间相关类

![Pasted image 20251016102852](../../img/Pasted%20image%2020251016102852.png)
![Pasted image 20251016102925](../../img/Pasted%20image%2020251016102925.png)

## ZoneId时区

![Pasted image 20251016103037](../../img/Pasted%20image%2020251016103037.png)

## Instant时间戳

![Pasted image 20251016103440](../../img/Pasted%20image%2020251016103440.png)

## ZoneDateTime带时区的时间

![Pasted image 20251016104037](../../img/Pasted%20image%2020251016104037.png)

## 细节

```txt
	//细节:
	//JDK8新增的时间对象都是不可变的
	//如果我们修改了，减少了，增加了时间
	//那么调用者是不会发生改变的，产生一个新的时间。
```

## DateTimeFormatter

![Pasted image 20251016104357](../../img/Pasted%20image%2020251016104357.png)

## LocalDate、LocalTime、LocalDateTime

![Pasted image 20251016104739](../../img/Pasted%20image%2020251016104739.png)

```txt
	* LocalDate: 只包含日期（年-月-日）。
	* LocalTime: 只包含时间（时-分-秒）。
	* LocalDateTime: 包含日期和时间（年-月-日 时-分-秒）。
```

```Java
LocalDate date = LocalDate.now();
System.out.println( date);
```

## 工具类

![Pasted image 20251016105426](../../img/Pasted%20image%2020251016105426.png)
