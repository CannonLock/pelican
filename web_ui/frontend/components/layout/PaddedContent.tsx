import { Box } from '@mui/material';
import { ReactNode } from 'react';

export const PaddedContent = ({ children }: { children: ReactNode }) => {
  return (
    <Box m={2} mx={{ xs: 1, md: 2 }} flexGrow={1} maxWidth={'100vw'}>
      {children}
    </Box>
  );
};
