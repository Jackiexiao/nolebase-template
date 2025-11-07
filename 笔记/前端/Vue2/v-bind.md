![[Pasted image 20251029150309.png]]

```html
<div id="app">
    <p><img v-bind:src="imgUrl" /></p>
    <button @click="changeImg">切换图片</button>  
</div>
<script>
    const app = new Vue({
        el: '#app',

        data: {
            imgUrl: '../../img/113493359_p0.webp',
        },

        methods: {
            changeImg() {
                this.imgUrl = '../../img/116990705_p0.webp'
            },
        },
    })
</script>
```

## v-bind: 可以简写为 :

## v-bind操作class

![[PixPin_2025-11-05_14-15-13.png]]
![[PixPin_2025-11-05_14-15-57.png]]

<!-- prettier-ignore -->
```html
<div class="box" :class="{container:true}">   
    <h1>记事本</h1>
</div>
<div class="box" :class="['container']">      
    <h1>记事本</h1>
</div>
```

## 操作Style

![[PixPin_2025-11-05_14-40-19.png]]

```html
<div id="app">
       
    <div :style="{width:'400px',height:'400px'}"></div>
     
</div>
```
