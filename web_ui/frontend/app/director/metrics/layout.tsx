import { ReactNode } from 'react';

import { PaddedContent } from '@/components/layout';
import GraphProvider from '@/components/graphs/GraphContext';
import AuthenticatedContent from '@/components/layout/AuthenticatedContent';

export const metadata = {
  title: 'Metrics',
};

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <PaddedContent>
      <GraphProvider>
        <AuthenticatedContent
          allowedRoles={['admin']}
          trustThenValidate={true}
          redirect={true}
        >
          {children}
        </AuthenticatedContent>
      </GraphProvider>
    </PaddedContent>
  );
};

export default Layout;
