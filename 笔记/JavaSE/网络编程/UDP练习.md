---
share: "true"
created: 2025年-12月-09日 20:46
date modified: 2025年-12月-09日 20:50
---

![](../../img/Pasted%20image%2020251209204652.png)

```Java
public class Network04 {
    public static void main(String[] args) throws IOException {
        Scanner sc = new Scanner(System.in);
        StringBuilder sb = new StringBuilder();
        while (true) {
            System.out.println("请输入（输入886结束）：");
            String s = sc.nextLine();
            if ("886".equals(s)) {
                break;
            }
            sb.append(s);
        }
        sc.close();
        DatagramSocket ds = new DatagramSocket();
        String str = sb.toString();
        byte[] bytes = str.getBytes();
        InetAddress byName = InetAddress.getByName("127.0.0.1");
        int port = 10086;

        DatagramPacket dp = new DatagramPacket(bytes,bytes.length,byName,port);
        ds.send(dp);
        ds.close();
    }
}
```

```Java
public class Network05 {
    public static void main(String[] args) throws IOException {
        DatagramSocket ds = new DatagramSocket(10086);
        byte[] bytes = new byte[1024*1024*8];
        DatagramPacket dp = new DatagramPacket(bytes,bytes.length);
        byte[] data;
        while (true) {
            ds.receive(dp);
            data= dp.getData();
            if (data.length != 0){
                break;
            }
        }
        // --- 核心修改 ---        // dp.getData(): 获取缓冲区数组
        // 0: 从数组的第0个索引开始
        // dp.getLength(): 只截取实际接收到的长度！！
        String str = new String(data,0,dp.getLength());
        System.out.println(str);
        ds.close();
    }
}
```

<!-- prettier-ignore -->
> [!NOTE] 注意
> 	这是一个非常经典的 UDP 编程错误。造成接收数据乱码（或者后面跟随大量空白/方框）的主要原因在于：**你在构建字符串时，使用了整个缓冲区数组，而没有指定实际接收到的数据长度。**
