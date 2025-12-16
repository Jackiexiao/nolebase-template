---
share: "true"
created: 2025年-12月-16日 16:29
date modified: 2025年-12月-16日 16:47
---

![](../../../img/Pasted%20image%2020251216163049.png)
![](../../../img/Pasted%20image%2020251216164459.png)

# 获取组件实例

![](../../../img/Pasted%20image%2020251216164724.png)

# APP.vue

```html
<template>
     
    <div>
            <StudyDemo02 ref="oprationData"></StudyDemo02>

            <button @click="getValues">获取数据</button>

            <button @click="resetValues">重置数据</button>

         
    </div>
</template>

<script>
    import StudyDemo02 from './components/Study09/StudyDemo02.vue'

    export default {
        components: {
            StudyDemo02,
        },

        methods: {
            getValues() {
                console.log(this.$refs.oprationData.getValues())
            },

            resetValues() {
                this.$refs.oprationData.resetValues()
            },
        },
    }
</script>
```

# 子组件

```html
<template>
     
    <div>
            <input type="text" v-model="username" />

            <br />

            <input type="text" v-model="password" />

            <br />

         
    </div>
</template>

<script>
    export default {
        data() {
            return {
                username: '',

                password: '',
            }
        },

        methods: {
            getValues() {
                return {
                    username: this.username,

                    password: this.password,
                }
            },

            resetValues() {
                this.username = ''

                this.password = ''
            },
        },
    }
</script>
```
