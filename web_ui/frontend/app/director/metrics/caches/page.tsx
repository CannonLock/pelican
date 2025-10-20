"use client";

import { fetchApi } from "@/helpers/api";
import {
  Typography,
  Breadcrumbs,
  Box,
  Link,
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
  TableRow,
  BoxProps,
} from '@mui/material';
import { useContext, useMemo, ReactNode } from 'react';
import { ServerGeneral } from '@/types';
import { GraphOverlay } from "@/components/graphs/GraphOverlay";
import { GraphContext } from '@/components/graphs/GraphContext';
import useApiSWR from '@/hooks/useApiSWR';
import { replaceQueryParameters, query_raw, VectorResponseData, SuccessResponse } from '@/components/graphs/prometheus';
import humanReadableSeconds from '@/helpers/humanReadableSeconds';
import { toBytesString } from '@/helpers/bytes';
import { TextSkeleton } from '@/components';
import useSWR from 'swr';


const Page = () => {

  return (
    <Box>
      <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 1 }}>
        <Link underline='hover' color='inherit' href='../../'>
          Metrics
        </Link>
        <Typography color='text.primary'>Caches</Typography>
      </Breadcrumbs>
      <GraphOverlay>
        <CacheTable />
      </GraphOverlay>
    </Box>
  )
}

export default Page;
