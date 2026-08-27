'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export function useTableQueryState({ defaultPageSize = 20 } = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') || defaultPageSize, 10)));
  const sortBy = searchParams.get('sort') || '';
  const sortDir = searchParams.get('dir') || 'desc';
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || 'all';
  const type = searchParams.get('type') || 'all';

  const setParams = (updates) => {
    const params = new URLSearchParams(searchParams);

    // Reset page to 1 if any non-page param changes
    const isPageParamChange = Object.keys(updates).some(k => k !== 'page' && k !== 'pageSize');
    if (isPageParamChange && !updates.page) {
      params.set('page', '1');
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => {
      router.push(newUrl, { scroll: false });
    });
  };

  return {
    page,
    pageSize,
    sortBy,
    sortDir,
    q,
    status,
    type,
    setParams,
    isPending,
  };
}
