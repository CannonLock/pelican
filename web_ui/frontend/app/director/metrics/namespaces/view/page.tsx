'use client';


import { Suspense } from 'react';
import { Box, Breadcrumbs, Link, Skeleton, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import NamespaceTable from '@/app/director/metrics/components/NamespaceTable';
import { GraphOverlay } from "@/components/graphs/GraphOverlay";

const RemoteNamespacePage = () => {
  const params = useSearchParams();
  const namespace = params.get('namespace') || undefined;

  return (
    <Box>
      <Breadcrumbs separator="›" aria-label='breadcrumb' sx={{ mb: 1 }}>
        <Link underline='hover' color='inherit' href='../../'>
          Metrics
        </Link>
        <Link underline='hover' color='inherit' href='../'>Namespaces</Link>
        <Typography color='text.primary'>{namespace}</Typography>
      </Breadcrumbs>
      <GraphOverlay>
        <NamespaceTable />
      </GraphOverlay>
    </Box>
  );
};

const Page = () => {
  return <RemoteNamespacePage />;
};

export default Page;
