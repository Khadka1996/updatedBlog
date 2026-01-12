'use client';

import React, { useState } from 'react';
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
  Box,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Username cannot exceed 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one capital letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // ✅ SUCCESS - REDIRECT TO LOGIN
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setFormData(prev => ({
      ...prev,
      [field === 'password' ? 'showPassword' : 'showConfirmPassword']: 
        !prev[field === 'password' ? 'showPassword' : 'showConfirmPassword']
    }));
  };

  return (
    <>
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper
            elevation={12}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 3,
              width: '100%',
              maxWidth: 480,
              background: 'linear-gradient(145deg, #ffffff, #f8fffe)',
              boxShadow: '0 20px 40px rgba(0,131,132,0.1)',
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              color="#008384"
              mb={1}
            >
              Join Us
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
              Create your account and start your journey
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Form fields remain the same */}
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username || '3-30 characters, letters, numbers, underscores only'}
                fullWidth
                margin="normal"
                required
                autoFocus
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
              />

              <TextField
                label="Password"
                name="password"
                type={formData.showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || 'Minimum 6 characters with one capital letter and one number'}
                fullWidth
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('password')}
                        edge="end"
                      >
                        {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={formData.showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                fullWidth
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        edge="end"
                      >
                        {formData.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="/terms" underline="hover" color="#008384" fontWeight={500}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" underline="hover" color="#008384" fontWeight={500}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mt: 2, alignItems: 'flex-start' }}
              />
              {errors.acceptTerms && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
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
                  mt: 3,
                  py: 1.8,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  backgroundColor: '#008384',
                  '&:hover': {
                    backgroundColor: '#006666',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 20px rgba(0,131,132,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={28} color="inherit" />
                ) : success ? (
                  'Account Created!'
                ) : (
                  'Create Account'
                )}
              </Button>

              <Typography textAlign="center" mt={3} color="text.secondary">
                Already have an account?{' '}
                <Link href="/login" color="#008384" fontWeight={600} underline="none">
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Success Alert */}
        <Snackbar open={success} autoHideDuration={4000}>
          <Alert severity="success" variant="filled">
            Registration successful! Redirecting to login...
          </Alert>
        </Snackbar>

        {/* Error Alert */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error" variant="filled" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}