
import Link from 'next/link';
import { api, fmtDate } from '../../../lib/api';
import { JsonLd, breadcrumb } from '../../../lib/schema';
import ArticleActions from '../../../components/ArticleActions';
import HistoryWriter from '../../../components/HistoryWriter';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://chakriokhobor.onrender.com';

async function getArticle(slug) {
  try {
    const result = await api(
      '/articles/' + encodeURIComponent(slug)
    );

    return result?.data || null;
  } catch {
    return null;
  }
}

export default async function Article({ params }) {
  const { slug } = await params;

  const decodedSlug = decodeURIComponent(slug || '').trim();

  const a = await getArticle(decodedSlug);

  if (!a) {
    return (
      <section className="section">
        <div className="container">
          <div className="card empty">
            <h1>খবরটি পাওয়া যায়নি</h1>

            <p className="muted">
              খবরটি মুছে ফেলা, draft অবস্থায় থাকা অথবা পুরোনো
              লিংক হতে পারে।
            </p>

            <Link className="btn" href="/news">
              সর্বশেষ খবর দেখুন
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const articleUrl =
    `${SITE_URL}/news/${encodeURIComponent(a.slug)}`;

  const title =
    a.seo?.title ||
    a.title ||
    'খবর';

  const description =
    a.seo?.description ||
    a.excerpt ||
    a.title ||
    'ChakriOKhobor-এর সর্বশেষ খবর।';

  const image =
    a.featuredImage ||
    `${SITE_URL}/og-image.jpg`;

  const authorName =
    a.author?.name ||
    'ChakriOKhobor';

  /*
   * NewsArticle Structured Data
   */
  const newsSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',

    '@id': `${articleUrl}#newsarticle`,

    headline: a.title,

    description,

    datePublished:
      a.publishedAt ||
      a.createdAt,

    dateModified:
      a.updatedAt ||
      a.publishedAt ||
      a.createdAt,

    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },

    url: articleUrl,

    image: [image],

    author: {
      '@type': 'Person',
      name: authorName,
    },

    publisher: {
      '@type': 'Organization',
      name: 'ChakriOKhobor',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },

    articleSection:
      a.category || 'News',

    isAccessibleForFree: true,
  };

  /*
   * Breadcrumb Structured Data
   */
  const breadcrumbSchema = breadcrumb([
    {
      name: 'Home',
      url: SITE_URL,
    },
    {
      name: 'News',
      url: `${SITE_URL}/news`,
    },
    {
      name: a.title,
      url: articleUrl,
    },
  ]);

  return (
    <>
      <JsonLd data={newsSchema} />

      <JsonLd data={breadcrumbSchema} />

      <HistoryWriter article={a} />

      <section className="section">
        <div className="container detailGrid">

          <article className="prose">

            <div className="articleTop">
              <span className="tag">
                {a.category || 'News'}
              </span>

              {a.isBreaking && (
                <span className="dangerBadge">
                  BREAKING
                </span>
              )}
            </div>

            <h1>{a.title}</h1>

            <p className="muted">
              {fmtDate(a.publishedAt)} · {authorName} ·{' '}
              {a.views || 0} views
            </p>

            {a.featuredImage && (
              <img
                className="articleImage"
                src={a.featuredImage}
                alt={a.title}
                loading="eager"
              />
            )}

            <ArticleActions article={a} />

            {a.excerpt && (
              <p className="articleExcerpt">
                <b>{a.excerpt}</b>
              </p>
            )}

            <div
              className="articleBody"
              dangerouslySetInnerHTML={{
                __html: a.content || '',
              }}
            />

            {a.youtubeUrl &&
              youtubeEmbed(a.youtubeUrl) && (
                <div className="videoBox">
                  <h3>▶ ভিডিও</h3>

                  <iframe
                    src={youtubeEmbed(a.youtubeUrl)}
                    title={a.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}

            {a.source?.url && (
              <p>
                Source:{' '}
                <a
                  href={a.source.url}
                  rel="nofollow noopener"
                >
                  {a.source.name || a.source.url}
                </a>
              </p>
            )}

          </article>

          <aside className="card articleAside">
            <h3>পাঠকের জন্য</h3>

            <p className="muted">
              খবরটি গুরুত্বপূর্ণ হলে Save করুন। পরে
              Dashboard থেকে আবার পড়তে পারবেন।
            </p>

            <Link
              href="/news"
              className="btn secondary"
            >
              আরও খবর →
            </Link>
          </aside>

        </div>
      </section>
    </>
  );
}

function youtubeEmbed(url = '') {
  try {
    const u = new URL(url);

    let id = u.searchParams.get('v');

    if (!id && u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1);
    }

    if (
      !id &&
      u.pathname.includes('/shorts/')
    ) {
      id = u.pathname
        .split('/shorts/')[1]
        ?.split('/')[0];
    }

    return id
      ? `https://www.youtube.com/embed/${id}`
      : '';
  } catch {
    return '';
  }
}


/*
 * Dynamic SEO Metadata
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const decodedSlug =
    decodeURIComponent(slug || '').trim();

  const a = await getArticle(decodedSlug);

  if (!a) {
    return {
      title: 'খবর পাওয়া যায়নি | ChakriOKhobor',
      description:
        'এই খবরটি বর্তমানে পাওয়া যাচ্ছে না।',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title =
    a.seo?.title ||
    a.title ||
    'খবর';

  const description =
    a.seo?.description ||
    a.excerpt ||
    a.title ||
    'ChakriOKhobor-এর সর্বশেষ খবর।';

  const canonical =
    a.seo?.canonical ||
    `${SITE_URL}/news/${encodeURIComponent(a.slug)}`;

  const image =
    a.featuredImage ||
    `${SITE_URL}/og-image.jpg`;

  return {
    title,

    description,

    keywords:
      a.seo?.keywords || undefined,

    authors: [
      {
        name:
          a.author?.name ||
          'ChakriOKhobor',
      },
    ],

    creator:
      a.author?.name ||
      'ChakriOKhobor',

    publisher: 'ChakriOKhobor',

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    openGraph: {
      type: 'article',

      url: canonical,

      title,

      description,

      siteName: 'ChakriOKhobor',

      locale: 'bn_BD',

      publishedTime:
        a.publishedAt ||
        a.createdAt,

      modifiedTime:
        a.updatedAt ||
        a.publishedAt ||
        a.createdAt,

      authors: [
        a.author?.name ||
        'ChakriOKhobor',
      ],

      section:
        a.category ||
        'News',

      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: a.title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',

      title,

      description,

      images: [image],
    },
  };
}

