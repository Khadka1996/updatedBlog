export const fetcher = async (url, options = {}) => {
  const controller = new AbortController();
  const TIMEOUT = 8000; 
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add CSRF protection if enabled
    if (process.env.NEXT_PUBLIC_CSRF_HEADER) {
      headers[process.env.NEXT_PUBLIC_CSRF_HEADER] = 'true';
    }

    // Make the request
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 (Unauthorized)
    if (res.status === 401 && !url.includes('/login')) {
      try {
        // Attempt token refresh
        await fetch('/api/auth/refresh', { 
          method: 'POST',
          credentials: 'include'
        });
        // Retry original request with new token
        return fetcher(url, options);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = '/login?session_expired=1';
        throw new Error('Session expired');
      }
    }

    // Handle rate limiting
    if (res.status === 429) {
      throw new Error('Too many requests - please try again later');
    }

    // Handle other errors
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }

    // Successful response
    return res.status === 204 ? null : await res.json();

  } catch (error) {
    clearTimeout(timeoutId);
    
    // Special handling for timeout errors
    const errorMessage = error.name === 'AbortError'
      ? `Request timed out after ${TIMEOUT/1000} seconds`
      : error.message;

    if (process.env.NODE_ENV === 'development') {
      console.error('Fetch error:', { url, error: errorMessage });
    }

    throw new Error(errorMessage);
  }
};