'use client';

import CacheMetricPage from '@/components/graphs/CacheMetricPage';
import { Suspense } from 'react';
import { Breadcrumbs, Link, Skeleton, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { GraphOverlay } from "@/components/graphs/GraphOverlay";

const RemoteCacheServerName = () => {

  const params = useSearchParams();
  const serverName = params.get('server_name') || undefined;

  return<Typography color='text.primary'>{serverName}</Typography>
}

const RemoteCachePage = () => {
  const params = useSearchParams();
  const serverName = params.get('server_name') || undefined;

  return (<CacheMetricPage server_name={serverName} />)
};

const Page = () => {
  return (
    <>
      <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 1 }}>
        <Link underline='hover' color='inherit' href='../../'>
          Metrics
        </Link>
        <Link underline='hover' color='inherit' href='../'>
          Caches
        </Link>
        <Suspense fallback={<Skeleton height={'1rem'} width={'10rem'} />}>
          <RemoteCacheServerName />
        </Suspense>
      </Breadcrumbs>
      <GraphOverlay>
        <Suspense fallback={<Skeleton />}>
          <RemoteCachePage />
        </Suspense>
      </GraphOverlay>
    </>

  );
};

export default Page;
