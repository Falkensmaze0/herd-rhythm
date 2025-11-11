import React from 'react';
import Head from 'next/head';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardRouter } from '@/components/dashboards/DashboardRouter';
import { GetServerSideProps } from 'next';
import { AuthService } from '@/services/AuthService.server';

const DoctorPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Doctor Dashboard | HerdView</title>
      </Head>
      <AuthGuard requiredRole="doctor">
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
    
    if (!user || user.role !== 'doctor') {
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

export default DoctorPage;