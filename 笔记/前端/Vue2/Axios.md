---
share: "true"
created: 星期二, 十一月 18日 2025, 4:25:44 下午
date modified: 星期六, 十一月 29日 2025, 6:32:52 晚上
---

# 引入Axios

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

# Axios的基本用法

```js
//get请求
axios
    .get('/api/data')
    .then((response) => {
        console.log(response.data)
    })
    .catch((error) => {
        console.error(error)
    })
//post请求
axios
    .post('/api/data', {
        name: 'John',
        age: 30,
    })
    .then((response) => {
        console.log(response.data)
    })
    .catch((error) => {
        console.error(error)
    })
//put请求
axios
    .put('/api/data/1', {
        name: 'John',
        age: 31,
    })
    .then((response) => {
        console.log(response.data)
    })
    .catch((error) => {
        console.error(error)
    })
//delete请求
axios
    .delete('/api/data/1')
    .then((response) => {
        console.log(response.data)
    })
    .catch((error) => {
        console.error(error)
    })
```