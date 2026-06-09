// 估算阅读时间（分钟）。中文按字数，英文按词数，取较大者，每分钟约 300 字。
export function readingTime(body: string): number {
  const cjk = (body.match(/[一-鿿]/g) || []).length;
  const words = (body.match(/[a-zA-Z0-9]+/g) || []).length;
  const minutes = Math.ceil((cjk + words) / 300);
  return Math.max(1, minutes);
}
