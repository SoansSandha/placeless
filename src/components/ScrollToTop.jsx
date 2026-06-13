import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets the window to the top on every route change. Client-side navigation
// otherwise carries over the previous page's scroll position.
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
