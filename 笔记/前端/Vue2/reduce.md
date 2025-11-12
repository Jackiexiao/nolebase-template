---
share: "true"
---

```js
//sum : 表示中间量
//item : 集合中每一项
//初始会将0赋值给sum
//之后不断将sum+item的值赋值给sum
const total = this.scoreList.reduce((sum, item) => sum + item.score, 0)
```
