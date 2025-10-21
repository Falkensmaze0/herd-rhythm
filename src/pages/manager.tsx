import Head from 'next/head';
import { NextPage } from 'next';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleLanding } from '@/components/landing/RoleLanding';
import { getRoleLandingConfig } from '@/components/landing/roleLandingConfigs';

const ManagerLandingPage: NextPage = () => {
  const config = getRoleLandingConfig('manager');

  return (
    <>
      <Head>
        <title>Manager Operations Hub | HerdView</title>
      </Head>
      <AuthGuard requiredRole="manager">
        <RoleLanding config={config} />
      </AuthGuard>
    </>
  );
};

export default ManagerLandingPage;
