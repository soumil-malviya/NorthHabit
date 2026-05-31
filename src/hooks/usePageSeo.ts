import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeoMetadata, resolveSeoMetadata, type SeoMetadata } from '../lib/seo';

export function usePageSeo(overrides?: Partial<SeoMetadata>) {
  const location = useLocation();

  useEffect(() => {
    applySeoMetadata(resolveSeoMetadata(location.pathname, overrides));
  }, [location.pathname, overrides]);
}
