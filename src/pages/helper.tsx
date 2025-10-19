import Head from 'next/head';
import { NextPage } from 'next';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleLanding } from '@/components/landing/RoleLanding';
import { getRoleLandingConfig } from '@/components/landing/roleLandingConfigs';

const HelperLandingPage: NextPage = () => {
  const config = getRoleLandingConfig('helper');

  return (
    <>
      <Head>
        <title>Daily Task Hub | HerdView</title>
      </Head>
      <AuthGuard requiredRole="helper">
        <RoleLanding config={config} />
      </AuthGuard>
    </>
  );
};

export default HelperLandingPage;
