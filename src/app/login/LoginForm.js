// client/src/app/logins/LoginForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Container, TextField, Button, Typography, Paper, IconButton, 
  InputAdornment, CircularProgress, Alert, Snackbar, Link, 
  FormControlLabel, Checkbox, Box
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockPersonIcon from '@mui/icons-material/LockPerson';

// Enhanced fetcher
const fetcher = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } 
      catch { errorData = { message: `Request failed with status ${response.status}` }; }

      const errorMessages = {
        400: 'Invalid request - please check your input',
        401: 'Invalid email or password',
        403: 'Access denied',
        404: 'Service not found',
        429: 'Too many attempts - please try again later',
        500: 'Server error - please try again later',
      };

      throw new Error(errorData.message || errorMessages[response.status] || `Request failed (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw new Error(error.name === 'AbortError' 
      ? 'Request timed out - please check your connection' 
      : error.message);
  }
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '', password: '', showPassword: false, rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Get redirect parameter from URL
  const redirectPath = searchParams.get('redirect') || '/';

  // Handle session expired parameter and other redirect messages
  useEffect(() => {
    const sessionExpired = searchParams.get('session_expired');
    const registered = searchParams.get('registered');
    const loggedOut = searchParams.get('logged_out');

    if (sessionExpired) {
      setError('Your session has expired. Please login again.');
      setOpenSnackbar(true);
    } else if (registered) {
      setError('Registration successful! Please login with your credentials.');
      setOpenSnackbar(true);
    } else if (loggedOut) {
      setError('You have been successfully logged out.');
      setOpenSnackbar(true);
    }

    // Clean up the URL but preserve redirect parameter if it exists
    if (sessionExpired || registered || loggedOut) {
      const newUrl = redirectPath !== '/' 
        ? `${window.location.pathname}?redirect=${encodeURIComponent(redirectPath)}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, redirectPath]);

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveAuthData = (token, sessionId, userData) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('sessionId', sessionId); 
  localStorage.setItem('userData', JSON.stringify(userData));
  
  if (formData.rememberMe) {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('userEmail', formData.email);
  } else {
    localStorage.removeItem('userEmail');
  }
};

  // Load saved email if exists
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetcher('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        })
      });

      // Handle successful login
      if (response?.data?.user && response?.data?.sessionId) {
        saveAuthData(
          response.token, 
          response.data.sessionId, 
          response.data.user
        );

        // Show success message
        setError(`Welcome back, ${response.data.user.username || response.data.user.email}!`);
        setOpenSnackbar(true);

        // Enhanced redirect logic - FIXED
        setTimeout(() => {
          if (response.data.user.role === 'admin' || response.data.user.role === 'moderator') {
            router.push('/dashboard');
          } else {
            // Regular users go back to where they came from (blog page) or homepage
            const safeRedirect = redirectPath && redirectPath !== '/login' 
              ? redirectPath 
              : '/';
            router.push(safeRedirect);
          }
        }, 1000);

      } else {
        throw new Error('Invalid response from server - missing authentication data');
      }

    } catch (err) {
      // Enhanced error messages for common scenarios
      let userFriendlyError = err.message;
      
      if (err.message.includes('Invalid email or password')) {
        userFriendlyError = 'The email or password you entered is incorrect. Please try again.';
      } else if (err.message.includes('timeout')) {
        userFriendlyError = 'Connection timeout. Please check your internet connection and try again.';
      } else if (err.message.includes('Network')) {
        userFriendlyError = 'Network error. Please check your connection and try again.';
      }

      setError(userFriendlyError);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorClose = () => {
    setOpenSnackbar(false);
    setError(null);
  };

  const clearFieldError = (fieldName) => {
    setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  const isSuccessMessage = error && (
    error.includes('Welcome back') || 
    error.includes('successfully')
  );

  return (
    <Container maxWidth="sm" sx={{ 
      py: 4,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper elevation={3} sx={{ 
        padding: 4, 
        textAlign: 'center',
        borderRadius: 4,
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: 450
      }}>
        <LockPersonIcon sx={{ 
          fontSize: 50, 
          mb: 2, 
          color: '#4CAF4F' 
        }}/>
        
        <Typography variant="h4" component="h1" sx={{ 
          mb: 1, 
          fontWeight: 600,
          color: 'text.primary'
        }}>
          Welcome Back
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Sign in to your account to continue
        </Typography>
        
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, email: e.target.value }));
              clearFieldError('email');
            }}
            onBlur={() => validateForm()}
            sx={{ mb: 2 }}
            required
            autoComplete="email"
            autoFocus
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            disabled={loading}
          />
          
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            name="password"
            type={formData.showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, password: e.target.value }));
              clearFieldError('password');
            }}
            onBlur={() => validateForm()}
            sx={{ mb: 1 }}
            required
            autoComplete="current-password"
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      showPassword: !prev.showPassword 
                    }))}
                    edge="end"
                    disabled={loading}
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rememberMe: e.target.checked
                  }))}
                  color="primary"
                  disabled={loading}
                />
              }
              label="Remember me"
            />
            
            <Link 
              href="/forgot-password" 
              color="#4CAF4F"
              sx={{ 
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading || !formData.email || !formData.password}
            sx={{ 
              py: 1.5,
              mb: 3,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1rem',
              backgroundColor: '#4CAF4F',
              '&:hover:not(:disabled)': {
                backgroundColor: '#6A9B52',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0, 131, 132, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Don&apos;t have an account?{' '}
          <Link 
            href="/register" 
            color="#4CAF4F"
            sx={{ 
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Create one
          </Link>
        </Typography>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={isSuccessMessage ? 3000 : 6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleErrorClose} 
          severity={isSuccessMessage ? 'success' : 'error'}
          sx={{ 
            width: '100%',
            fontSize: '0.95rem',
            alignItems: 'center'
          }}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

