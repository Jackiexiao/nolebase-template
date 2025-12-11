---
share: "true"
created: 2025年-12月-03日 15:23
date modified: 2025年-12月-11日 20:36
---

<!-- prettier-ignore -->
> [!NOTE] 
> 	如果要使用多个组件，应该使用一个容器包装起来，不然程序无法运行

## 示例

```html
<template>
    <div class="todo-list-container">
        <TodoHeader></TodoHeader>
        <TodoFooter></TodoFooter>  
    </div>
</template>
```

# 在:class中的ref对象值不要用.value

```html
<div v-for="item in indexList" :key="item" class="index-container">
    <p :class="{active: item === index}">{{ item + 1 }}</p>
</div>

<script setup>
    const index = ref(0)
</script>
```

# `.map()`: 这是 JavaScript 数组的一个方法，它会遍历数组中的每一项，执行回调函数，并返回一个新数组。

```js
const indexList = imgLists.map((_, i) => i)
```

<!-- prettier-ignore -->
> [!NOTE] Title
> 	回调函数 `(_, i) => i`:
>		这个箭头函数接收两个参数：
>			* 第一个参数（通常是当前元素的值 item）：这里用下划线 _ 表示，意思是在这个函数里我不关心这个参数具体是什么（这是一个编程习惯，表示“占位符”或“忽略”）。
>			* 第二个参数 i：当前元素的索引（下标），即 0, 1, 2, ...。
>			函数体 `i`：直接返回索引值。

执行过程模拟
假设 imgLists 是 ['a.jpg', 'b.jpg', 'c.jpg']（长度为3）：

1. 遍历第 0 项 ('a.jpg') -> 忽略值，返回索引 0。
2. 遍历第 1 项 ('b.jpg') -> 忽略值，返回索引 1。
3. 遍历第 2 项 ('c.jpg') -> 忽略值，返回索引 2。

最终 indexList 得到的结果就是：`[0, 1, 2]`。
