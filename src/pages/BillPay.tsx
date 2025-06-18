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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import {
  Payment,
  Add,
  Star,
  StarBorder,
  Lock,
  Business,
  Home,
  Phone,
  LocalHospital,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Account, Payee } from '../types';
import accountsData from '../data/accounts.json';
import payeesData from '../data/payees.json';

const BillPay: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [selectedPayee, setSelectedPayee] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [accessCodeDialog, setAccessCodeDialog] = useState(false);

  useEffect(() => {
    if (user) {
      const userAccounts = accountsData.accounts.filter(
        (account) => account.userId === user.userId && account.accountType !== 'credit' && account.accountType !== 'loan'
      ) as Account[];
      setAccounts(userAccounts);

      const userPayees = payeesData.payees.filter(
        (payee) => payee.userId === user.userId
      ) as Payee[];
      setPayees(userPayees);
    }
  }, [user]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'utilities':
        return <Home />;
      case 'phone':
        return <Phone />;
      case 'insurance':
        return <LocalHospital />;
      case 'rent':
      case 'mortgage':
        return <Business />;
      default:
        return <Payment />;
    }
  };

  const handlePayment = () => {
    setError('');
    
    if (!selectedPayee || !fromAccount || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    const account = accounts.find(acc => acc.accountId === fromAccount);
    const paymentAmount = parseFloat(amount);

    if (!account) {
      setError('Account not found');
      return;
    }

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const availableBalance = account.availableBalance ?? account.balance;
    if (paymentAmount > availableBalance) {
      setError('Insufficient funds');
      return;
    }

    setAccessCodeDialog(true);
  };

  const handleAccessCodeSubmit = () => {
    if (accessCode === '7991') {
      setAccessCodeDialog(false);
      setConfirmDialog(true);
    } else {
      setError('Invalid access code');
      setAccessCode('');
    }
  };

  const confirmPayment = () => {
    setConfirmDialog(false);
    setShowSuccess(true);
    setSelectedPayee('');
    setFromAccount('');
    setAmount('');
    setMemo('');
    setAccessCode('');
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const selectedPayeeData = payees.find(p => p.payeeId === selectedPayee);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bill Pay
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Pay your bills quickly and securely
      </Typography>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Payment scheduled successfully! Your payment will be processed on the selected date.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Make a Payment
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Payee</InputLabel>
                    <Select
                      value={selectedPayee}
                      onChange={(e) => setSelectedPayee(e.target.value)}
                      label="Select Payee"
                    >
                      {payees.map((payee) => (
                        <MenuItem key={payee.payeeId} value={payee.payeeId}>
                          <Box display="flex" alignItems="center" width="100%">
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                              {getCategoryIcon(payee.category)}
                            </Avatar>
                            <Box flexGrow={1}>
                              <Typography>{payee.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Account: {payee.accountNumber}
                              </Typography>
                            </Box>
                            {payee.isFavorite && <Star color="warning" />}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>From Account</InputLabel>
                    <Select
                      value={fromAccount}
                      onChange={(e) => setFromAccount(e.target.value)}
                      label="From Account"
                    >
                      {accounts.map((account) => (
                        <MenuItem key={account.accountId} value={account.accountId}>
                          <Box display="flex" justifyContent="space-between" width="100%">
                            <span>{account.accountName}</span>
                            <strong>{formatCurrency(account.availableBalance || account.balance)}</strong>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payment Date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Memo (Optional)"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      disabled
                    >
                      Add New Payee (Disabled)
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handlePayment}
                      startIcon={<Payment />}
                      disabled={!selectedPayee || !fromAccount || !amount}
                    >
                      Schedule Payment
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Payees
              </Typography>
              <List>
                {payees.map((payee) => (
                  <ListItem key={payee.payeeId} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {getCategoryIcon(payee.category)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={payee.name}
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {payee.category}
                          </Typography>
                          {payee.lastPaymentDate && (
                            <Typography variant="caption" color="text.secondary">
                              Last payment: {formatCurrency(payee.lastPaymentAmount || 0)}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end">
                        {payee.isFavorite ? <Star color="warning" /> : <StarBorder />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Access Code Dialog */}
      <Dialog open={accessCodeDialog} onClose={() => setAccessCodeDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Lock sx={{ mr: 1 }} />
            Security Verification
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please enter your access code to proceed with the payment.
          </Typography>
          <TextField
            fullWidth
            label="Access Code"
            type="password"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccessCodeDialog(false)}>Cancel</Button>
          <Button onClick={handleAccessCodeSubmit} variant="contained">
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Please confirm your payment details:
          </Typography>
          <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Payee:</strong> {selectedPayeeData?.name}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Amount:</strong> {formatCurrency(parseFloat(amount || '0'))}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>From:</strong> {accounts.find(a => a.accountId === fromAccount)?.accountName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Date:</strong> {new Date(paymentDate).toLocaleDateString()}
            </Typography>
            {memo && (
              <Typography variant="body2">
                <strong>Memo:</strong> {memo}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmPayment} variant="contained" color="primary">
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillPay; 