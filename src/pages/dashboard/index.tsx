
import { GetServerSideProps } from 'next';
import { DashboardRouter } from '@/components/dashboards/DashboardRouter';
import { AuthService } from '@/services/AuthService.server';

export default function DashboardPage() {
  return <DashboardRouter />;
}

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
    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};