---
share: "true"
created: 2025年-12月-17日 14:33
date modified: 2025年-12月-17日 14:51
---

![](../../../img/Pasted%20image%2020251217144254.png)

```html
<template>
     
    <div>
           
        <div v-if="isShow">
                 
            <p>{{ title }}</p>
            <button @click="changeShow">编辑</button>    
        </div>

           
        <div v-else>
            <input ref="inp" type="text" placeholder="请输入标题" />      
            <button @click="confirm">确认</button>    
        </div>
         
    </div>
</template>

<script>
    export default {
        data() {
            return {
                isShow: true,
                title: '大标题',
            }
        },

        methods: {
            changeShow() {
                this.isShow = false
                this.$nextTick(() => {
                    this.$refs.inp.focus()
                })
            },
            confirm() {
                this.title = this.$refs.inp.value
                this.isShow = true
            },
        },
    }
</script>
```
