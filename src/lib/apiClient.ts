type RequestInput = RequestInfo | URL;

/**
 * Adds the bearer token stored in localStorage (if present) and enforces cookie
 * credentials so API routes can authenticate both session + token in dev.
 */
export const fetchWithAuth = async (input: RequestInput, init: RequestInit = {}) => {
  const headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers);

  if (typeof window !== 'undefined') {
    const sessionToken = window.localStorage.getItem('sessionToken');
    if (sessionToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${sessionToken}`);
    }
  }

  if (headers !== init.headers) {
    // Only spread if we created a new Headers instance
    init = { ...init, headers };
  }

  return fetch(input, {
    ...init,
    credentials: init.credentials ?? 'include',
  });
};

/**
 * Convenience helper for JSON APIs. Throws with the parsed error payload if the
 * request fails, mirroring the fetch API ergonomics but adding better context.
 */
export const fetchJsonWithAuth = async <T>(
  input: RequestInput,
  init: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithAuth(input, init);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = (data as { message?: string })?.message || response.statusText;
    throw new Error(error);
  }

  return data as T;
};
