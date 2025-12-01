---

share: 'true'
date modified: 2025年-12月-01日 19:19
created: 2025年-11月-10日 14:25
---

1. **将 List 转换为数组**
2. **调用 `Arrays.sort()` 对这个数组进行排序**
3. **使用 ListIterator 将排序后的数组元素写回原 List**

```java
import java.util.*;

public class CollectionsSortDemo {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6));

        // 使用自然顺序排序（底层调用 TimSort）
        Collections.sort(numbers);
        System.out.println("自然顺序: " + numbers); // 输出: [1, 1, 2, 3, 4, 5, 6, 9]

        List<String> words = new ArrayList<>(Arrays.asList("banana", "apple", "cherry"));

        // 使用自然顺序排序（String 的字典序）
        Collections.sort(words);
        System.out.println("字典顺序: " + words); // 输出: [apple, banana, cherry]

        // 使用自定义 Comparator 排序（按字符串长度）
        Collections.sort(words, (a, b) -> a.length() - b.length());
        System.out.println("按长度排序: " + words); // 输出: [apple, banana, cherry] (此例中长度恰好相同)

        // 更清晰的例子
        words = new ArrayList<>(Arrays.asList("fig", "apple", "dates", "banana"));
        Collections.sort(words, (a, b) -> a.length() - b.length());
        System.out.println("按长度排序: " + words); // 输出: [fig, apple, dates, banana] (注意： apple 和 dates 长度相同，相对顺序不变，体现了稳定性)
    }
}
```

## 自定义排序

```txt 数据源
5、推着那辆叮当作响的旧自行车走出校门时，西边的天正烧得灿烂。不是那种羞怯的绯红，也不是薄暮时分清冷的淡紫，而是一种近乎悲壮的、豁出一切去的金黄。光线变得分外浓稠，流泻下来，不像正午时那般泼辣辣的，倒像是熬了许久的、温润的蜜糖，把街道、楼房、行人的衣衫，都镀上了一层柔和的光边。
2、我的影子，就在这时，被这夕光长长地、斜斜地抛在了身前
7、它不再是午时脚下那团畏缩的、清晰的墨团了。它被拉得那么长，线条是朦胧的，边缘带着些毛茸茸的虚光，像一个胆怯而又忍不住要伸展的梦。我的头，我的肩膀，我扶着车把的手，都在身前那片灰扑扑的水泥地上，被放大成一个有些陌生的、颀长的形状。我走，它也走，不疾不徐的，总在我前头那么几步远的地方引着，像一个沉默的、忠实的同伴。
1、我不由得玩心起来，故意将车轮往它“头”上碾去，它便顺从地让开，从轮辐间流过去，丝毫无损；我快跑几步，想追上它，它却也倏地加速，永远保持着那段优雅的距离。这游戏，我仿佛在很小的时候是常玩的。那时我矮矮的，影子也短短的，在老家院子的泥地上，追着一只蜻蜓或是祖母养的芦花鸡，那小小的影子便在我脚边欢快地打着旋儿。那时的快乐是实在的，是抓在手里的泥巴与跑起来时耳边呼呼的风。而今，这被拉长的、缥缈的影子，带来的却是一种说不清的、淡淡的怅惘了。
8、我停下来，它也停下来，静静地卧着。我看着它，忽然觉得，这或许不全是我的影子。那里面，是不是也叠着一些别人的影子呢？譬如，那个许多年前，同样在这条放学路上，背着布书包，一边踢着石子一边回家的父亲的影子？又或者，是那个曾在书里读到的，在古道上牵着瘦马，望着夕阳的西风游子的影子？光是一样的光，影子大约也是一样的寂寞罢。
4、风起来了，路旁的梧桐叶子沙沙地响着，筛下些破碎的光斑。我的影子也跟着轻轻晃动，仿佛有了生命，在呼吸一般。我抬起头，看见那轮太阳，已经快要挨着远处工厂的烟囱了。它收敛了刺眼的光芒，只剩下一个红彤彤的、温软的圆，像一枚将要熟透的、汁水饱满的果子，安静地悬在那里，等待着最后的蒂落。
3、我知道，用不了多久，这满世界的辉煌便要谢幕了。影子会先我一步，被愈来愈浓的暮色吞没，然后路灯会亮起，投下一个个新的、环绕在脚边的、小而坚定的光圈。那是属于夜晚的热闹。而此刻，这夕照，这长风，这长长的、只属于我一个人的影子，却是一种庄严的告别。
6、我重新扶稳了车把，没有再去看它。但我能感觉到，它依旧在我身前，随着我的步伐，在渐暗的路面上，从容地、安静地滑行着，像一条船，正渡着这白日与黑夜之间，最后一片光的河流。
11、我重新扶稳了车把，没有再去看它。但我能感觉到，它依旧在我身前，随着我的步伐，在渐暗的路面上，从容地、安静地滑行着，像一条船，正渡着这白日与黑夜之间，最后一片光的河流。
```

```Java 自定义排序
BufferedReader br = new BufferedReader(new FileReader("src/javaStudy/MyIO/a.txt"));
String str = br.readLine();
ArrayList<String> list= new ArrayList<>();
while (str != null) {
    list.add(str);
    str = br.readLine();
}
br.close();
Collections.sort(list, new Comparator<String>() {
//自定义排序，根据数字大小排序
    @Override
    public int compare(String o1, String o2) {
        int i1 = Integer.parseInt(o1.split("、")[0]);
        int i2 = Integer.parseInt(o2.split("、")[0]);
        return i1-i2;
    }
});
BufferedWriter bw = new BufferedWriter(new FileWriter("src/javaStudy/MyIO/b.txt"));
for (String s : list) {
    bw.write(s);
    bw.newLine();
}
bw.close();
```
