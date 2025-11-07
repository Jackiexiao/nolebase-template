![[PixPin_2025-11-05_13-29-34.png]]
![[PixPin_2025-11-05_13-33-06.png]]
![[PixPin_2025-11-05_13-33-29.png]]

```Java
byte[] bytes = new byte[1024 * 1024 * 5];
FileInputStream fis = new FileInputStream("F:\\download\\第57次取消发送 - 菲菲公主.mp3");
FileOutputStream fos = new FileOutputStream("src\\javaStudy\\MyIO\\b.mp3");
try (fis; fos) {
    int b;
    while ((b = fis.read(bytes)) != -1) {
        fos.write(bytes, 0, b);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```
