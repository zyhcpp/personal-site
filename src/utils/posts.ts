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
