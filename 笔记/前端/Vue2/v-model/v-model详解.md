---
share: "true"
created: 2025年-12月-09日 16:44
date modified: 2025年-12月-16日 16:14
---

# v-model的原理

![](../../../img/Pasted%20image%2020251209164621.png)
$event可以获取事件的形参

# 表单类组件封装&v-model简化代码

![](../../../img/Pasted%20image%2020251210140846.png)
![](../../../img/Pasted%20image%2020251216160517.png)

# 父组件

```html
<template
    > 
    <div>
        <!-- <StudyDemo02 :selectedID = "selectedID" @change="handleChange"></StudyDemo02> -->
        <StudyDemo02 v-model="selectedID"></StudyDemo02>
    </div>
</template>

<script>
    import StudyDemo02 from './StudyDemo02.vue'

    export default {
        components: {
            StudyDemo02,
        },

        data() {
            return {
                selectedID: '102',
            }
        },

        methods: {
            handleChange(newID) {
                this.selectedID = newID
            },
        },
    }
</script>
```

# 字组件

```html
<template>
     
    <div>
         
        <select @change="handleChange" :value="value">
               
            <option value="101">上海</option>
             
            <option value="102">北京</option>
             
            <option value="103">广州</option>
             
            <option value="104">深圳</option>
                 
            <option value="105">成都</option>
               </select
        > 
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                type: String,
            },
        },

        methods: {
            handleChange(e) {
                this.$emit('input', e.target.value)
            },
        },
    }
</script>
```
![](../../../img/Pasted%20image%2020251216161433.png)
