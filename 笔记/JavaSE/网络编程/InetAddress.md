---
share: "true"
created: 2025年-12月-08日 15:02
date modified: 2025年-12月-08日 15:14
---

```Java
public class Network01 {
    public static void main(String[] args) throws UnknownHostException {
        InetAddress byName = InetAddress.getByName("www.baidu.com");
        System.out.println(byName);

        String hostName = byName.getHostName();
        System.out.println(hostName);

        String hostAddress = byName.getHostAddress();
        System.out.println(hostAddress);
    }
}
```
