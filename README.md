# nolebase-template

一个简约的博客/笔记网站模板，基于 markdown + obsidian + vitepress

本仓库从[nolebase](https://github.com/nolebase/nolebase/) 精简而来，方便做 template，用于初始化仓库

演示网站： https://nolebase-template.vercel.app

做了如下改动
- 精简仓库: 删除了原始的笔记，较大的文件，思源宋体文件， `.obsidian/`文件夹, `netlify`文件夹


## 使用
需要 Nodejs / pnpm

```bash
pnpm install # 安装
pnpm docs:dev # dev模式,本地查看文档
pnpm docs:build # 构建网站发布所需要的资源, build之后在 .vitepress/dist 下, 保证在本地能构建成功后再发布比较好
```

需要修改的内容：
- 可以修改 metadata/index.ts 配置一下自己的网站信息
- 再修改一下 index.md 配置一下首页
- 修改 `.vitepress/creators.ts`, 添加你的 github 地址，这样的话，在每个文章下面的贡献者那里就能够链接到你的 github 首页（否则只是一个名字，无法点击）。

## 部署
### vercel 部署
vercel 部署很简单, 在 vercel 中选择项目后, 修改构建的 output directory 为 .vitepress/dist 就行了（默认是 ./dist）

如果你选择了用 vercel 部署，可以关闭 netflify 的 workflow.

在 github仓库页面 -> Actions -> netlify 对应 workflow -> 右上角3个点 -> disable workflow

<img width="204" alt="image" src="https://github.com/Jackiexiao/nolebase-template/assets/18050469/aa83c0f4-9ff6-4fc2-b5df-eb45f81f6773">

### 其他方式部署
其他部署方式见[原仓库](https://github.com/nolebase/nolebase/)的说明

## Obsidian 的设置
### 关于图片链接问题
如果你的 markdown 中的图片链接没有在当前文件所在目录下，会解析出错，无法在 vitepress 中正确渲染。如果没有这个问题，你可以跳过下面的内容

解决方法： 推荐的  Obsidian Setting => Files and links 设置如下
- New link format => Relative path to file
-  Use `[[Wikilinks]]` => False
- Default location for new attachments => In subfolder under current folder 
-  Subfolder name => assets

这么做有几个好处
- 保持兼容性的markdown: 可以让文档也能在 github 中被正确渲染（github无法解析`[[双链]]`）
- 方便迁移文件和图片，你只需要把图片文件夹和markdown文件一起复制就行（如果是全部汇总在某个文件夹下，以后复制比较麻烦）

额外的 tips
- 对于已有的笔记和图片链接，你可以考虑使用 obsidian 插件[obsidian-link-converter](https://github.com/ozntel/obsidian-link-converter) 来帮你做自动的转换 `[[wikilink]]` 为 relative_path 的 markdown link
- 同时，我建议使用这个 [clear-unused-image](https://github.com/ozntel/oz-clear-unused-images-obsidian) 插件来帮助你清除无用的图片（但记得不要运行 clear attachment ，否则 vitepress 相关代码会被移除）

## 开启 giscus 评论功能
giscus 利用了 [GitHub Discussions](https://docs.github.com/en/discussions) 实现的评论系统，让访客借助 GitHub 在你的网站上留下评论！（你的github仓库必须是公开的才能使用 giscus）

具体配置方法
- 第1步，访问 [Giscus](https://giscus.app/zh-CN) 网站， 参考网站上的说明，一步步操作，最后得到一个配置代码
- 第2步，在 `./vitepress/theme/index.ts` 中修改 giscus 相关配置，在该文件中搜索 `giscusTalk`, 参考说明，修改配置即可

## 其他替代方案
- obsidian 官方的 publish 
- https://github.com/oleeskild/obsidian-digital-garden
- https://github.com/ObsidianPublisher/obsidian-github-publisher
- https://github.com/alangrainger/share-note

