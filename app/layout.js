import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdSense from '../components/AdSense';

const API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function getSiteSettings() {
  // API URL না থাকলেও build যেন crash না করে
  if (!API) return {};

  try {
    const res = await fetch(`${API}/site-settings`, {
      cache: 'no-store',
    });

    if (!res.ok) return {};

    const json = await res.json();
    return json?.data || {};
  } catch {
    return {};
  }
}

export async function generateMetadata() {
  const s = await getSiteSettings();

  // Cloudflare/Vercel-এ variable না থাকলেও fallback থাকবে
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    metadataBase: new URL(base),

    title: {
      default:
        s.siteTitle || 'ChakriOKhobor | চাকরি, শিক্ষা ও খবর',
      template: '%s | ChakriOKhobor',
    },

    description:
      s.siteDescription ||
      'বাংলাদেশের চাকরি, শিক্ষা ও গুরুত্বপূর্ণ খবরের প্ল্যাটফর্ম।',

    keywords: (
      s.keywords ||
      'বাংলাদেশ খবর, চাকরি, শিক্ষা, চাকরির খবর'
    )
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean),

    alternates: s.canonical
      ? {
          canonical: s.canonical,
        }
      : undefined,

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      title:
        s.siteTitle ||
        'ChakriOKhobor | চাকরি, শিক্ষা ও খবর',

      description:
        s.siteDescription ||
        'বাংলাদেশের চাকরি, শিক্ষা ও গুরুত্বপূর্ণ খবরের প্ল্যাটফর্ম।',

      type: 'website',
    },
  };
}

export default async function Layout({ children }) {
  const s = await getSiteSettings();

  return (
    <html lang="bn">
      <body>
        <Header />

        <main>{children}</main>

        {s.adsenseEnabled &&
          s.adsenseClient &&
          s.adsenseSlot && (
            <div className="container adWrap">
              <AdSense
                client={s.adsenseClient}
                slot={s.adsenseSlot}
              />
            </div>
          )}

        <Footer />
      </body>
    </html>
  );
}