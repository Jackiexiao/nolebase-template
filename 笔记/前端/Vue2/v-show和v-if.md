![[Pasted image 20251029141637.png]]
![[Pasted image 20251029142528.png]]
```html
<p v-show="flag">hello vue</p>
```
![[Pasted image 20251029141646.png]]
![[Pasted image 20251029142547.png]]
```html
<p v-if="flag">hello vue</p>
```
## v-if 和 v-show的区别
> [!NOTE] Title
> v-if隐藏时，会直接移除整个标签
> ![[Pasted image 20251029142323.png]]
> v-show隐藏时，是调用display的none属性进行隐藏，是通过css空中的
![[Pasted image 20251029142441.png]]
