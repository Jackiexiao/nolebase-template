---

share: "true"
date modified: 2025年-12月-01日 19:19
created: 2025年-10月-22日 13:17
---
![Pasted image 20251022131847](../../img/Pasted%20image%2020251022131847.png)
![Pasted image 20251022131933](../../img/Pasted%20image%2020251022131933.png)
![Pasted image 20251022131947](../../img/Pasted%20image%2020251022131947.png)
## 底层原理

> [!NOTE]
> 	1、如果当前是第一次添加数据，底层会创建一个默认长度为16的，加载因子为0.75的数组
> 	2、如果不是第一次添加数据，会看数组中的元素是否达到了扩容的条件
> 		如果没有达到扩容条件，底层不会做任何操作
> 		如果达到了扩容条件，的车会把数组扩容为原先的两倍，并把数据全部转移到新的哈希表中

## 源码
![Pasted image 20251023202920](../../img/Pasted%20image%2020251023202920.png)
![Pasted image 20251023202942](../../img/Pasted%20image%2020251023202942.png)
![Pasted image 20251023203003](../../img/Pasted%20image%2020251023203003.png)
![Pasted image 20251023203025](../../img/Pasted%20image%2020251023203025.png)
![Pasted image 20251023203042](../../img/Pasted%20image%2020251023203042.png)
![Pasted image 20251023203059](../../img/Pasted%20image%2020251023203059.png)
