import { useEffect, useState } from 'react';

export function getBrowserVisibilityProp() {
  const doc: any = document;
  if (typeof doc.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later support
    return 'visibilitychange';
  } else if (typeof doc.msHidden !== 'undefined') {
    return 'msvisibilitychange';
  } else if (typeof doc.webkitHidden !== 'undefined') {
    return 'webkitvisibilitychange';
  }
  return '';
}
export function getBrowserDocumentHiddenProp() {
    const doc: any = document;
  if (typeof doc.hidden !== 'undefined') {
    return 'hidden';
  } else if (typeof doc.msHidden !== 'undefined') {
    return 'msHidden';
  } else if (typeof doc.webkitHidden !== 'undefined') {
    return 'webkitHidden';
  }
  return '';
}
export function getIsDocumentHidden() {
  return !document[getBrowserDocumentHiddenProp()];
}

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(getIsDocumentHidden());
  const onVisibilityChange = () => setIsVisible(getIsDocumentHidden());
  useEffect(() => {
    const visibilityChange = getBrowserVisibilityProp();
    document.addEventListener(visibilityChange, onVisibilityChange, false);
    return () => {
      document.removeEventListener(visibilityChange, onVisibilityChange);
    };
  });
  return isVisible;
}
