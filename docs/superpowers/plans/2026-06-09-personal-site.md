# 个人主页（综合博客站）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 Astro 搭建一个静态个人博客综合站（首页简介+最新文章、文章列表/详情、标签、分类、关于），含代码高亮、目录、暗色模式、站内搜索、RSS、背景音乐播放器，部署到 Vercel。

**Architecture:** 纯静态站点。Markdown 文章经 Astro Content Collections（含 zod schema 校验）在构建期渲染为 HTML，生成文章页、列表/标签/分类聚合页。Pagefind 在构建后扫描产物生成搜索索引。无运行时后端、无数据库。`git push` 触发 Vercel 自动构建部署。

**Tech Stack:** Astro v5、TypeScript、Astro Content Collections + zod、Shiki（内置代码高亮）、@astrojs/rss、@astrojs/sitemap、Pagefind（搜索）、原生 HTML `<audio>`（背景音乐）、Vercel（部署）。

**项目根目录：** `D:\projects\personal-site`（git-bash 下为 `/d/projects/personal-site`）。所有命令在该目录执行。

---

## File Structure

构建期生成、按职责拆分文件，每个文件单一职责：

| 文件 | 职责 |
|------|------|
| `astro.config.mjs` | Astro 配置：站点 URL、集成（sitemap）、markdown(Shiki) 配置 |
| `src/content.config.ts` | 定义 blog 集合的 glob loader 与 zod schema（frontmatter 校验） |
| `src/consts.ts` | 站点级常量：站点标题、描述、作者、社交链接、导航项 |
| `src/layouts/BaseLayout.astro` | 全站基础布局：`<head>`(SEO/OG)、导航、页脚、主题脚本、音乐播放器、`<slot/>` |
| `src/layouts/PostLayout.astro` | 文章详情布局：标题/日期/阅读时间、TOC、正文 slot、上下篇 |
| `src/components/Nav.astro` | 导航栏（文章/标签/分类/关于 + 搜索框 + 主题切换按钮） |
| `src/components/Footer.astro` | 页脚 |
| `src/components/PostCard.astro` | 文章列表项卡片（标题、日期、摘要、分类、标签） |
| `src/components/TableOfContents.astro` | 文章目录(TOC)，由 headings 生成 |
| `src/components/ThemeToggle.astro` | 暗/亮主题切换按钮（含内联脚本） |
| `src/components/Search.astro` | Pagefind 搜索 UI 挂载点 |
| `src/components/MusicPlayer.astro` | 背景音乐播放器（右下角，默认暂停，点击播放） |
| `src/components/BaseHead.astro` | `<head>` 内 meta/OG/sitemap 标签 |
| `src/utils/posts.ts` | 文章查询/排序/分组工具（按日期排序、取标签集合、取分类集合） |
| `src/utils/reading-time.ts` | 阅读时间估算 |
| `src/pages/index.astro` | 首页：简介 + 最新文章 |
| `src/pages/about.astro` | 关于页 |
| `src/pages/blog/index.astro` | 文章列表（分页） |
| `src/pages/blog/[...slug].astro` | 文章详情（动态路由） |
| `src/pages/tags/index.astro` | 标签总览 |
| `src/pages/tags/[tag].astro` | 单标签筛选 |
| `src/pages/categories/index.astro` | 分类总览 |
| `src/pages/categories/[category].astro` | 单分类筛选 |
| `src/pages/rss.xml.js` | RSS feed |
| `src/pages/404.astro` | 自定义 404 |
| `src/styles/global.css` | 全局样式 + CSS 变量（明暗双主题） |
| `src/content/blog/*.md` | 博客文章 |
| `public/music/` | 背景音乐音频文件 |

**测试策略说明（重要）：** 本项目是 Astro 静态内容站，没有传统单元测试框架。本规范第 9 节明确：以"构建即验证"为主。因此本计划的"测试"步骤是**构建 + dev 服务器 + 手动验收**，而非 `pytest`/`vitest` 单测。每个任务的验证步骤会给出明确的命令和预期结果（构建成功 / dev 页面可访问 / 特定元素出现）。最后有一个集中的手动验收任务。

---

## Task 1: 初始化 Astro 项目

**Files:**
- Create: 整个 Astro 脚手架（`package.json`、`astro.config.mjs`、`tsconfig.json`、`src/`、`public/` 等）

- [ ] **Step 1: 在项目目录初始化 Astro（最小模板）**

注意：项目目录已存在且含 `.git`、`docs/`、`.gitignore`。用 `npm create astro` 在当前目录初始化，选择 minimal 模板、不覆盖 git。

Run（在 `/d/projects/personal-site`）：
```bash
npm create astro@latest . -- --template minimal --typescript strict --no-git --install --skip-houston
```
说明：`.` 表示当前目录；`--no-git` 因为已是 git 仓库；`--install` 自动装依赖。若提示目录非空，选择继续（保留现有文件）。

Expected: 生成 `package.json`、`astro.config.mjs`、`tsconfig.json`、`src/pages/index.astro`、`public/`，并完成 `npm install`。

- [ ] **Step 2: 验证 dev 服务器能启动**

Run：
```bash
npm run dev
```
Expected: 输出包含 `Local   http://localhost:4321/`。在浏览器打开能看到默认页面。确认后 `Ctrl+C` 停止。

- [ ] **Step 3: 验证生产构建成功**

Run：
```bash
npm run build
```
Expected: 输出 `Complete!`，生成 `dist/` 目录，无报错。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: 初始化 Astro 项目脚手架"
```

---

## Task 2: 站点常量与基础布局

**Files:**
- Create: `src/consts.ts`
- Create: `src/styles/global.css`
- Create: `src/components/BaseHead.astro`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: 写站点常量**

Create `src/consts.ts`：
```ts
export const SITE_TITLE = "我的个人主页";
export const SITE_DESCRIPTION = "技术博客与个人介绍";
export const AUTHOR = "ZYHismonster";
// 部署后改成真实域名，用于 SEO/OG/RSS 绝对链接
export const SITE_URL = "https://example.com";

export const SOCIAL_LINKS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/ZYHismonster" },
];

export const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "文章", href: "/blog" },
  { label: "标签", href: "/tags" },
  { label: "分类", href: "/categories" },
  { label: "关于", href: "/about" },
];
```

- [ ] **Step 2: 写全局样式与明暗主题变量**

Create `src/styles/global.css`：
```css
:root {
  --bg: #ffffff;
  --fg: #1a1a1a;
  --muted: #666666;
  --accent: #2563eb;
  --border: #e5e5e5;
  --code-bg: #f5f5f5;
  --max-width: 720px;
}
:root[data-theme="dark"] {
  --bg: #121212;
  --fg: #e8e8e8;
  --muted: #9a9a9a;
  --accent: #60a5fa;
  --border: #2a2a2a;
  --code-bg: #1e1e1e;
}
* { box-sizing: border-box; }
html { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  line-height: 1.7;
}
main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
code { font-family: "Cascadia Code", "Fira Code", Consolas, monospace; }
img { max-width: 100%; height: auto; }
```

- [ ] **Step 3: 写 BaseHead（SEO/OG meta）**

Create `src/components/BaseHead.astro`：
```astro
---
import { SITE_TITLE, SITE_URL } from "../consts";
interface Props { title: string; description: string; image?: string; }
const { title, description, image = "/og-default.png" } = Astro.props;
const canonical = new URL(Astro.url.pathname, SITE_URL);
const ogImage = new URL(image, SITE_URL);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta name="twitter:card" content="summary_large_image" />
<link rel="alternate" type="application/rss+xml" title={SITE_TITLE} href={new URL("/rss.xml", SITE_URL)} />
```

- [ ] **Step 4: 写 BaseLayout**

Create `src/layouts/BaseLayout.astro`（Nav/Footer/ThemeToggle/MusicPlayer 组件将在后续任务创建，先写占位导入会导致构建失败——因此本步先用最小内联结构，后续任务再替换为组件）：
```astro
---
import BaseHead from "../components/BaseHead.astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import "../styles/global.css";
interface Props { title?: string; description?: string; image?: string; }
const {
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  image,
} = Astro.props;
---
<!doctype html>
<html lang="zh-CN">
  <head>
    <BaseHead title={title} description={description} image={image} />
    <script is:inline>
      // 在首屏前应用主题，避免闪烁
      const t = localStorage.getItem("theme") ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.dataset.theme = t;
    </script>
  </head>
  <body>
    <header>
      <nav><a href="/">{SITE_TITLE}</a></nav>
    </header>
    <main>
      <slot />
    </main>
    <footer style="text-align:center;padding:2rem;color:var(--muted)">
      © {SITE_TITLE}
    </footer>
  </body>
</html>
```

- [ ] **Step 5: 让首页用上 BaseLayout**

Replace `src/pages/index.astro` 全部内容：
```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout>
  <h1>首页占位</h1>
  <p>稍后替换为简介 + 最新文章。</p>
</BaseLayout>
```

- [ ] **Step 6: 验证构建与 dev**

Run：
```bash
npm run build && npm run dev
```
Expected: 构建 `Complete!`；dev 打开 `http://localhost:4321/` 看到"首页占位"，标题为"我的个人主页"。切换系统暗色模式刷新，背景应变深色。确认后 `Ctrl+C`。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 站点常量、全局样式、基础布局与 SEO head"
```

---

## Task 3: 内容集合与 schema

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/blog/hello-world.md`
- Create: `src/content/blog/second-post.md`

- [ ] **Step 1: 定义 blog 集合 schema**

Create `src/content.config.ts`：
```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: 写两篇示例文章**

Create `src/content/blog/hello-world.md`：
```md
---
title: "你好，世界"
date: 2026-06-01
description: "这是第一篇文章，用来验证博客系统。"
category: "随笔"
tags: ["公告", "开始"]
---

## 欢迎

这是站点的第一篇文章。

```js
console.log("Hello, world!");
```

下面是一段普通正文，用来测试 Markdown 渲染、代码高亮和目录。

## 第二个标题

更多内容。
```

Create `src/content/blog/second-post.md`：
```md
---
title: "算法笔记：两数之和"
date: 2026-06-05
description: "LeetCode 第一题题解。"
category: "算法"
tags: ["LeetCode", "哈希表"]
---

## 思路

用哈希表记录已遍历的数。

```python
def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
```

## 复杂度

时间 O(n)，空间 O(n)。
```

- [ ] **Step 3: 验证 schema 生效（构建成功）**

Run：
```bash
npm run build
```
Expected: 构建 `Complete!`，无 schema 报错。

- [ ] **Step 4: 验证 schema 校验会拦截错误**

临时把 `hello-world.md` 的 `title:` 行删掉，再 `npm run build`。
Expected: 构建**失败**，错误信息指出 `hello-world` 缺少 `title` 字段。确认后把 `title` 加回去，再次 `npm run build` 应成功。这验证了规范第 7 节的"内容校验"。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: blog 内容集合 schema 与示例文章"
```

---

## Task 4: 文章查询工具与阅读时间

**Files:**
- Create: `src/utils/reading-time.ts`
- Create: `src/utils/posts.ts`

- [ ] **Step 1: 写阅读时间工具**

Create `src/utils/reading-time.ts`：
```ts
// 估算阅读时间（分钟）。中文按字数，英文按词数，取较大者，每分钟约 300 字。
export function readingTime(body: string): number {
  const cjk = (body.match(/[一-鿿]/g) || []).length;
  const words = (body.match(/[a-zA-Z0-9]+/g) || []).length;
  const minutes = Math.ceil((cjk + words) / 300);
  return Math.max(1, minutes);
}
```

- [ ] **Step 2: 写文章查询工具**

Create `src/utils/posts.ts`：
```ts
import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

// 取全部非草稿文章，按日期倒序
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

// 取所有标签 -> 文章数
export async function getTags(): Promise<Map<string, number>> {
  const posts = await getSortedPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.tags) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return map;
}

// 取所有分类 -> 文章数
export async function getCategories(): Promise<Map<string, number>> {
  const posts = await getSortedPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    map.set(p.data.category, (map.get(p.data.category) ?? 0) + 1);
  }
  return map;
}

// 上一篇/下一篇（按倒序列表，prev=更新的，next=更旧的）
export function getAdjacent(posts: Post[], id: string) {
  const idx = posts.findIndex((p) => p.id === id);
  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}
```

- [ ] **Step 3: 验证类型与构建**

Run：
```bash
npm run build
```
Expected: 构建 `Complete!`，无 TypeScript 报错。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 文章查询工具与阅读时间估算"
```

---

## Task 5: 导航栏、页脚、主题切换组件

**Files:**
- Create: `src/components/ThemeToggle.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: 写主题切换按钮**

Create `src/components/ThemeToggle.astro`：
```astro
<button id="theme-toggle" aria-label="切换主题" title="切换主题">🌓</button>
<script>
  const btn = document.getElementById("theme-toggle");
  btn?.addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = cur;
    localStorage.setItem("theme", cur);
  });
</script>
<style>
  #theme-toggle {
    background: none; border: none; cursor: pointer;
    font-size: 1.1rem; padding: 0.25rem;
  }
</style>
```

- [ ] **Step 2: 写导航栏**

Create `src/components/Nav.astro`：
```astro
---
import { SITE_TITLE, NAV_ITEMS } from "../consts";
import ThemeToggle from "./ThemeToggle.astro";
const path = Astro.url.pathname;
---
<header class="site-header">
  <nav class="nav">
    <a class="brand" href="/">{SITE_TITLE}</a>
    <ul class="links">
      {NAV_ITEMS.map((item) => (
        <li>
          <a href={item.href} aria-current={path.startsWith(item.href) ? "page" : undefined}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
    <div class="actions">
      <a href="/search" class="search-link" aria-label="搜索">🔍</a>
      <ThemeToggle />
    </div>
  </nav>
</header>
<style>
  .site-header { border-bottom: 1px solid var(--border); }
  .nav {
    max-width: var(--max-width); margin: 0 auto; padding: 0.75rem 1rem;
    display: flex; align-items: center; gap: 1rem;
  }
  .brand { font-weight: 700; color: var(--fg); }
  .links { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; flex: 1; }
  .links a[aria-current="page"] { color: var(--accent); font-weight: 600; }
  .actions { display: flex; align-items: center; gap: 0.5rem; }
  @media (max-width: 600px) {
    .nav { flex-wrap: wrap; }
    .links { order: 3; flex-basis: 100%; }
  }
</style>
```

- [ ] **Step 3: 写页脚**

Create `src/components/Footer.astro`：
```astro
---
import { SITE_TITLE, SOCIAL_LINKS } from "../consts";
---
<footer class="site-footer">
  <div class="social">
    {SOCIAL_LINKS.map((s) => <a href={s.href} target="_blank" rel="noopener">{s.label}</a>)}
  </div>
  <p>© {SITE_TITLE}</p>
  <p><a href="/rss.xml">RSS</a></p>
</footer>
<style>
  .site-footer {
    border-top: 1px solid var(--border); text-align: center;
    padding: 2rem 1rem; color: var(--muted); margin-top: 3rem;
  }
  .social { display: flex; gap: 1rem; justify-content: center; margin-bottom: 0.5rem; }
</style>
```

- [ ] **Step 4: 在 BaseLayout 中替换为组件**

Replace `src/layouts/BaseLayout.astro` 的 `<body>` 内容（保留 `<head>` 与主题脚本不变）：
```astro
  <body>
    <Nav />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
```
并在 frontmatter 顶部加导入：
```astro
import Nav from "../components/Nav.astro";
import Footer from "../components/Footer.astro";
```

- [ ] **Step 5: 验证 dev**

Run：
```bash
npm run dev
```
Expected: 打开首页可见导航栏（文章/标签/分类/关于 + 搜索图标 + 主题按钮）和页脚；点击主题按钮可在明暗间切换并刷新后保持。确认后 `Ctrl+C`。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 导航栏、页脚、主题切换组件"
```

---

## Task 6: 文章卡片与文章列表页（含分页）

**Files:**
- Create: `src/components/PostCard.astro`
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: 写文章卡片**

Create `src/components/PostCard.astro`：
```astro
---
import type { Post } from "../utils/posts";
interface Props { post: Post; }
const { post } = Astro.props;
const { title, date, description, category, tags } = post.data;
const dateStr = date.toISOString().slice(0, 10);
---
<article class="card">
  <h2><a href={`/blog/${post.id}/`}>{title}</a></h2>
  <p class="meta">
    <time datetime={dateStr}>{dateStr}</time>
    <span>·</span>
    <a href={`/categories/${category}/`}>{category}</a>
  </p>
  <p class="desc">{description}</p>
  <ul class="tags">
    {tags.map((t) => <li><a href={`/tags/${t}/`}>#{t}</a></li>)}
  </ul>
</article>
<style>
  .card { padding: 1.25rem 0; border-bottom: 1px solid var(--border); }
  .card h2 { margin: 0 0 0.25rem; }
  .meta { color: var(--muted); font-size: 0.9rem; display: flex; gap: 0.5rem; margin: 0 0 0.5rem; }
  .desc { margin: 0 0 0.5rem; }
  .tags { display: flex; gap: 0.75rem; list-style: none; padding: 0; margin: 0; font-size: 0.85rem; }
</style>
```

- [ ] **Step 2: 写文章列表页（分页）**

Create `src/pages/blog/index.astro`（用 Astro `paginate`，每页 10 篇）：
```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import PostCard from "../../components/PostCard.astro";
import { getSortedPosts } from "../../utils/posts";

const posts = await getSortedPosts();
const pageSize = 10;
const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
const page = 1;
const pagePosts = posts.slice(0, pageSize);
---
<BaseLayout title="文章">
  <h1>文章</h1>
  {pagePosts.map((post) => <PostCard post={post} />)}
  {totalPages > 1 && (
    <nav class="pager">
      <a href="/blog/2/">下一页 →</a>
    </nav>
  )}
</BaseLayout>
<style>
  .pager { display: flex; justify-content: space-between; margin-top: 2rem; }
</style>
```

注意：为简洁，第 1 页固定在 `/blog`，第 2 页起用下一步的 `[page].astro` 处理。若文章不足 10 篇则不显示分页。

- [ ] **Step 3: 写其余分页路由**

Create `src/pages/blog/[page].astro`：
```astro
---
import type { GetStaticPaths } from "astro";
import BaseLayout from "../../layouts/BaseLayout.astro";
import PostCard from "../../components/PostCard.astro";
import { getSortedPosts } from "../../utils/posts";

export const getStaticPaths = (async () => {
  const posts = await getSortedPosts();
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const paths = [];
  // 第 2 页起（第 1 页由 index.astro 处理）
  for (let p = 2; p <= totalPages; p++) {
    paths.push({
      params: { page: String(p) },
      props: {
        pagePosts: posts.slice((p - 1) * pageSize, p * pageSize),
        cur: p,
        totalPages,
      },
    });
  }
  return paths;
}) satisfies GetStaticPaths;

const { pagePosts, cur, totalPages } = Astro.props;
const prevHref = cur === 2 ? "/blog/" : `/blog/${cur - 1}/`;
---
<BaseLayout title={`文章 - 第 ${cur} 页`}>
  <h1>文章</h1>
  {pagePosts.map((post) => <PostCard post={post} />)}
  <nav class="pager">
    <a href={prevHref}>← 上一页</a>
    {cur < totalPages && <a href={`/blog/${cur + 1}/`}>下一页 →</a>}
  </nav>
</BaseLayout>
<style>
  .pager { display: flex; justify-content: space-between; margin-top: 2rem; }
</style>
```

- [ ] **Step 4: 验证 dev**

Run：
```bash
npm run dev
```
Expected: 打开 `/blog` 看到两篇示例文章卡片（标题、日期、分类、摘要、标签）。文章不足 10 篇，无分页链接。确认后 `Ctrl+C`。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 文章卡片与文章列表页（含分页）"
```

---

## Task 7: 目录(TOC)、文章布局与文章详情页

**Files:**
- Create: `src/components/TableOfContents.astro`
- Create: `src/layouts/PostLayout.astro`
- Create: `src/pages/blog/[...slug].astro`

- [ ] **Step 1: 写目录组件**

Create `src/components/TableOfContents.astro`（接收 Astro 渲染产出的 headings 数组）：
```astro
---
import type { MarkdownHeading } from "astro";
interface Props { headings: MarkdownHeading[]; }
const { headings } = Astro.props;
// 只取 h2/h3
const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
---
{items.length > 0 && (
  <nav class="toc" aria-label="目录">
    <p class="toc-title">目录</p>
    <ul>
      {items.map((h) => (
        <li class={`depth-${h.depth}`}><a href={`#${h.slug}`}>{h.text}</a></li>
      ))}
    </ul>
  </nav>
)}
<style>
  .toc { border: 1px solid var(--border); border-radius: 6px; padding: 0.75rem 1rem; margin: 1.5rem 0; font-size: 0.9rem; }
  .toc-title { font-weight: 600; margin: 0 0 0.5rem; }
  .toc ul { list-style: none; margin: 0; padding: 0; }
  .toc .depth-3 { padding-left: 1rem; }
</style>
```

- [ ] **Step 2: 写文章布局**

Create `src/layouts/PostLayout.astro`：
```astro
---
import BaseLayout from "./BaseLayout.astro";
import TableOfContents from "../components/TableOfContents.astro";
import type { MarkdownHeading } from "astro";
import type { Post } from "../utils/posts";

interface Props {
  post: Post;
  headings: MarkdownHeading[];
  minutes: number;
  prev: Post | null;
  next: Post | null;
}
const { post, headings, minutes, prev, next } = Astro.props;
const { title, date, description, category, tags } = post.data;
const dateStr = date.toISOString().slice(0, 10);
---
<BaseLayout title={title} description={description}>
  <article>
    <h1>{title}</h1>
    <p class="meta">
      <time datetime={dateStr}>{dateStr}</time>
      <span>·</span>
      <a href={`/categories/${category}/`}>{category}</a>
      <span>·</span>
      <span>{minutes} 分钟阅读</span>
    </p>
    <ul class="tags">
      {tags.map((t) => <li><a href={`/tags/${t}/`}>#{t}</a></li>)}
    </ul>
    <TableOfContents headings={headings} />
    <div class="prose">
      <slot />
    </div>
    <nav class="post-nav">
      {prev && <a href={`/blog/${prev.id}/`}>← {prev.data.title}</a>}
      {next && <a href={`/blog/${next.id}/`} class="next">{next.data.title} →</a>}
    </nav>
  </article>
</BaseLayout>
<style>
  .meta { color: var(--muted); font-size: 0.9rem; display: flex; gap: 0.5rem; }
  .tags { display: flex; gap: 0.75rem; list-style: none; padding: 0; font-size: 0.85rem; }
  .prose :global(pre) { background: var(--code-bg); padding: 1rem; border-radius: 6px; overflow-x: auto; }
  .prose :global(h2), .prose :global(h3) { scroll-margin-top: 1rem; }
  .post-nav { display: flex; justify-content: space-between; gap: 1rem; margin-top: 3rem; border-top: 1px solid var(--border); padding-top: 1rem; }
  .post-nav .next { margin-left: auto; text-align: right; }
</style>
```

- [ ] **Step 3: 写文章详情动态路由**

Create `src/pages/blog/[...slug].astro`：
```astro
---
import type { GetStaticPaths } from "astro";
import { render } from "astro:content";
import PostLayout from "../../layouts/PostLayout.astro";
import { getSortedPosts, getAdjacent } from "../../utils/posts";
import { readingTime } from "../../utils/reading-time";

export const getStaticPaths = (async () => {
  const posts = await getSortedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}) satisfies GetStaticPaths;

const { post } = Astro.props;
const { Content, headings } = await render(post);
const minutes = readingTime(post.body ?? "");
const all = await getSortedPosts();
const { prev, next } = getAdjacent(all, post.id);
---
<PostLayout post={post} headings={headings} minutes={minutes} prev={prev} next={next}>
  <Content />
</PostLayout>
```

- [ ] **Step 4: 验证 dev（渲染、代码高亮、TOC、上下篇）**

Run：
```bash
npm run dev
```
Expected: 在 `/blog` 点进文章，可见：正文渲染、代码块有 **Shiki 高亮配色**、顶部"目录"列出 h2/h3 且点击可跳转、阅读时间显示、底部有上一篇/下一篇链接。确认后 `Ctrl+C`。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 文章详情页、目录(TOC)、上下篇导航、阅读时间"
```

---

## Task 8: 标签页与分类页

**Files:**
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag].astro`
- Create: `src/pages/categories/index.astro`
- Create: `src/pages/categories/[category].astro`

- [ ] **Step 1: 标签总览页**

Create `src/pages/tags/index.astro`：
```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getTags } from "../../utils/posts";
const tags = [...(await getTags()).entries()].sort((a, b) => b[1] - a[1]);
---
<BaseLayout title="标签">
  <h1>标签</h1>
  <ul class="cloud">
    {tags.map(([tag, count]) => (
      <li><a href={`/tags/${tag}/`}>#{tag} <span>({count})</span></a></li>
    ))}
  </ul>
</BaseLayout>
<style>
  .cloud { display: flex; flex-wrap: wrap; gap: 0.75rem; list-style: none; padding: 0; }
  .cloud span { color: var(--muted); font-size: 0.85rem; }
</style>
```

- [ ] **Step 2: 单标签页**

Create `src/pages/tags/[tag].astro`：
```astro
---
import type { GetStaticPaths } from "astro";
import BaseLayout from "../../layouts/BaseLayout.astro";
import PostCard from "../../components/PostCard.astro";
import { getSortedPosts, getTags } from "../../utils/posts";

export const getStaticPaths = (async () => {
  const tags = await getTags();
  const posts = await getSortedPosts();
  return [...tags.keys()].map((tag) => ({
    params: { tag },
    props: { tag, posts: posts.filter((p) => p.data.tags.includes(tag)) },
  }));
}) satisfies GetStaticPaths;

const { tag, posts } = Astro.props;
---
<BaseLayout title={`标签：${tag}`}>
  <h1>标签：#{tag}</h1>
  {posts.map((post) => <PostCard post={post} />)}
</BaseLayout>
```

- [ ] **Step 3: 分类总览页**

Create `src/pages/categories/index.astro`：
```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getCategories } from "../../utils/posts";
const cats = [...(await getCategories()).entries()].sort((a, b) => b[1] - a[1]);
---
<BaseLayout title="分类">
  <h1>分类</h1>
  <ul class="list">
    {cats.map(([cat, count]) => (
      <li><a href={`/categories/${cat}/`}>{cat}</a> <span>({count})</span></li>
    ))}
  </ul>
</BaseLayout>
<style>
  .list { list-style: none; padding: 0; }
  .list li { padding: 0.4rem 0; }
  .list span { color: var(--muted); font-size: 0.85rem; }
</style>
```

- [ ] **Step 4: 单分类页**

Create `src/pages/categories/[category].astro`：
```astro
---
import type { GetStaticPaths } from "astro";
import BaseLayout from "../../layouts/BaseLayout.astro";
import PostCard from "../../components/PostCard.astro";
import { getSortedPosts, getCategories } from "../../utils/posts";

export const getStaticPaths = (async () => {
  const cats = await getCategories();
  const posts = await getSortedPosts();
  return [...cats.keys()].map((category) => ({
    params: { category },
    props: { category, posts: posts.filter((p) => p.data.category === category) },
  }));
}) satisfies GetStaticPaths;

const { category, posts } = Astro.props;
---
<BaseLayout title={`分类：${category}`}>
  <h1>分类：{category}</h1>
  {posts.map((post) => <PostCard post={post} />)}
</BaseLayout>
```

- [ ] **Step 5: 验证 dev**

Run：
```bash
npm run dev
```
Expected: `/tags` 列出 `公告/开始/LeetCode/哈希表` 及计数，点进 `#LeetCode` 看到对应文章；`/categories` 列出 `随笔/算法`，点进 `算法` 看到对应文章。确认后 `Ctrl+C`。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 标签与分类的总览页和筛选页"
```

---

## Task 9: 首页与关于页

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/about.astro`

- [ ] **Step 1: 写首页（简介 + 最新文章）**

Replace `src/pages/index.astro`：
```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import PostCard from "../components/PostCard.astro";
import { getSortedPosts } from "../utils/posts";
import { AUTHOR, SOCIAL_LINKS } from "../consts";
const latest = (await getSortedPosts()).slice(0, 5);
---
<BaseLayout>
  <section class="intro">
    <h1>你好，我是 {AUTHOR} 👋</h1>
    <p>欢迎来到我的个人主页。这里记录我的技术笔记与思考。</p>
    <p class="links">
      {SOCIAL_LINKS.map((s) => <a href={s.href} target="_blank" rel="noopener">{s.label}</a>)}
    </p>
  </section>
  <section>
    <h2>最新文章</h2>
    {latest.map((post) => <PostCard post={post} />)}
    <p><a href="/blog/">查看全部文章 →</a></p>
  </section>
</BaseLayout>
<style>
  .intro { padding: 2rem 0; border-bottom: 1px solid var(--border); }
  .intro .links { display: flex; gap: 1rem; }
</style>
```

- [ ] **Step 2: 写关于页**

Create `src/pages/about.astro`：
```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { AUTHOR } from "../consts";
---
<BaseLayout title="关于">
  <h1>关于我</h1>
  <p>我是 {AUTHOR}。这里是关于我的详细介绍——经历、技能与兴趣。</p>
  <h2>技能</h2>
  <ul>
    <li>（在这里填写你的技能）</li>
  </ul>
  <h2>经历</h2>
  <p>（在这里填写你的经历）</p>
</BaseLayout>
```

- [ ] **Step 3: 验证 dev**

Run：
```bash
npm run dev
```
Expected: 首页顶部显示问候与社交链接，下方"最新文章"列出示例文章并有"查看全部文章"链接；`/about` 正常显示。确认后 `Ctrl+C`。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 首页（简介+最新文章）与关于页"
```

---

## Task 10: RSS、sitemap、404

**Files:**
- Create: `src/pages/rss.xml.js`
- Create: `src/pages/404.astro`
- Modify: `astro.config.mjs`

- [ ] **Step 1: 安装 RSS 与 sitemap 集成**

Run：
```bash
npx astro add sitemap --yes
npm install @astrojs/rss
```
Expected: `astro add sitemap` 自动修改 `astro.config.mjs` 加入 sitemap 集成并安装 `@astrojs/sitemap`；`@astrojs/rss` 安装成功。

- [ ] **Step 2: 在 astro.config.mjs 设置 site**

确保 `astro.config.mjs` 含 `site`（sitemap 与绝对链接需要）。Modify 使其形如：
```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE_URL } from "./src/consts.ts";

export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
});
```
注意：`SITE_URL` 当前是占位 `https://example.com`，部署后改为真实域名。

- [ ] **Step 3: 写 RSS feed**

Create `src/pages/rss.xml.js`：
```js
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts.ts";

export async function GET(context) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

- [ ] **Step 4: 写 404 页面**

Create `src/pages/404.astro`：
```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout title="页面未找到">
  <section style="text-align:center;padding:3rem 0">
    <h1>404</h1>
    <p>抱歉，这个页面不存在。</p>
    <p><a href="/">返回首页</a></p>
  </section>
</BaseLayout>
```

- [ ] **Step 5: 验证构建与 RSS**

Run：
```bash
npm run build
```
Expected: 构建 `Complete!`；`dist/` 中存在 `rss.xml`、`sitemap-index.xml`、`404.html`。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: RSS feed、sitemap、自定义 404"
```

---

## Task 11: 背景音乐播放器

**Files:**
- Create: `src/components/MusicPlayer.astro`
- Create: `public/music/README.md`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: 写音乐播放器组件**

Create `src/components/MusicPlayer.astro`（右下角固定按钮，默认暂停，点击播放/暂停；用 sessionStorage 记住开关状态以在页面跳转间尽量连贯）：
```astro
---
// 音频文件路径：把你的 mp3 放到 public/music/bgm.mp3
const SRC = "/music/bgm.mp3";
---
<div class="music-player">
  <audio id="bgm" src={SRC} loop preload="none"></audio>
  <button id="bgm-toggle" aria-label="播放/暂停背景音乐" title="背景音乐">🎵</button>
</div>
<script>
  const audio = document.getElementById("bgm") as HTMLAudioElement | null;
  const btn = document.getElementById("bgm-toggle");
  if (audio && btn) {
    // 跨页面尽量连贯：若上一页在播放，本页恢复播放
    if (sessionStorage.getItem("bgm-playing") === "1") {
      audio.play().then(() => { btn.textContent = "⏸"; }).catch(() => {});
    }
    btn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().then(() => {
          btn.textContent = "⏸";
          sessionStorage.setItem("bgm-playing", "1");
        }).catch(() => {});
      } else {
        audio.pause();
        btn.textContent = "🎵";
        sessionStorage.setItem("bgm-playing", "0");
      }
    });
  }
</script>
<style>
  .music-player { position: fixed; right: 1rem; bottom: 1rem; z-index: 50; }
  #bgm-toggle {
    width: 44px; height: 44px; border-radius: 50%;
    border: 1px solid var(--border); background: var(--bg); color: var(--fg);
    cursor: pointer; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
</style>
```

- [ ] **Step 2: 写音乐目录说明**

Create `public/music/README.md`：
```md
# 背景音乐

把你的背景音乐文件命名为 `bgm.mp3` 放在此目录（`public/music/bgm.mp3`）。

- 支持 mp3/ogg（如用 ogg，请改 MusicPlayer.astro 中的 SRC）
- 请确保你拥有该音频的版权或使用许可
- 默认循环播放、默认暂停，访客点击右下角 🎵 按钮才播放
```

- [ ] **Step 3: 在 BaseLayout 挂载播放器**

Modify `src/layouts/BaseLayout.astro`：在 frontmatter 导入：
```astro
import MusicPlayer from "../components/MusicPlayer.astro";
```
在 `<body>` 内 `<Footer />` 之后加：
```astro
    <MusicPlayer />
```

- [ ] **Step 4: 验证 dev（无音频文件也不应报错）**

放一个任意 mp3 到 `public/music/bgm.mp3`（测试用；若暂无，按钮点击不出声但不应报错）。
Run：
```bash
npm run dev
```
Expected: 每个页面右下角出现 🎵 圆形按钮；点击后（若有 bgm.mp3）开始播放且图标变 ⏸，再点暂停；页面跳转后播放状态保持。无音频文件时点击无声但无 JS 报错。确认后 `Ctrl+C`。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 背景音乐播放器（默认暂停、点击播放、跨页连贯）"
```

---

## Task 12: 站内搜索（Pagefind）

**Files:**
- Modify: `package.json`（build 脚本）
- Create: `src/pages/search.astro`
- Modify: `src/components/Nav.astro`（搜索图标已指向 /search，无需改）

- [ ] **Step 1: 安装 Pagefind**

Run：
```bash
npm install pagefind
```
Expected: 安装成功。

- [ ] **Step 2: 让构建后生成搜索索引**

Pagefind 需在 `astro build` 之后扫描 `dist/`。Modify `package.json` 的 scripts：
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build && pagefind --site dist",
  "preview": "astro preview"
}
```

- [ ] **Step 3: 写搜索页**

Create `src/pages/search.astro`（加载 Pagefind 的 UI；索引在构建后生成，dev 模式下无索引属正常）：
```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout title="搜索">
  <h1>搜索</h1>
  <div id="search"></div>
</BaseLayout>
<link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
<script>
  // Pagefind UI 在构建产物的 /pagefind/ 下，dev 模式可能 404，属正常
  window.addEventListener("DOMContentLoaded", async () => {
    try {
      // @ts-ignore - 运行时从静态资源加载
      const { PagefindUI } = await import("/pagefind/pagefind-ui.js");
      new PagefindUI({ element: "#search", showSubResults: true });
    } catch (e) {
      const el = document.getElementById("search");
      if (el) el.innerHTML = "<p>搜索索引在生产构建后可用。</p>";
    }
  });
</script>
```

- [ ] **Step 4: 验证生产构建 + 预览**

Run：
```bash
npm run build && npm run preview
```
Expected: 构建末尾出现 Pagefind 索引日志（如 `Indexed N pages`）；打开 preview 给出的地址 `/search`，输入"两数"或"LeetCode"能搜到对应文章。确认后 `Ctrl+C`。

- [ ] **Step 5: 把 pagefind 产物排除出 git**

Pagefind 在 `dist/` 内生成，`dist/` 已在 `.gitignore`，无需额外处理。确认 `git status` 不含 `pagefind` 产物。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 站内搜索（Pagefind，构建期生成索引）"
```

---

## Task 13: GitHub 托管与 Vercel 部署

**Files:**
- Create: `README.md`

- [ ] **Step 1: 写 README**

Create `README.md`：
```md
# 个人主页

基于 Astro 的静态个人博客综合站。

## 本地开发
\`\`\`bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 生产构建 + 搜索索引
npm run preview  # 预览构建产物
\`\`\`

## 写文章
在 `src/content/blog/` 新建 `.md`，frontmatter 需含 title/date/description/category/tags。

## 部署
推送到 GitHub，Vercel 自动构建部署。部署前把 `src/consts.ts` 的 `SITE_URL` 改为真实域名。
\`\`\`
```

- [ ] **Step 2: 提交 README**

```bash
git add -A
git commit -m "docs: 项目 README"
```

- [ ] **Step 3: 创建 GitHub 仓库并推送（用户操作）**

此步需要 GitHub 账号鉴权，建议用户在终端执行（在提示框输入 `! <命令>` 可直接在会话里运行）：
```bash
# 用 gh CLI（需先 gh auth login）
gh repo create personal-site --private --source=. --remote=origin --push
```
或手动在 GitHub 网页建空仓库后：
```bash
git remote add origin https://github.com/ZYHismonster/personal-site.git
git branch -M main
git push -u origin main
```
Expected: 代码出现在 GitHub 仓库。

- [ ] **Step 4: 接入 Vercel（用户操作）**

在 vercel.com 用 GitHub 登录 → New Project → 选择 `personal-site` 仓库 → Framework 自动识别为 Astro → Deploy。
Expected: Vercel 构建成功并给出线上 URL。

- [ ] **Step 5: 部署后更新 SITE_URL**

把 `src/consts.ts` 的 `SITE_URL` 改为 Vercel 给的真实域名，提交并推送，触发重新部署，使 SEO/OG/RSS/sitemap 的绝对链接正确。
```bash
git add -A
git commit -m "chore: 设置生产站点 URL"
git push
```

---

## Task 14: 手动验收

**Files:** 无（纯验证）

按规范第 9 节的验收清单逐项核对。先 `npm run build && npm run preview`，打开 preview 地址逐项检查：

- [ ] **首页**：显示问候、社交链接、最新文章列表、"查看全部"链接
- [ ] **文章渲染**：点进文章，Markdown 正文、表格、引用正常
- [ ] **代码高亮**：代码块有 Shiki 配色（明暗主题下都正常）
- [ ] **目录(TOC)**：长文顶部目录列出 h2/h3，点击跳转到对应位置
- [ ] **上/下篇**：文章底部导航正确
- [ ] **暗色模式**：点击主题按钮切换，刷新后保持；各页面配色一致
- [ ] **搜索**：`/search` 输入关键词能搜到文章
- [ ] **标签筛选**：`/tags` → 单标签页文章正确
- [ ] **分类筛选**：`/categories` → 单分类页文章正确
- [ ] **RSS**：`/rss.xml` 可访问且含文章
- [ ] **背景音乐**：右下角 🎵 点击播放/暂停，跨页面保持状态
- [ ] **响应式**：浏览器缩窄到手机宽度，导航与布局不破版
- [ ] **404**：访问不存在路径（如 `/nope`）显示自定义 404

- [ ] **若全部通过，提交一个收尾标记（可选）**

```bash
git commit --allow-empty -m "chore: 手动验收通过"
```

---

## Self-Review

**1. Spec coverage（规范各节 → 任务）：**
- §3 站点结构（首页/文章列表/详情/标签/分类/关于/404）→ Task 6,7,8,9,10 ✓
- §3 frontmatter 字段（title/date/description/category/tags）→ Task 3 schema ✓
- §3 导航（文章·标签·分类·关于 + 搜索）→ Task 5 Nav ✓
- §4 Markdown/代码高亮/TOC/上下篇/阅读时间/日期 → Task 7 ✓
- §4 暗亮主题 → Task 2(变量)+Task 5(切换) ✓
- §4 响应式 → 各组件 media query + Task 14 验收 ✓
- §4 搜索(Pagefind) → Task 12 ✓
- §4 RSS/sitemap → Task 10 ✓
- §4 SEO/OG → Task 2 BaseHead ✓
- §4 背景音乐播放器（默认暂停/点击/本地文件/public/music/跨页连贯）→ Task 11 ✓
- §6 数据流（构建期静态化、Pagefind 索引）→ Task 1,3,12 ✓
- §7 错误处理（schema 校验拦截、404）→ Task 3 Step4、Task 10 ✓
- §8 部署（GitHub + Vercel）→ Task 13 ✓
- §9 测试（构建验证 + 手动验收清单）→ 各任务验证步 + Task 14 ✓
无遗漏。

**2. Placeholder scan：** 关于页与音乐目录中的"（在这里填写）"是给用户填的真实内容占位，非计划占位；所有代码步骤均给出完整可运行代码。无"TODO/TBD/类似上文"等计划失败项。

**3. Type consistency：** `Post` 类型在 `utils/posts.ts` 定义并贯穿 PostCard/PostLayout/各页面；`getSortedPosts/getTags/getCategories/getAdjacent` 签名在定义(Task4)与使用(Task6-10)处一致；`render(post)` 返回 `{ Content, headings }`、`post.id`、`post.body` 均为 Astro v5 内容层 API，一致使用；`SITE_URL/SITE_TITLE/SITE_DESCRIPTION/AUTHOR/SOCIAL_LINKS/NAV_ITEMS` 在 consts.ts 定义并一致引用。一致。
