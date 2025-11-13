import { GetServerSideProps, GetServerSidePropsResult } from 'next';

import { AuthService } from '@/services/AuthService.server';
import { UserRole } from '@/types';

const unauthenticatedRedirect: GetServerSidePropsResult<Record<string, never>> = {
  redirect: {
    destination: '/login',
    permanent: false,
  },
};

export const withRoleGuard = (role: UserRole): GetServerSideProps => {
  return async ({ req }) => {
    const sessionToken = req.cookies.sessionToken;

    if (!sessionToken) {
      return unauthenticatedRedirect;
    }

    try {
      const user = await AuthService.validateSession(sessionToken);

      if (!user || user.role !== role) {
        return unauthenticatedRedirect;
      }

      return {
        props: {},
      };
    } catch (error) {
      console.error(`Role guard failed for ${role}`, error);
      return unauthenticatedRedirect;
    }
  };
};

