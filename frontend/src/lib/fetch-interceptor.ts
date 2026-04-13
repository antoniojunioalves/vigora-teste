/**
 * Intercepts the global fetch to inject the JWT auth token
 * and handle 401 unauthenticated errors.
 */

const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = input;
  let options = init || {};

  // Only intercept API calls
  if (typeof url === 'string' && url.startsWith('/api')) {
    const token = localStorage.getItem('vigora_token');
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  try {
    const response = await originalFetch(url, options);

    // Handle 401 globally
    if (response.status === 401 && typeof url === 'string' && !url.includes('/api/auth/login')) {
      localStorage.removeItem('vigora_token');
      // Dispatch event to auth provider to redirect
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    return response;
  } catch (error) {
    throw error;
  }
};

export {};
