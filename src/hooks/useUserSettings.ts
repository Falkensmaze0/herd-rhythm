'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/components/ui/use-toast';
import { UserSettings, UserSettingsUpdatePayload } from '@/types/userSettings';

const fetchSettings = async (): Promise<UserSettings> => {
  const response = await fetch('/api/user/settings', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to load user settings');
  }

  const payload = (await response.json()) as { success: boolean; data: UserSettings };
  return payload.data;
};

const submitSettings = async (payload: UserSettingsUpdatePayload): Promise<UserSettings> => {
  const response = await fetch('/api/user/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Unable to update user settings');
  }

  const responsePayload = (await response.json()) as { success: boolean; data: UserSettings };
  return responsePayload.data;
};

/**
 * Convenience hook that exposes the current user's settings plus helpers
 * for mutating them with optimistic cache updates and global toasts.
 */
export interface UpdateSettingsOptions {
  silent?: boolean;
  successTitle?: string;
  successDescription?: string;
}

interface UpdateSettingsArgs {
  payload: UserSettingsUpdatePayload;
  options?: UpdateSettingsOptions;
}

export const useUserSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['user-settings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: ({ payload }: UpdateSettingsArgs) => submitSettings(payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['user-settings'], data);
      if (!variables?.options?.silent) {
        toast({
          title: variables?.options?.successTitle ?? 'Profile updated',
          description:
            variables?.options?.successDescription ?? 'Your preferences are now in sync across the workspace.',
        });
      }
    },
    onError: (error: unknown, variables) => {
      console.error('Failed to update user settings', error);
      toast({
        title: variables?.options?.silent ? 'Auto-save failed' : 'Update failed',
        description: variables?.options?.silent
          ? 'We could not auto-save your changes. Please check your connection.'
          : 'We could not save your changes. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    updateSettings: (payload: UserSettingsUpdatePayload, options?: UpdateSettingsOptions) =>
      mutation.mutateAsync({ payload, options }),
    refetch: query.refetch,
  };
};
