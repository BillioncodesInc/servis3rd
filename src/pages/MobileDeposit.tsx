import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
} from '@mui/material';
import {
  CameraAlt,
  CloudUpload,
  CheckCircle,
  History,
  Lock,
  PhotoCamera,
  Delete,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Account } from '../types';
import accountService from '../services/accountService';

const MobileDeposit: React.FC = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const steps = ['Select Account', 'Capture Check', 'Verify & Submit'];

  useEffect(() => {
    if (user) {
      const userAccounts = accountService.getUserAccounts(user.userId)
        .filter(acc => acc.accountType === 'checking' || acc.accountType === 'savings');
      setAccounts(userAccounts);
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleImageUpload = (side: 'front' | 'back') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setFrontImage(reader.result as string);
        } else {
          setBackImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const recentDeposits = [
    { date: '2024-01-08', amount: 500.00, status: 'completed' },
    { date: '2024-01-02', amount: 1200.00, status: 'completed' },
    { date: '2023-12-28', amount: 350.00, status: 'completed' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mobile Deposit
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Deposit checks anytime, anywhere using your device
      </Typography>

      {showInfo && (
        <Alert 
          severity="warning" 
          onClose={() => setShowInfo(false)}
          sx={{ mb: 3 }}
          icon={<Lock />}
        >
          <Typography variant="subtitle2" gutterBottom>
            Mobile Deposit is currently disabled
          </Typography>
          <Typography variant="body2">
            This feature is temporarily unavailable. You can explore the interface, but deposits cannot be processed at this time.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step 1: Select Account */}
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Select Deposit Account
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Deposit To Account</InputLabel>
                        <Select
                          value={selectedAccount}
                          onChange={(e) => setSelectedAccount(e.target.value)}
                          label="Deposit To Account"
                          disabled
                        >
                          {accounts.map((account) => (
                            <MenuItem key={account.accountId} value={account.accountId}>
                              <Box display="flex" justifyContent="space-between" width="100%">
                                <span>{account.accountName} ({account.accountNumber})</span>
                                <strong>{formatCurrency(account.balance)}</strong>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Check Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        disabled
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                  </Grid>
                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 2: Capture Check */}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Capture Check Images
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Front of Check
                        </Typography>
                        {frontImage ? (
                          <Box>
                            <img 
                              src={frontImage} 
                              alt="Check front" 
                              style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
                            />
                            <IconButton 
                              onClick={() => setFrontImage(null)}
                              color="error"
                              disabled
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box>
                            <PhotoCamera sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id="front-image"
                              type="file"
                              onChange={handleImageUpload('front')}
                              disabled
                            />
                            <label htmlFor="front-image">
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CameraAlt />}
                                disabled
                              >
                                Capture Front
                              </Button>
                            </label>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Back of Check
                        </Typography>
                        {backImage ? (
                          <Box>
                            <img 
                              src={backImage} 
                              alt="Check back" 
                              style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
                            />
                            <IconButton 
                              onClick={() => setBackImage(null)}
                              color="error"
                              disabled
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box>
                            <PhotoCamera sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id="back-image"
                              type="file"
                              onChange={handleImageUpload('back')}
                              disabled
                            />
                            <label htmlFor="back-image">
                              <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CameraAlt />}
                                disabled
                              >
                                Capture Back
                              </Button>
                            </label>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      <strong>Tips for capturing check images:</strong>
                      <ul style={{ margin: '8px 0' }}>
                        <li>Place check on a dark background</li>
                        <li>Ensure all four corners are visible</li>
                        <li>Avoid shadows and glare</li>
                        <li>Make sure the image is clear and readable</li>
                      </ul>
                    </Typography>
                  </Alert>
                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Button onClick={handleBack} disabled>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Step 3: Verify & Submit */}
              {activeStep === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Review and Submit
                  </Typography>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Deposit To:
                        </Typography>
                        <Typography variant="body1">
                          {accounts.find(a => a.accountId === selectedAccount)?.accountName || 'Select an account'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Amount:
                        </Typography>
                        <Typography variant="h6">
                          {amount ? formatCurrency(parseFloat(amount)) : '$0.00'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                  <Alert severity="warning" icon={<Warning />}>
                    By submitting this deposit, you agree that:
                    <ul style={{ margin: '8px 0' }}>
                      <li>The check has not been previously deposited</li>
                      <li>You will write "VOID" on the check after deposit</li>
                      <li>You will keep the check for 30 days then destroy it</li>
                    </ul>
                  </Alert>
                  <Box mt={3} display="flex" justifyContent="space-between">
                    <Button onClick={handleBack} disabled>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      disabled
                    >
                      Submit Deposit
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <History sx={{ mr: 1 }} />
                <Typography variant="h6">Recent Deposits</Typography>
              </Box>
              <List>
                {recentDeposits.map((deposit, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={formatCurrency(deposit.amount)}
                      secondary={new Date(deposit.date).toLocaleDateString()}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={deposit.status}
                        size="small"
                        color="success"
                        icon={<CheckCircle />}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Deposit Limits
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Per Check"
                    secondary="$5,000"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Daily Limit"
                    secondary="$10,000"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Monthly Limit"
                    secondary="$50,000"
                  />
                </ListItem>
              </List>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Funds are typically available within 1-2 business days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MobileDeposit; 