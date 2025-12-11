---
share: "true"
created: 2025年-12月-11日 12:12
date modified: 2025年-12月-11日 12:52
---

![](../../img/Pasted%20image%2020251211121357.png)
![](../../img/Pasted%20image%2020251211121435.png)

```Java
public class Network09 {
    public static void main(String[] args) throws IOException {
        Socket socket = new Socket("127.0.0.1",10086);

        OutputStream os = socket.getOutputStream();
        os.write("hello server".getBytes());
        os.close();
        socket.close();
    }
}

public class Network10 {
    public static void main(String[] args) throws IOException {
        ServerSocket ss = new ServerSocket(10086);
        //监听客户端连接
        Socket accept = ss.accept();
        //从连接通道获取数据
        InputStream is = accept.getInputStream();
        //解决中文乱码
		InputStreamReader isr = new InputStreamReader(is,"utf-8");
        int b;
        while ((b = isr.read()) != -1) {
            System.out.print((char) b);
        }
        accept.close();
        ss.close();
    }
}
```
![](../../img/Pasted%20image%2020251211125211.png)
