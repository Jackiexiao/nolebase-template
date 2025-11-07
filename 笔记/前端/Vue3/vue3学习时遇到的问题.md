## 创建了新的.vue文件
## 1、要先到App.vue中引入文件
![[Pasted image 20250924205046.png]]
## 2、然后注册组件
![[Pasted image 20250924205339.png]]
## `@click`是vue监听事件的点击
```ts
	<button @click="showTel">查看联系方式</button>
```
## alert 是用于显示警告对话框
## setup中的this是undefined
```ts
	export default {
	  name: 'Person',
	}
```
	用于在Vue DevTools中显示组件名称（当前组件会显示为`<Person>`）
## ref定义基本类型数据（响应式）,对象类型数据
## reactive只能定义对象类型数据
## 定义对象
```ts
	let car = {name:"奔驰", price:"100000"}
```
## 声明布尔类型的变量
```ts
	// 正确写法
	const flag = ref(true)
```
## 接口
```ts
	export interface person {
	  name: string
	  age: number
	  sex: string
	}
```
## 泛型
```ts
	export type Persons = Array<PersonInter>
```
## 自定义类型
```ts
	export type Persons = PersonInter[]
```
## ：
```js
	<PropsTest a="123" :list="personList" />
```
```txt
- 你在这里调用了 PropsTest 组件，并且给它传递了两个信息：
       - a="123"：这叫静态 Prop。你就好像对 PropsTest 说：“喂，给你个字符串，内容就是‘123’”。
       - :list="personList"：这叫动态 Prop，也是精髓所在！
         - 你注意到了吗？list 前面有个冒号 :。这个冒号是 v-bind: 的简写，它是个“魔法”指令。
         - 它告诉 Vue：“冒号后面的 "personList" 可不是一个普通的字符串，而是我在楼下 <script>
           大脑里准备好的那个响应式数组！请把这个数组本身传递过去！”
         - 所以，这行代码的本质就是：父组件 `App.vue` 把自己的 `personList` 数据，通过一个叫做 `list` 的“通道”，传递给了子组件 
	         `PropsTest.vue`   
```
## :key
```
  这个 :key 就好比是给每个工人 <li> 分配一个唯一的身份证号。在这个例子里，你用的就是 person.name 作为身份证号。

   - 第一个 <li> 的身份证是 key="张三"
   - 第二个 <li> 的身份证是 key="李四"
   - 第三个 <li> 的身份证是 key="王五"
```

## 只接收1ist
```js
	defineProps(['list'])
```
## defineProps接收限制类型
```vue
	defineProps<{ list: Persons }>()
```
## 接收list + 限制类型 + 限制必要性 + 指定默认值
```vue
	withDefaults(defineProps<{ list?: Persons }>(), {
	  list: () => [{ name: '张三', age: 18, sex: '男' }],
})
```