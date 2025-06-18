import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Chip,
  Paper,
  Alert,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  CalendarToday,
  Badge,
  Business,
  Security,
  Description,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [showAlert, setShowAlert] = useState(false);

  const handleEditAttempt = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View and manage your account information
      </Typography>

      {showAlert && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Profile editing is currently disabled. Please contact customer support to update your information.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {user.profile.firstName[0]}{user.profile.lastName[0]}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.profile.firstName} {user.profile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.profile.email}
              </Typography>
              <Chip
                label={user.userType === 'business' ? 'Business Account' : 'Personal Account'}
                color={user.userType === 'business' ? 'secondary' : 'primary'}
                sx={{ mt: 1 }}
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Member Since: {formatDate(user.profile.memberSince || '2020-01-01')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={user.profile.firstName}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={user.profile.lastName}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user.profile.email}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={user.profile.phone}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    value={user.profile.dateOfBirth ? formatDate(user.profile.dateOfBirth) : 'Not provided'}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SSN"
                    value={user.profile.ssn || '***-**-****'}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
                {user.userType === 'business' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company Name"
                        value={user.profile.companyName}
                        InputProps={{
                          readOnly: true,
                          startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        onClick={handleEditAttempt}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="EIN"
                        value={user.profile.ein || '**-*******'}
                        InputProps={{
                          readOnly: true,
                          startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        onClick={handleEditAttempt}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Address Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={user.profile.address.street}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <Home sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={user.profile.address.city}
                    InputProps={{ readOnly: true }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    value={user.profile.address.state}
                    InputProps={{ readOnly: true }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={user.profile.address.zip}
                    InputProps={{ readOnly: true }}
                    onClick={handleEditAttempt}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary={user.settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                  />
                  <Switch
                    checked={user.settings.twoFactorAuth}
                    disabled
                    onClick={handleEditAttempt}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Login"
                    secondary={formatDate(user.lastLogin)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Badge />
                  </ListItemIcon>
                  <ListItemText
                    primary="User ID"
                    secondary={user.userId}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Alerts"
                    secondary="Receive transaction and account alerts"
                  />
                  <Switch
                    checked={user.settings.emailAlerts}
                    disabled
                    onClick={handleEditAttempt}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="SMS Alerts"
                    secondary="Receive text message notifications"
                  />
                  <Switch
                    checked={user.settings.smsAlerts}
                    disabled
                    onClick={handleEditAttempt}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText
                    primary="Paperless Statements"
                    secondary="Receive statements electronically"
                  />
                  <Switch
                    checked={user.settings.paperlessStatements}
                    disabled
                    onClick={handleEditAttempt}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Box display="flex" alignItems="center">
          <Lock sx={{ mr: 2 }} />
          <Box>
            <Typography variant="subtitle1">
              Profile Editing Disabled
            </Typography>
            <Typography variant="body2">
              For security reasons, profile information cannot be edited online. 
              Please visit a branch or call customer service at 1-800-SERVIS3 to update your information.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile; 