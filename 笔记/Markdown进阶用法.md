---
tags: [markdown, 教程]
progress: 100
---

# Markdown进阶用法

## 基本语法回顾

Markdown是一种轻量级标记语言，它允许人们使用易读易写的纯文本格式编写文档，然后转换成有效的HTML文档。

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

### 强调

```markdown
*斜体* 或 _斜体_
**粗体** 或 __粗体__
***粗斜体*** 或 ___粗斜体___
```

### 列表

无序列表：
```markdown
- 项目1
- 项目2
  - 子项目A
  - 子项目B
```

有序列表：
```markdown
1. 第一项
2. 第二项
3. 第三项
```

## 进阶语法

### 表格

```markdown
| 表头1 | 表头2 | 表头3 |
| ----- | ----- | ----- |
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |
```

效果如下：

| 表头1 | 表头2 | 表头3 |
| ----- | ----- | ----- |
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |

### 代码块

````markdown
```javascript
function sayHello() {
  console.log("Hello, world!");
}
```
````

效果如下：

```javascript
function sayHello() {
  console.log("Hello, world!");
}
```

### 数学公式

VitePress支持使用KaTeX渲染数学公式：

```markdown
$E = mc^2$

$$
\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}
$$
```

效果如下：

$E = mc^2$

$$
\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}
$$

### 脚注

```markdown
这是一个带有脚注的文本[^1]

[^1]: 这是脚注的内容
```

这是一个带有脚注的文本[^1]

[^1]: 这是脚注的内容

### 任务列表

```markdown
- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个未完成任务
```

效果如下：

- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个未完成任务

## VitePress特有功能

### 自定义容器

```markdown
::: info
这是一个信息容器
:::

::: tip
这是一个提示容器
:::

::: warning
这是一个警告容器
:::

::: danger
这是一个危险容器
:::

::: details
这是一个详情容器，点击可展开
:::
```

效果如下：

::: info
这是一个信息容器
:::

::: tip
这是一个提示容器
:::

::: warning
这是一个警告容器
:::

::: danger
这是一个危险容器
:::

::: details
这是一个详情容器，点击可展开
:::

### 代码块行高亮

````markdown
```javascript{2}
function sayHello() {
  console.log("Hello, world!");
}
```
````

效果如下（第2行会被高亮）：

```javascript{2}
function sayHello() {
  console.log("Hello, world!");
}
```

## 结语

通过这篇文档，你应该对Markdown的基本和进阶用法有了更深入的了解。在Nólëbase知识库中，你可以充分利用这些语法来创建丰富多彩的笔记内容。