export default async function sitemap() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://chakriokhobor.onrender.com";

  const api =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://chakriokhobor-api.onrender.com/api/v1";

  try {
    const [articlesRes, jobsRes, educationRes] = await Promise.all([
      fetch(`${api}/articles?limit=1000`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${api}/jobs?limit=1000`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${api}/education`, {
        next: { revalidate: 3600 },
      }),
    ]);

    const [articles, jobs, education] = await Promise.all([
      articlesRes.ok ? articlesRes.json() : { data: [] },
      jobsRes.ok ? jobsRes.json() : { data: [] },
      educationRes.ok ? educationRes.json() : { data: [] },
    ]);

    const staticPages = [
      {
        url: base,
        changeFrequency: "hourly",
        priority: 1,
      },
      {
        url: `${base}/news`,
        changeFrequency: "hourly",
        priority: 0.9,
      },
      {
        url: `${base}/jobs`,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${base}/education`,
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: `${base}/tools`,
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];

    const articlePages = (articles.data || [])
      .filter((item) => item.slug)
      .map((item) => ({
        url: `${base}/news/${item.slug}`,
        lastModified:
          item.updatedAt || item.publishedAt || new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      }));

    const jobPages = (jobs.data || [])
      .filter((item) => item.slug)
      .map((item) => ({
        url: `${base}/jobs/${item.slug}`,
        lastModified:
          item.updatedAt || item.createdAt || new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      }));

    const educationPages = (education.data || [])
      .filter((item) => item.slug)
      .map((item) => ({
        url: `${base}/education/${item.slug}`,
        lastModified:
          item.updatedAt || item.createdAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [
      ...staticPages,
      ...articlePages,
      ...jobPages,
      ...educationPages,
    ];
  } catch (error) {
    console.error("Sitemap generation failed:", error);

    return [
      {
        url: base,
        changeFrequency: "hourly",
        priority: 1,
      },
    ];
  }
}