
import { GetServerSideProps } from 'next';
import { AuthService } from '@/services/AuthService.server';
import { UserRole } from '@/types';

// Role-based landing page routes
const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  admin: '/admin',
  manager: '/manager',
  doctor: '/doctor',
  technician: '/technician',
  helper: '/helper',
  office: '/office',
};

const Index = () => {
  // This page only handles redirection, so we don't need to render anything
  return null;
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
    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Redirect to role-specific dashboard
    const redirectPath = ROLE_HOME_ROUTE[user.role] || '/login';
    return {
      redirect: {
        destination: redirectPath,
        permanent: false,
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

export default Index;

