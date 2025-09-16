'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  IconButton, 
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Link,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import { fetcher } from '@/lib/fetchWrapper';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    showPassword: false,
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const redirectUser = (role) => {
    if (!isMounted) return;
    const redirectTo = searchParams.get('from') || 
                      (role === 'admin' ? '/dashboard' : '/');
    router.replace(redirectTo);
  };

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = async () => {
      try {
        const data = await fetcher('/api/users/me');
        if (data?.user?.role) redirectUser(data.user.role);
      } catch (error) {
        // Stay on login page
      }
    };

    checkAuth();
  }, [isMounted, router, searchParams]);

// Replace handleSubmit with this backend-compatible version:
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const response = await fetcher('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      })
    });

    // Redirect based on role (aligned with backend's token structure)
    if (response?.data?.user?.role) {
      router.push(response.data.user.role === 'admin' ? '/dashboard' : '/');
    }
  } catch (err) {
    setError(err.message || 'Login failed');
    setOpenSnackbar(true);
  } finally {
    setLoading(false);
  }
};


  const handleErrorClose = () => {
    setOpenSnackbar(false);
  };

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
        width: '100%'
      }}>
        <LockPersonIcon sx={{ 
          fontSize: 50, 
          mb: 2, 
          color: 'primary.main' 
        }}/>
        
        <Typography variant="h4" component="h1" sx={{ 
          mb: 3, 
          fontWeight: 600,
          color: 'text.primary'
        }}>
          Welcome Back
        </Typography>
        
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              email: e.target.value 
            }))}
            sx={{ mb: 2 }}
            required
            autoComplete="email"
            autoFocus
            inputProps={{ 
              'data-testid': 'email-input',
              'aria-label': 'Email address'
            }}
            error={!!error && !formData.email}
            helperText={!!error && !formData.email && 'Email is required'}
          />
          
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            name="password"
            type={formData.showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              password: e.target.value 
            }))}
            sx={{ mb: 2 }}
            required
            autoComplete="current-password"
            inputProps={{ 
              'data-testid': 'password-input',
              'aria-label': 'Password',
              minLength: 8 
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      showPassword: !prev.showPassword 
                    }))}
                    edge="end"
                    aria-label={
                      formData.showPassword 
                        ? 'Hide password' 
                        : 'Show password'
                    }
                    data-testid="toggle-password"
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={!!error && !formData.password}
            helperText={!!error && !formData.password && 'Password is required'}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rememberMe}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  rememberMe: e.target.checked
                }))}
                color="primary"
                inputProps={{
                  'aria-label': 'Remember me',
                  'data-testid': 'remember-me-checkbox'
                }}
              />
            }
            label="Remember me"
            sx={{ mb: 2, justifyContent: 'flex-start' }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            disabled={loading || !formData.email || !formData.password}
            sx={{ 
              py: 1.5,
              mb: 2,
              borderRadius: 2,
              fontWeight: 600,
              letterSpacing: 0.5,
              '&:hover:not(:disabled)': { 
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.3s ease'
            }}
            data-testid="login-button"
            aria-busy={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>

          <Typography variant="body2" sx={{ mb: 1 }}>
            <Link 
              href="/forgot-password" 
              color="primary"
              sx={{ 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
              aria-label="Forgot password?"
            >
              Forgot password?
            </Link>
          </Typography>
        </form>

        <Typography variant="body1" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Link 
            href="/register" 
            color="primary"
            sx={{ 
              fontWeight: 500,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
            aria-label="Create an account"
          >
            Create one
          </Link>
        </Typography>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleErrorClose} 
          severity="error"
          sx={{ width: '100%' }}
          variant="filled"
          aria-live="assertive"
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}