import { useEffect } from 'react';

// Sets the browser tab title for the current page. Each page calls it with its
// own title; the next page overwrites it on mount, so there's nothing to restore.
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
