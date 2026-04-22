import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  noindex?: boolean;
  image?: string;
}

const SITE_NAME = 'Transport Advisory';
const SITE_URL = 'https://transportadvisory.ng';
const DEFAULT_DESCRIPTION =
  'Nigeria\'s vehicle compliance platform. Track Motor Insurance, Vehicle License, and Roadworthiness Certificate expiry dates in one place. Receive SMS and email reminders before documents expire and renew online without office visits.';
const DEFAULT_IMAGE = `${SITE_URL}/apple-touch-icon.svg`;

const routeMetadata: Record<string, { title: string; description?: string; noindex?: boolean }> = {
  '/': {
    title: 'Transport Advisory — Vehicle Compliance Platform for Nigeria',
    description: 'Never miss a vehicle document expiry again. Transport Advisory tracks your Motor Insurance, Vehicle License, and Roadworthiness Certificate, sends SMS and email reminders, and lets you renew online without licensing office visits. First 100 subscribers free.',
  },
  '/login': { title: 'Sign In · Transport Advisory', description: 'Sign in to manage your vehicle documents, track expiry dates, and renew online.' },
  '/register': { title: 'Create Account · Transport Advisory', description: 'Join Transport Advisory — Nigeria\'s smarter way to manage vehicle compliance documents.' },
  '/dashboard': { title: 'Dashboard · Transport Advisory', noindex: true },
  '/vehicles': { title: 'My Vehicles · Transport Advisory', noindex: true },
  '/applications': { title: 'Applications · Transport Advisory', noindex: true },
  '/verifications': { title: 'Vehicle Verification · Transport Advisory', noindex: true },
  '/settings': { title: 'Settings · Transport Advisory', noindex: true },
  '/admin': { title: 'Admin · Transport Advisory', noindex: true },
};

export default function SEO(props: SEOProps = {}) {
  const { pathname } = useLocation();

  // Pick closest-matching route metadata
  const routeMeta = routeMetadata[pathname]
    || Object.entries(routeMetadata).find(([k]) => k !== '/' && pathname.startsWith(k))?.[1]
    || routeMetadata['/'];

  const title = props.title || routeMeta.title;
  const description = props.description || routeMeta.description || DEFAULT_DESCRIPTION;
  const noindex = props.noindex ?? routeMeta.noindex ?? false;
  const image = props.image || DEFAULT_IMAGE;
  const url = `${SITE_URL}${pathname}`;
  const keywords = props.keywords
    || 'vehicle compliance nigeria, motor insurance reminder, vehicle license renewal, roadworthiness certificate, niid verification, hackney permit, lagos car papers, askniid, verify autoreg, vehicle documents nigeria';

  // Structured data (schema.org Organization + WebApplication)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
      description: 'Free for the first 100 subscribers',
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lagos',
        addressCountry: 'NG',
      },
    },
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_NG" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
