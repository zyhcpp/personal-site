// 自动发现 src/assets/photos/ 下所有图片
// 添加新照片：直接把 jpg/png/webp/avif 文件放入 src/assets/photos/ 即可
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/photos/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

// 可选元数据 — 按文件名映射标题和描述。
// 不在这个映射里的照片会自动用文件名（去掉后缀）作为标题。
const META: Record<string, { title?: string; description?: string }> = {
  // 'photo1.jpg': { title: '日落', description: '2026年摄于海边' },
};

export interface Photo {
  src: ImageMetadata;
  title: string;
  description: string;
}

export function getPhotos(): Photo[] {
  return Object.entries(imageModules).map(([path, mod]) => {
    const filename = path.split("/").pop()!;
    const meta = META[filename] ?? {};
    return {
      src: mod.default,
      title: meta.title ?? filename.replace(/\.[^.]+$/, ""),
      description: meta.description ?? "",
    };
  });
}
