import Head from 'next/head';
import { NextPage } from 'next';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleLanding } from '@/components/landing/RoleLanding';
import { getRoleLandingConfig } from '@/components/landing/roleLandingConfigs';

const TechnicianLandingPage: NextPage = () => {
  const config = getRoleLandingConfig('technician');

  return (
    <>
      <Head>
        <title>Synchronization Operations | HerdView</title>
      </Head>
      <AuthGuard requiredRole="technician">
        <RoleLanding config={config} />
      </AuthGuard>
    </>
  );
};

export default TechnicianLandingPage;
