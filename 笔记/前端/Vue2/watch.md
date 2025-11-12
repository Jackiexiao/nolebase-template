---
share: "true"
---

![](../../img/Pasted%20image%2020251112140541.png)

```js
<script>
  const app = new Vue({
    el: '#app',
    data: {
      // inputText:''
      obj:{
        inputText:''
      }
    },
    watch: {
      'obj.inputText'(newValue, oldValue) {
        console.log("变化了",newValue, oldValue)
      }
    }
  })

</script>
```

# 完整写法

![](../../img/Pasted%20image%2020251112143858.png)

```js
<script>
const app = new Vue({
  el: '#app',
  data:{
    obj:{
      inputText:'',
      lang:'english'
    }
  },
  watch:{
    obj:{
      deep:true,
      //页面加载时或刷新时会立马执行一次
      immediate:true,
      handler(newValue){
        console.log("watch被调用了",newValue)
      }
    }
  }
})
</script>
```
![](../../img/Pasted%20image%2020251112145153.png)
