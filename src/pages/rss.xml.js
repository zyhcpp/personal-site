import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts.ts";
import { getSortedPosts } from "../utils/posts.ts";

export async function GET(context) {
  // 复用站点统一的文章查询（非草稿、按日期倒序），避免 feed 与站内排序/草稿规则漂移。
  const posts = await getSortedPosts();
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
