---
share: "true"
created: 2025年-09月-24日 14:43
date modified: 2025年-12月-01日 19:11
---
![Pasted image 20250924144440](../../img/Pasted%20image%2020250924144440.png)
## v-html

> [!NOTE] Title
> 设置元素的innerHTML
> 语法：v-html="表达式"
```html
<p v-html="msg"></p>
<script>
  const app = new Vue({
    el: '#app',
    data:{
      msg:`<a href="https://www.baidu.com">百度</a>`
    }
  })
</script>
```
![Pasted image 20251029141341](../../img/Pasted%20image%2020251029141341.png)
