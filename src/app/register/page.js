'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import dynamic from 'next/dynamic';

// Dynamically import PasswordStrengthBar to avoid SSR issues
const PasswordStrengthBar = dynamic(() => import('react-password-strength-bar'), {
  ssr: false, // Disable server-side rendering for this component
});

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    showPassword: false,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [passwordScore, setPasswordScore] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering for components that depend on browser APIs
  useEffect(() => {
    setIsClient(true); // Set to true only on client
    return () => {
      setError(null);
      setErrors({});
    };
  }, []);

  // Validate form inputs
  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username cannot exceed 30 characters';
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Valid email is required';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordScore < 2) {
      newErrors.password = 'Please choose a stronger password';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle password strength score changes
  const handlePasswordStrengthChange = (score) => {
    setPasswordScore(score);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      let errorMessage = 'Registration failed';
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out - server not responding';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server';
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 4,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: { xs: 3, sm: 4 },
          borderRadius: 2,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)',
          width: '100%',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 3,
            fontWeight: 600,
            textAlign: 'center',
            color: 'primary.main',
          }}
        >
          Create Your Account
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            fullWidth
            margin="normal"
            required
            autoComplete="username"
            inputProps={{
              minLength: 3,
              maxLength: 30,
              'data-testid': 'username-input',
            }}
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
            inputProps={{
              'data-testid': 'email-input',
            }}
          />

          <TextField
            label="Password"
            name="password"
            type={formData.showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password || 'Minimum 8 characters with uppercase and number'}
            fullWidth
            margin="normal"
            required
            autoComplete="new-password"
            inputProps={{
              'data-testid': 'password-input',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                    edge="end"
                    data-testid="toggle-password"
                  >
                    {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {isClient && formData.password && (
            <PasswordStrengthBar
              password={formData.password}
              minLength={8}
              onChangeScore={handlePasswordStrengthChange}
              style={{
                marginBottom: 16,
                marginTop: 4,
              }}
              scoreWords={['Very Weak', 'Weak', 'Okay', 'Good', 'Strong']}
              shortScoreWord="Too short"
            />
          )}

          <FormControlLabel
            control={
              <Checkbox
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    acceptTerms: e.target.checked,
                  }));
                  if (errors.acceptTerms) {
                    setErrors((prev) => ({ ...prev, acceptTerms: undefined }));
                  }
                }}
                color="primary"
                sx={{
                  color: errors.acceptTerms ? 'error.main' : undefined,
                }}
                inputProps={{
                  'data-testid': 'terms-checkbox',
                }}
              />
            }
            label={
              <Typography variant="body2" component="span">
                I agree to the{' '}
                <Link href="/terms" color="primary" sx={{ fontWeight: 500 }}>
                  Terms and Conditions
                </Link>
              </Typography>
            }
            sx={{
              mb: errors.acceptTerms ? 0.5 : 2,
              mt: 1,
              alignItems: 'flex-start',
            }}
          />
          {errors.acceptTerms && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {errors.acceptTerms}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || success}
            sx={{
              py: 1.5,
              mb: 2,
              borderRadius: 2,
              fontWeight: 600,
              letterSpacing: 0.5,
              '&:hover': {
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
            data-testid="register-button"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : success ? (
              '✓ Registration Successful!'
            ) : (
              'Create Account'
            )}
          </Button>

          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              mt: 2,
            }}
          >
            Already have an account?{' '}
            <Link href="/login" color="primary" sx={{ fontWeight: 500 }}>
              Sign In
            </Link>
          </Typography>
        </form>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          severity="error"
          sx={{ width: '100%' }}
          variant="filled"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert severity="success" sx={{ width: '100%' }} variant="filled">
          Registration successful! Redirecting to login...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;