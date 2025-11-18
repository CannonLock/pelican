"use client";

import {
  Typography,
  Breadcrumbs,
  Box,
  Link
} from '@mui/material';

import { GraphOverlay } from "@/components/graphs/GraphOverlay";
import NamespaceTable from '../components/NamespaceTable';

const Page = () => {

  return (
    <Box>
      <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 1 }}>
        <Link underline='hover' color='inherit' href='../'>
          Metrics
        </Link>
        <Typography color='text.primary'>Namespaces</Typography>
      </Breadcrumbs>
      <GraphOverlay>
        <NamespaceTable />
      </GraphOverlay>
    </Box>
  )
}

export default Page;
