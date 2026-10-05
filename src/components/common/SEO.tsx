import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'product';
}

const DEFAULT_TITLE = 'METALIC — Premium Metal Posters Bangladesh';
const DEFAULT_DESCRIPTION =
  'High-definition 1mm steel metal posters in Bangladesh. 20×30 cm & 30×20 cm formats with 3 pieces of damage-free nano tape. 100% Cash on Delivery nationwide.';
const DEFAULT_IMAGE = '/logo.png';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://metalic.com.bd';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = ['metal posters', 'wall art bangladesh', 'anime metal posters', 'steel art', 'cash on delivery'],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
}) => {
  const pageTitle = title ? `${title} | METALIC` : DEFAULT_TITLE;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const ogImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* স্ট্যান্ডার্ড মেটা ট্যাগস */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ওপেন গ্রাফ (Facebook, WhatsApp, LinkedIn প্রিভিউ) */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="METALIC Bangladesh" />

      {/* টুইটার / X কার্ড প্রিভিউ */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
    </Helmet>
  );
};

SEO.displayName = 'SEO';