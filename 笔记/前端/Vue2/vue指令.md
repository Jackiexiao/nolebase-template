---
share: "true"
created: 星期三, 九月 24日 2025, 2:43:27 下午
date modified: 星期六, 十一月 29日 2025, 6:32:52 晚上
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
