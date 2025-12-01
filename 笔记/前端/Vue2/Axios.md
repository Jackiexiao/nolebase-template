---
share: "true"
created: 2025年-11月-18日 16:25
date modified: 2025年-12月-01日 19:11
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