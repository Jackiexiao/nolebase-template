---
share: "true"
---
![Pasted image 20251029143009](../../img/Pasted%20image%2020251029143009.png)

## 1、

```html
<p>{{ count }}</p>
<button v-on:click="count++">点我加一</button>
<!-- v-on:可以替换为@ -->
<button @click="count++">点我加一</button>
```

## 2、

```html
<div id="app">
       
    <p>{{ count }}</p>
        <button @click="add">点我加一</button>
</div>
<script>
    const app = new Vue({
        el: '#app',
        data: {
            count: 0,
        },
        methods: {
            add() {
                this.count++
            },
        },
    })
</script>
```

## v-on调用传参

```html
<div id="app">
    <h1>小黑自动贩卖机</h1>
    <p>当前余额：{{money}}元</p>
    <button @click="sale(5)">可乐五元</button>    
    <button @click="sale(10)">coffe十元</button>
</div>
<script>
    const app = new Vue({
        el: '#app',

        data: {
            money: 999,
        },

        methods: {
            sale(price) {
                if (this.money >= price) {
                    this.money -= price
                }
            },
        },
    })
</script>
```
