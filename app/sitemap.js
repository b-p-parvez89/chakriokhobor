export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const api = process.env.NEXT_PUBLIC_API_URL ;
  try {
    const [a, j, e] = await Promise.all([
      fetch(api + "/articles?limit=1000").then((r) => r.json()),
      fetch(api + "/jobs?limit=1000").then((r) => r.json()),
      fetch(api + "/education").then((r) => r.json()),
    ]);
    return [
      { url: base, changeFrequency: "hourly", priority: 1 },
      { url: base + "/jobs", priority: 0.9 },
      { url: base + "/news", priority: 0.9 },
      { url: base + "/education", priority: 0.8 },
      { url: base + "/tools", priority: 0.8 },
      ...(a.data || []).map((x) => ({
        url: base + "/news/" + x.slug,
        lastModified: x.updatedAt || x.publishedAt,
      })),
      ...(j.data || []).map((x) => ({
        url: base + "/jobs/" + x.slug,
        lastModified: x.updatedAt,
      })),
      ...(e.data || []).map((x) => ({
        url: base + "/education/" + x.slug,
        lastModified: x.updatedAt,
      })),
    ];
  } catch {
    return [{ url: base }];
  }
}
