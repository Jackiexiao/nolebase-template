---
share: "true"
created: 2025年-12月-09日 20:06
date modified: 2025年-12月-11日 12:13
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

# UDP的三种通信方式

![](../../img/Pasted%20image%2020251211111903.png)

## 组播

```Java
//发送端
public class Network06 {
    public static void main(String[] args) throws IOException {
        //创建MulticastSocket对象
        MulticastSocket ms = new MulticastSocket();
        //创建DatagramPacket对象
        String str = "hello world";
        byte[] bytes = str.getBytes();
        InetAddress address = InetAddress.getByName("224.0.1.1");
        int port = 10000;
        DatagramPacket dp = new DatagramPacket(bytes,bytes.length,address,port);
        //调用MulticastSocket的send方法发送DatagramPacket对象
        ms.send(dp);

        ms.close();
    }
}

//两个接收端
public class Network07 {
    public static void main(String[] args) throws IOException {
        MulticastSocket ms = new MulticastSocket(10000);
        InetAddress address = InetAddress.getByName("224.0.1.1");
        ms.joinGroup(address);
        byte[] bytes = new byte[1024];
        DatagramPacket dp = new DatagramPacket(bytes,bytes.length);
        ms.receive(dp);
        byte[] data = dp.getData();
        int len = dp.getLength();
        String str = new String(data,0,len);
        System.out.println(str);
        ms.close();
    }
}

public class Network08 {
    public static void main(String[] args) throws IOException {
        MulticastSocket ms = new MulticastSocket(10000);
        InetAddress address = InetAddress.getByName("224.0.1.1");
        ms.joinGroup(address);
        byte[] bytes = new byte[1024];
        DatagramPacket dp = new DatagramPacket(bytes,bytes.length);
        ms.receive(dp);
        byte[] data = dp.getData();
        int len = dp.getLength();
        String str = new String(data,0,len);
        System.out.println(str);
        ms.close();
    }
}
```
## 广播
就是将单播的地址改为255.255.255.255