import Head from 'next/head';
import { NextPage } from 'next';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleLanding } from '@/components/landing/RoleLanding';
import { getRoleLandingConfig } from '@/components/landing/roleLandingConfigs';

const OfficeLandingPage: NextPage = () => {
  const config = getRoleLandingConfig('office');

  return (
    <>
      <Head>
        <title>Administrative Control | HerdView</title>
      </Head>
      <AuthGuard requiredRole="office">
        <RoleLanding config={config} />
      </AuthGuard>
    </>
  );
};

export default OfficeLandingPage;
