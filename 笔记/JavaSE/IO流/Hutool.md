---
share: "true"
---

![](../../img/Pasted%20image%2020251117150746.png)

# FileUitl

![](../../img/Pasted%20image%2020251117175616.png)

```Java
//注意导包不要导错了
import cn.hutool.core.io.FileUtil;

import java.io.File;

public class IODemo37 {
    public static void main(String[] args) {
        File file = FileUtil.file("F:\\test", "aaa", "bbb", "c.txt");
        System.out.println(file);
        File touch = FileUtil.touch(file);
        System.out.println(touch);
    }
```
