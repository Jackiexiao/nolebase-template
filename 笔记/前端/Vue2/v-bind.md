---
share: "true"
created: 2025年-10月-29日 15:01
date modified: 2025年-12月-01日 19:11
---
![Pasted image 20251029150309](../../img/Pasted%20image%2020251029150309.png)

<!-- HTML block removed for debugging -->
## v-bind: 可以简写为 :

## v-bind操作class

![PixPin_2025-11-05_14-15-13](../../img/PixPin_2025-11-05_14-15-13.png)
![PixPin_2025-11-05_14-15-57](../../img/PixPin_2025-11-05_14-15-57.png)

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

![PixPin_2025-11-05_14-40-19](../../img/PixPin_2025-11-05_14-40-19.png)

```html
<div id="app">
       
    <div :style="{width:'400px',height:'400px'}"></div>
     
</div>
```
