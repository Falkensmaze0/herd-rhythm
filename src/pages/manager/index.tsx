import React from 'react';
import Head from 'next/head';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardRouter } from '@/components/dashboards/DashboardRouter';
import { GetServerSideProps } from 'next';
import { AuthService } from '@/services/AuthService.server';

const ManagerPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Operations Command | HerdView</title>
      </Head>
      <AuthGuard requiredRole="manager">
        <DashboardRouter />
      </AuthGuard>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const sessionToken = req.cookies.sessionToken;
  
  if (!sessionToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const user = await AuthService.validateSession(sessionToken);
    
    if (!user || user.role !== 'manager') {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};

export default ManagerPage;