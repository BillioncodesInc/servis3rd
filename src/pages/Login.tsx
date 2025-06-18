import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  Paper,
  Fade,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountBalance,
  Lock,
  Business,
  Person,
  ArrowForward,
  Security,
  PhoneAndroid,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    companyId: '',
    userId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBusinessLogin, setIsBusinessLogin] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(
        formData.userId,
        formData.password,
        isBusinessLogin ? formData.companyId : undefined
      );

      if (result.success && result.user) {
        // Check if user has 2FA enabled
        if (result.user.settings.twoFactorAuth) {
          setTempUser(result.user);
          setShow2FA(true);
          setIsLoading(false);
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      setIsLoading(false);
    }
  };

  const handle2FASubmit = () => {
    if (tempUser && twoFactorCode === tempUser.settings.twoFactorCode) {
      // Store the authenticated user
      localStorage.setItem('currentUser', JSON.stringify(tempUser));
      // Force a page reload to update the auth context
      window.location.href = '/dashboard';
    } else {
      setError('Invalid verification code. Please try again.');
      setTwoFactorCode('');
    }
  };

  const handle2FACancel = () => {
    setShow2FA(false);
    setTwoFactorCode('');
    setTempUser(null);
    setFormData({ companyId: '', userId: '', password: '' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      />

      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Card 
            elevation={24}
            sx={{
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              <Box textAlign="center" mb={4}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(0, 51, 102, 0.3)',
                  }}
                >
                  <AccountBalance sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                  Welcome to Servis3rd
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your trusted partner in digital banking
                </Typography>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  mb: 4,
                  p: 0.5,
                  backgroundColor: 'grey.100',
                  borderRadius: 2,
                }}
              >
                <Button
                  fullWidth
                  variant={!isBusinessLogin ? 'contained' : 'text'}
                  startIcon={<Person />}
                  onClick={() => {
                    setIsBusinessLogin(false);
                    setFormData({ ...formData, companyId: '' });
                    setError('');
                  }}
                  sx={{
                    borderRadius: 1.5,
                    py: 1.5,
                    boxShadow: !isBusinessLogin ? 2 : 0,
                    '&:hover': {
                      boxShadow: !isBusinessLogin ? 4 : 0,
                    },
                  }}
                  disableElevation={isBusinessLogin}
                >
                  Personal
                </Button>
                <Button
                  fullWidth
                  variant={isBusinessLogin ? 'contained' : 'text'}
                  startIcon={<Business />}
                  onClick={() => {
                    setIsBusinessLogin(true);
                    setError('');
                  }}
                  sx={{
                    borderRadius: 1.5,
                    py: 1.5,
                    boxShadow: isBusinessLogin ? 2 : 0,
                    '&:hover': {
                      boxShadow: isBusinessLogin ? 4 : 0,
                    },
                  }}
                  disableElevation={!isBusinessLogin}
                >
                  Business
                </Button>
              </Paper>

              {error && (
                <Fade in>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                    }}
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit}>
                {isBusinessLogin && (
                  <Fade in>
                    <TextField
                      fullWidth
                      label="Company ID"
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleChange}
                      margin="normal"
                      required
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Fade>
                )}

                <TextField
                  fullWidth
                  label="User ID"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <Box sx={{ mt: 1, mb: 3, textAlign: 'right' }}>
                  <Link
                    href="#"
                    variant="body2"
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  endIcon={!isLoading && <ArrowForward />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
                    boxShadow: '0 4px 20px rgba(0, 51, 102, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 30px rgba(0, 51, 102, 0.4)',
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <Divider sx={{ my: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  New to Servis3rd?
                </Typography>
                <Link
                  href="#"
                  sx={{
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Open an Account
                </Link>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  pt: 3,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <Security fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Your connection is secure and encrypted
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            © 2024 Servis3rd Bank. All rights reserved.
          </Typography>
        </Box>
      </Container>

      {/* 2FA Dialog */}
      <Dialog open={show2FA} onClose={handle2FACancel} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneAndroid color="primary" />
            Two-Factor Authentication
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            We've sent a verification code to your registered phone number ending in ****{tempUser?.profile.phone.slice(-4)}.
          </Typography>
          <TextField
            fullWidth
            label="Enter 6-digit code"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            inputProps={{ maxLength: 6 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handle2FACancel}>Cancel</Button>
          <Button 
            onClick={handle2FASubmit} 
            variant="contained"
            disabled={twoFactorCode.length !== 6}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login; 