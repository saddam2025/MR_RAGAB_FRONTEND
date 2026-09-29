import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

// Scroll after every route change. The delegated link handler also covers a
// click on the current sidebar page, where React Router does not change route.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToPageTop();
  }, [pathname]);

  useEffect(() => {
    const handleInternalLinkClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin === window.location.origin) window.setTimeout(scrollToPageTop, 0);
    };
    document.addEventListener('click', handleInternalLinkClick);
    return () => document.removeEventListener('click', handleInternalLinkClick);
  }, []);

  return null;
}
