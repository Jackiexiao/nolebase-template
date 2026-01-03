# VitePress + Obsidian Template

这是一个简单开箱即用的 VitePress + Obsidian 模板，适合把 Obsidian 笔记同步到静态站点。

## 相比默认 VitePress 模板的新增功能

- Obsidian 友好结构：以 `docs/` 为站点根目录，适配常见笔记组织方式
- 自动侧边栏/最近更新：`scripts/update.ts` 生成结构与更新时间信息
- Markdown 增强：脚注、数学公式、双链解析、内链预览、图片懒加载占位
- 阅读体验增强：高亮锚点、阅读模式切换、文档属性（标签/进度/字数/阅读时间）
- 可选评论：内置 giscus 配置入口（默认关闭）
- UnoCSS + Iconify：图标与样式开箱即用

## 快速开始

```bash
pnpm install
pnpm docs:dev
```

常用命令：

```bash
pnpm docs:dev   # 本地开发
pnpm docs:build # 构建静态站点
pnpm docs:serve # 本地预览构建结果
```

## 目录结构

- `docs/`：VitePress 源目录
- `docs/.vitepress/`：站点配置和主题
- `docs/note/`：示例笔记目录（可按需改名/调整）
- `docs/public/`：静态资源

## Obsidian 设置建议

如果你的图片附件不在当前文档目录下，VitePress 可能无法正确渲染。推荐在 Obsidian 中进行如下设置：

- New link format => Relative path to file
- Use `[[Wikilinks]]` => False
- Default location for new attachments => In subfolder under current folder
- Subfolder name => assets

这样可以保持 Markdown 在 GitHub 和 VitePress 中兼容，同时也更方便迁移。

## 可选：开启 giscus 评论

默认不启用评论。要开启：

1. 访问 https://giscus.app/ 生成配置
2. 修改 `docs/.vitepress/theme/index.ts` 中的 giscus 参数
3. 在需要评论的页面 frontmatter 中加入 `comment: true`

如果想全站开启评论，将 `giscusTalk` 的第三个参数改为 `true`。
