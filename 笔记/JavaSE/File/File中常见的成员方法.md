---

share: "true"
date modified: 2025年-12月-01日 19:19
created: 2025年-11月-01日 10:42
---
![Pasted image 20251101104313](../../img/Pasted%20image%2020251101104313.png)

<!-- prettier-ignore -->
> [!NOTE] Title
> 	lenth 返回文件大小
> 		细节一：这个方法只能获取文件大小，单位是字节
> 			如果单位我们是要M，G可以不断除1024
> 		细节二：这个方法无法获取文件夹大小
> 			如果我们要获取文件夹大小，只能累加文件夹中所有的文件大小

![Pasted image 20251101105908](../../img/Pasted%20image%2020251101105908.png)
![Pasted image 20251101105935](../../img/Pasted%20image%2020251101105935.png)

<!-- prettier-ignore -->
> [!NOTE] Title
> 	createNewFile 
> 		细节1：如果当前路径表示的文件不存在，则创建成功，返回true
> 			如果存在，则创建失败，返回false
> 		细节2：如果父级路径不存在，则会返回IOException异常
> 		细节3：这个方法创建的一定是文件，如果路径不包含后缀名，则会创建一个没有后缀名的文件

```Java
File file = new File("C:\\Users\\风铃\\Desktop\\test\\test.txt");
System.out.println(file.createNewFile());
```

<!-- prettier-ignore -->
> [!NOTE] mkdir
> 	细节1：windows中路径是唯一的，如果路径已经存在，会创建失败，并返回false
> 	细节2：不能创建多级目录

<!-- prettier-ignore -->
> [!NOTE] mkdirs
> 	既可以创建单级目录也可以创建多级目录

<!-- prettier-ignore -->
> [!NOTE] delete
> 	如果删除的是文件和空文件夹，会直接删除不会经过回收站
> 	如果删除的是有文件的文件夹，则删除失败

![Pasted image 20251101112734](../../img/Pasted%20image%2020251101112734.png)
![Pasted image 20251101113053](../../img/Pasted%20image%2020251101113053.png)

```Java
File file = new File("C:\\Users\\风铃\\Desktop\\test");
File[] files = file.listFiles(new FileFilter() {
    @Override
    public boolean accept(File pathname) {
        return pathname.isFile() && pathname.getName().endsWith(".avi");
    }
});
System.out.println(Arrays.toString(files));
```

![Pasted image 20251101104254](../../img/Pasted%20image%2020251101104254.png)
