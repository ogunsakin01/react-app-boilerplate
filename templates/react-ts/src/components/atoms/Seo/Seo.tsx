import { useEffect } from 'react';

export type SeoProps = {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  siteName?: string;
  type?: 'website' | 'article' | 'profile';
  robots?: string;
  locale?: string;
};

export function Seo({
  title,
  description,
  canonical,
  image,
  siteName,
  type = 'website',
  robots,
  locale,
}: SeoProps) {
  // index.html ships default description / Open Graph tags (data-seo-default)
  // for crawlers that don't run JavaScript. Once a page renders its own tags,
  // drop the defaults so the document doesn't carry two of each.
  useEffect(() => {
    for (const el of document.head.querySelectorAll('[data-seo-default]')) el.remove();
  }, []);

  const fullTitle = siteName ? `${title} · ${siteName}` : title;
  const twitterCard = image ? 'summary_large_image' : 'summary';

  return (
    <>
      <title>{fullTitle}</title>
      {description ? <meta name="description" content={description} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {robots ? <meta name="robots" content={robots} /> : null}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:type" content={type} />
      {description ? <meta property="og:description" content={description} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {image ? <meta property="og:image" content={image} /> : null}
      {siteName ? <meta property="og:site_name" content={siteName} /> : null}
      {locale ? <meta property="og:locale" content={locale} /> : null}

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      {image ? <meta name="twitter:image" content={image} /> : null}
    </>
  );
}
