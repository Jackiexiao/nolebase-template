---
share: "true"
created: 2025年-12月-03日 13:21
date modified: 2025年-12月-03日 14:56
---

![](../../../img/Pasted%20image%2020251203132244.png)

# props校验

![](../../../img/Pasted%20image%2020251203133425.png)

```html
//父组件
<script>
    import StudyDemo02 from './StudyDemo02.vue'

    export default {
        components: {
            StudyDemo02,
        },

        data() {
            return {
                name: '张三',
            }
        },
    }
</script>

//子组件
<script>
    export default {
        props: {
            name: String,
        },
    }
</script>
```

# 完整写法

```Java
<script>
export default {
	props:{
		name:{
			type:Number,
			default:0,
			validator(value){
			// value是传递过来的属性值
			return value >= 0
			}
		}
	}
}
</script>
```
