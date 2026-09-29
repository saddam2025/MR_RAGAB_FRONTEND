import { useEffect } from 'react';

const DEFAULT_TITLE = 'Mr Attia Kamel';
const DEFAULT_DESCRIPTION = 'Mr Attia Kamel - منصة تعليم الرياضيات';

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
  return element;
}

// This component intentionally renders nothing. It only keeps tenant-specific
// document metadata in <head> while the tenant homepage is mounted.
export default function TenantSeoHead({ tenant, tenantId }) {
  useEffect(() => {
    if (!tenant?.name || !tenantId) return undefined;

    const name = 'Mr Attia Kamel';
    const title = DEFAULT_TITLE;
    const description = `منصة ${name} لتعليم الرياضيات للمرحلتين الإعدادية والثانوية، بخبرة 20 سنة في التدريس. محاضرات، واجبات، اختبارات شهرية، ومتابعة مستمرة لمستوى كل طالب.`;
    const url = new URL(`/${encodeURIComponent(tenantId)}`, window.location.origin).href;
    const image = '/assets/brand/attia-logo.png';
    const imageUrl = image ? new URL(image, window.location.origin).href : '';

    document.title = title;
    const favicon = document.head.querySelector('link[rel="icon"]');
    const originalFaviconHref = favicon?.getAttribute('href') || '';
    if (tenant.faviconUrl) {
      const faviconLink = favicon || document.head.appendChild(document.createElement('link'));
      faviconLink.setAttribute('rel', 'icon');
      faviconLink.setAttribute('href', tenant.faviconUrl);
      faviconLink.setAttribute('type', 'image/png');
    }
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    if (imageUrl) upsertMeta('property', 'og:image', imageUrl);

    const structuredData = document.createElement('script');
    structuredData.id = 'tenant-educational-organization-jsonld';
    structuredData.type = 'application/ld+json';
    structuredData.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name,
      url
    });
    document.head.querySelector(`#${structuredData.id}`)?.remove();
    document.head.appendChild(structuredData);

    return () => {
      document.title = DEFAULT_TITLE;
      if (favicon && originalFaviconHref) favicon.setAttribute('href', originalFaviconHref);
      upsertMeta('name', 'description', DEFAULT_DESCRIPTION);
      ['og:title', 'og:description', 'og:image', 'og:type'].forEach((property) => {
        document.head.querySelector(`meta[property="${property}"]`)?.remove();
      });
      structuredData.remove();
    };
  }, [tenant, tenantId]);

  return null;
}
