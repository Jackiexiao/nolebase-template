![[Pasted image 20250923154858.png]]
## vue的两种使用方式
![[Pasted image 20250923155017.png]]
## 创建vue实例，初始化渲染
![[Pasted image 20250923155318.png]]
![[Pasted image 20250923155652.png]]
## 通过el属性指定vue实例管理的页面元素
![[Pasted image 20250923160428.png]]

> [!NOTE] Title
> el后面写的是选择器的名称
> 通过data传递数据

```html
<div id = app>
	{{ name }}
</div>
<script>
	const app = new Vue({
		el: '#app',
		data: {
		  name:"hello vue"
		}
	})
</script>
```
