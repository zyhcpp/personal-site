# 个人主页

基于 Astro 的静态个人博客综合站。含代码高亮、目录导航、暗色模式、站内搜索、RSS、背景音乐播放器，部署到 Vercel。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 生产构建 + 搜索索引
npm run preview  # 预览构建产物
```

## 写文章

在 `src/content/blog/` 新建 `.md` 文件，frontmatter 需包含：

```yaml
---
title: "文章标题"
date: 2026-06-10
description: "文章摘要"
category: "分类"
tags: ["标签1", "标签2"]
---
```

构建时 schema 会自动校验，漏写字段会直接报错。

## 部署

1. 推送到 GitHub 仓库
2. 在 Vercel 导入仓库，框架自动识别为 Astro
3. 部署前把 `src/consts.ts` 的 `SITE_URL` 改为真实域名

## 技术栈

- **框架**：Astro v6
- **内容**：Content Collections + Zod schema 校验
- **代码高亮**：Shiki（Astro 内置）
- **搜索**：Pagefind（构建期生成索引）
- **RSS / Sitemap**：@astrojs/rss / @astrojs/sitemap
- **部署**：Vercel（免费、自动 HTTPS、全球 CDN）
