import Head from 'next/head';
import { NextPage } from 'next';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleLanding } from '@/components/landing/RoleLanding';
import { getRoleLandingConfig } from '@/components/landing/roleLandingConfigs';

const AdminLandingPage: NextPage = () => {
  const config = getRoleLandingConfig('admin');

  return (
    <>
      <Head>
        <title>Admin Command Center | HerdView</title>
      </Head>
      <AuthGuard requiredRole="admin">
        <RoleLanding config={config} />
      </AuthGuard>
    </>
  );
};

export default AdminLandingPage;
