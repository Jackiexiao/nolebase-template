---
share: "true"
created: 2025年-12月-16日 21:00
date modified: 2025年-12月-16日 21:13
---

![](../../img/Pasted%20image%2020251216210205.png)

```Java
public class MyReflect01 {
    public static void main(String[] args) throws ClassNotFoundException {

        //第一种方式
        //最为常用的
        Class aClass = Class.forName("javaStudy.myreflect.Student");
        System.out.println(aClass);

        //第二种方式
        //一般更多的是当做参数进行传递
        Class studentClass = Student.class;
        System.out.println(studentClass);

        //第三种方式
        //当我们已经有了这个类的对象时，才可以使用
        Student student = new Student();
        Class<? extends Student> aClass1 = student.getClass();
        System.out.println(aClass1);
    }
}
```
