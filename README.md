# nolebase-template

一个简约的博客/笔记网站模板，基于 markdown + obsidian + vitepress

本仓库从[nolebase](https://github.com/nolebase/nolebase/) 精简而来，方便做 template 

做了如下改动
- 精简仓库: 删除了原始的笔记，较大的文件，思源宋体文件， `.obsidian/`文件夹, `netlify`文件夹


## 使用
需要 Nodejs / pnpm

```bash
pnpm install # 安装
pnpm docs:dev # dev模式,本地查看文档
pnpm docs:build # 构建网站发布所需要的资源, build之后在 .vitepress/dist 下
```

你可以修改 metadata/index.ts 配置一下自己的网站信息
再修改一下 index.md 配置一下首页

## 部署
vercel 部署很简单, 在 vercel 中选择项目后, 修改构建的 output directory 为 .vitepress/dist 就行了（默认是 ./dist）

netlify 等其他部署方式见[原仓库](https://github.com/nolebase/nolebase/)的说明
