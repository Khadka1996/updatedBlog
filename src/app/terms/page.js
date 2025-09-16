'use client'
import React from 'react';
import { 
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Link
} from '@mui/material';
import { useRouter } from 'next/navigation';

const Terms = () => {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ 
        p: 4,
        borderRadius: 2,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            mb: 4,
            fontWeight: 700,
            color: '#52aa4d',
            textAlign: 'center'
          }}
        >
          Terms and Conditions
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            Last Updated: {new Date().toLocaleDateString()}
          </Typography>
          <Typography variant="body1" paragraph>
            Please read these Terms and Conditions carefully before using our service.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            2. User Responsibilities
          </Typography>
          <Typography variant="body1" paragraph>
            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device.
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to accept responsibility for all activities that occur under your account or password.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            3. Content Ownership
          </Typography>
          <Typography variant="body1" paragraph>
            All content posted by users remains the property of the respective owners. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            4. Prohibited Activities
          </Typography>
          <Typography variant="body1" component="ul" sx={{ pl: 3 }}>
            <li>Violating any laws or regulations</li>
            <li>Posting harmful or offensive content</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Engaging in any activity that disrupts our services</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            5. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            6. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            In no event shall we be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            7. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify these terms at any time. We will provide notice of any changes by posting the new Terms on this page.
          </Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => router.back()}
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: '#52aa4d',
              '&:hover': {
                backgroundColor: '#499740',
              },
              fontWeight: 600
            }}
          >
            I Understand
          </Button>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            If you have any questions about these Terms, please contact us at{' '}
            <Link href="mailto:legal@yourdomain.com" color="primary">
              legal@yourdomain.com
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Terms;