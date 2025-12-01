---

share: 'true'
date modified: 2025年-12月-01日 19:19
created: 2025年-11月-10日 15:17
---

- **`Collection` 是一个接口**（根接口）。
- **`Collections` 是一个工具类**。

### `Collection` (接口)

`Collection` 是Java集合框架的**根接口**之一（另一个是`Map`）。它代表了单个对象的集合。

1. **它是什么？**
    - 它是一个位于 `java.util` 包下的**接口**。
    - 它定义了所有单列集合（即每个元素都是一个独立对象）所必须遵守的基本通用方法。

2. **主要子接口：**
    - **`List`**: 有序、可重复的集合。 (例如： `ArrayList`, `LinkedList`)
    - **`Set`**: 无序、不可重复的集合。 (例如： `HashSet`, `TreeSet`)
    - **`Queue`**: 队列，遵循特定的 FIFO 或其他顺序规则。 (例如： `PriorityQueue`)

3. **它声明的方法（举例）：**
    - `add(E e)`: 向集合中添加一个元素。
    - `remove(Object o)`: 从集合中移除一个元素。
    - `size()`: 返回集合中元素的数量。
    - `isEmpty()`: 判断集合是否为空。
    - `iterator()`: 返回一个用于遍历集合的迭代器。
    - `contains(Object o)`: 判断集合是否包含某个元素。

```Java
// Collection 是一个接口，所以不能直接实例化
// 但我们可以用它的子类，比如 ArrayList
Collection<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");

System.out.println(names.size()); // 输出: 3
for (String name : names) {
    System.out.println(name);
}
```

### `Collections` (工具类)

`Collections` 是一个专门用于操作和处理**Collection接口及其子类**的**工具类**。

1. **它是什么？**
    - 它是一个位于 `java.util` 包下的**最终类**。
    - 它提供了一系列**静态方法**，用于对集合进行各种操作，如排序、搜索、同步化、不可变化等。
    - **构造函数是私有的**，所以你无法创建 `Collections` 的实例。

2. **它提供的常用静态方法（举例）：**
    - **排序**: `sort(List<T> list)` - 对列表进行升序排序。
    - **查找**: `binarySearch(List<? extends Comparable<? super T>> list, T key)` - 在已排序的列表中进行二分查找。
    - **同步化（线程安全）**: `synchronizedList(List<T> list)` - 将一个普通List包装成线程安全的List。
    - **不可变集合**: `unmodifiableList(List<? extends T> list)` - 返回一个不可修改的视图，常用于创建常量集合。
    - **反转**: `reverse(List<?> list)` - 反转列表中元素的顺序。
    - **随机打乱**: `shuffle(List<?> list)` - 随机打乱列表中的元素顺序。
    - **填充**: `fill(List<? super T> list, T obj)` - 用指定的元素替换列表中的所有元素。

```Java
List<Integer> numbers = new ArrayList<>();
numbers.add(5);
numbers.add(1);
numbers.add(9);
numbers.add(3);

// 使用 Collections 类的静态方法进行排序
Collections.sort(numbers);
System.out.println(numbers); // 输出: [1, 3, 5, 9]

// 反转列表
Collections.reverse(numbers);
System.out.println(numbers); // 输出: [9, 5, 3, 1]

// 创建一个线程安全的列表
List<String> synchronizedList = Collections.synchronizedList(new ArrayList<>());

// 创建一个不可修改的列表（只读列表）
List<String> unmodifiableList = Collections.unmodifiableList(Arrays.asList("A", "B", "C"));
// unmodifiableList.add("D"); // 这行代码会抛出 UnsupportedOperationException
```

### 总结对比

| 特性               | `Collection` (接口)                         | `Collections` (工具类)                                    |
| ------------------ | ------------------------------------------- | --------------------------------------------------------- |
| **类型**           | **接口**                                    | **最终类**                                                |
| **用途**           | 定义**单个对象集合**的通用行为              | 提供操作集合的**静态工具方法**                            |
| **包含内容**       | 声明了 `add()`, `remove()`, `size()` 等方法 | 提供了 `sort()`, `reverse()`, `synchronizedList()` 等方法 |
| **实例化**         | 不能实例化，由其子类（如 `ArrayList`）实现  | 不能且不需要实例化，所有方法都是静态的                    |
| **在架构中的位置** | 集合框架的**根**                            | 集合框架的**辅助工具**                                    |

**简单记忆：**

- 你想要操作一个集合本身（添加、删除元素），就用 `Collection` 接口声明的方法。
- 你想对一个集合进行一些**高级操作**（排序、查找、线程安全），就去 `Collections` 工具类里找静态方法。
