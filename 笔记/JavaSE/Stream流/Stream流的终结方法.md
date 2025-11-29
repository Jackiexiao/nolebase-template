---
share: "true"
created: 星期四, 十月 30日 2025, 8:17:26 晚上
date modified: 星期六, 十一月 29日 2025, 6:36:56 晚上
---
![Pasted image 20251030201801](../../img/Pasted%20image%2020251030201801.png)

```Java
ArrayList<String> list = new ArrayList<>();
Collections.addAll(list,"张三-18","李四-19","王五-20");
//Consumer的泛型：表示流中数据的类型
//accept方法的形参s：依次表示流里的每一个数据
//方法体：对每一个数据的处理操作（打印）
list.forEach(new Consumer<String>() {
    @Override
    public void accept(String s) {
        System.out.println(s);
    }
});

//IntFunction的泛型：具体类型的数组
//apply方法的形参：流中数据的个数，要跟数组的长度保持一致
//apply的返回值：具体类型的数组
//方法体：就是创建数组

//toArray方法的参数的作用：负责创建一个指定类型的数组
//toArray 方法的底层，会依次得到流里面的每一个数据，并把数据放到数组中
//toArrayd返回值：是一个装着流里面所有数据的数组
String[] array = list.stream().toArray(new IntFunction<String[]>() {
    @Override
    public String[] apply(int value) {
        return new String[value];
    }
});
```

```java
List<String> collect01 = list.stream()
        .filter(s -> "男".equals(s.split("-")[1]))
        .collect(Collectors.toList());
System.out.println(collect01);

Set<String> collect02 = list.stream()
        .filter(s -> "女".equals(s.split("-")[1]))
        .collect(Collectors.toSet());
System.out.println(collect02);
```

## 收集为Map集合

```java
Map<String, String> map = list.stream()
        .filter(s -> "男".equals(s.split("-")[1]))
        .collect(Collectors.toMap(new Function<String, String>() {
                                      @Override
                                      public String apply(String s) {
                                          return s.split("-")[0];
                                      }
                                  },
                new Function<String, String>() {
                    @Override
                    public String apply(String s) {
                        return s.split("-")[1];
                    }
                }));
```

### 注意点

<!-- prettier-ignore -->
> [!NOTE] Title
> 	toMap：参数一表示键的生成规则
> 			参数二表值的生成规则
> 	参数一：
> 		Function：
> 			泛型一：表示流中每一个数据的类型
> 			泛型二：表示Map集合中键的数据类型
> 	方法apply形参：依次表示流里面的每一个数据
> 		方法体：生成键的代码
> 		返回值：已经生成的键
> 	参数二：
> 		Function：
> 			泛型一：表示流中每一个数据的类型
> 			泛型二：表示Map集合中值的数据类型
> 	方法apply形参：依次表示流里面的每一个数据
> 		方法体：生成值的代码
> 		返回值：已经生成的值
> 	注意点：
> 		如果要收集到map集合中，键不能重复，否则会报错
