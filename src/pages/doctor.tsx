import Head from 'next/head';
import { NextPage } from 'next';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleLanding } from '@/components/landing/RoleLanding';
import { getRoleLandingConfig } from '@/components/landing/roleLandingConfigs';

const DoctorLandingPage: NextPage = () => {
  const config = getRoleLandingConfig('doctor');

  return (
    <>
      <Head>
        <title>Veterinary Care Suite | HerdView</title>
      </Head>
      <AuthGuard requiredRole="doctor">
        <RoleLanding config={config} />
      </AuthGuard>
    </>
  );
};

export default DoctorLandingPage;
