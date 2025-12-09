---
share: "true"
created: 2025年-12月-09日 20:06
date modified: 2025年-12月-09日 20:24
---

![](../../img/Pasted%20image%2020251209200745.png)

```Java
public class Network02 {
    public static void main(String[] args) throws IOException {
        DatagramSocket ds = new DatagramSocket();
        String str = "hello";
        byte[] bytes = str.getBytes();
        InetAddress address = InetAddress.getByName("127.0.0.1");
        int port = 10086;
        DatagramPacket dp = new DatagramPacket(bytes,bytes.length,address,port);
        ds.send(dp);
        ds.close();
    }
}
```

![](../../img/Pasted%20image%2020251209201551.png)

```Java
public class Network03 {
    public static void main(String[] args) throws IOException {
        //在接收的时候，一定要绑定端口
        //而且绑定的端口一定要跟发送的端口保持一致
        DatagramSocket ds = new DatagramSocket(10086);
        byte[] bytes = new byte[1024];
        DatagramPacket dp = new DatagramPacket(bytes,bytes.length);
        //该方法是阻塞的
        //程序执行到这一步的时候，会在这里死等
        // 等发送端发送消息
        ds.receive(dp);

        int len = dp.getLength();
        byte[] data = dp.getData();
        String str = new String(data,0,len);
        System.out.println(str);
        ds.close();
    }
}
```
