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
  Tabs,
  Tab,
  Chip,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  SwapHoriz,
  Info,
  Lock,
  History,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Account, Transaction } from '../types';
import accountService from '../services/accountService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Transfer: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [tabValue, setTabValue] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [recentTransfers, setRecentTransfers] = useState<Transaction[]>([]);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    if (user) {
      const userAccounts = accountService.getUserAccounts(user.userId);
      setAccounts(userAccounts);

      // Get recent transfers
      const allTransactions = accountService.getUserTransactions(user.userId);
      const transfers = allTransactions.filter(
        (t) => t.category === 'Transfer'
      );
      setRecentTransfers(transfers.slice(0, 5));
    }
  }, [user]);

  const handleTransfer = () => {
    setError('');
    
    if (!fromAccount || !toAccount || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    if (fromAccount === toAccount) {
      setError('Cannot transfer to the same account');
      return;
    }

    const fromAcc = accounts.find(acc => acc.accountId === fromAccount);
    const transferAmount = parseFloat(amount);

    if (!fromAcc) {
      setError('Source account not found');
      return;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const availableBalance = fromAcc.availableBalance ?? fromAcc.balance;
    if (transferAmount > availableBalance) {
      setError('Insufficient funds');
      return;
    }

    setConfirmDialog(true);
  };

  const confirmTransfer = () => {
    const transferAmount = parseFloat(amount);
    const success = accountService.transferFunds(
      fromAccount,
      toAccount,
      transferAmount,
      memo || 'Transfer'
    );

    if (success) {
      setConfirmDialog(false);
      showNotification('Transfer completed successfully!', 'success');
      setFromAccount('');
      setToAccount('');
      setAmount('');
      setMemo('');
      
      // Refresh accounts and transactions
      if (user) {
        const updatedAccounts = accountService.getUserAccounts(user.userId);
        setAccounts(updatedAccounts);
        
        const allTransactions = accountService.getUserTransactions(user.userId);
        const transfers = allTransactions.filter(t => t.category === 'Transfer');
        setRecentTransfers(transfers.slice(0, 5));
      }
    } else {
      showNotification('Transfer failed. Please try again.', 'error');
      setConfirmDialog(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transfer Funds
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Move money between your accounts instantly
      </Typography>



      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Between My Accounts" />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  External Transfer
                  <Chip label="Coming Soon" size="small" color="warning" />
                </Box>
              } 
              disabled 
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>From Account</InputLabel>
                  <Select
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    label="From Account"
                  >
                    {accounts.filter(acc => acc.accountType !== 'loan').map((account) => (
                      <MenuItem key={account.accountId} value={account.accountId}>
                        <Box display="flex" justifyContent="space-between" width="100%">
                          <span>{account.accountName} ({account.accountNumber})</span>
                          <strong>{formatCurrency(account.availableBalance || account.balance)}</strong>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>To Account</InputLabel>
                  <Select
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    label="To Account"
                    disabled={!fromAccount}
                  >
                    {accounts
                      .filter(acc => acc.accountId !== fromAccount && acc.accountType !== 'credit')
                      .map((account) => (
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
                  label="Memo (Optional)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add a note for your records"
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    <Info fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Transfers between your accounts are instant and free
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleTransfer}
                    startIcon={<SwapHoriz />}
                    disabled={!fromAccount || !toAccount || !amount}
                  >
                    Transfer Funds
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box textAlign="center" py={5}>
              <Lock sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                External Transfers Coming Soon
              </Typography>
              <Typography color="text.secondary">
                We're working on enabling transfers to external bank accounts. 
                This feature will be available in the next update.
              </Typography>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <History sx={{ mr: 1 }} />
            <Typography variant="h6">Recent Transfers</Typography>
          </Box>
          <List>
            {recentTransfers.length > 0 ? (
              recentTransfers.map((transfer) => (
                <ListItem key={transfer.transactionId} divider>
                  <ListItemText
                    primary={transfer.description}
                    secondary={new Date(transfer.date).toLocaleDateString()}
                  />
                  <ListItemSecondaryAction>
                    <Typography
                      variant="body1"
                      color={transfer.type === 'credit' ? 'success.main' : 'inherit'}
                    >
                      {transfer.type === 'credit' ? '+' : '-'}
                      {formatCurrency(Math.abs(transfer.amount))}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <Typography color="text.secondary" textAlign="center" py={3}>
                No recent transfers
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>

      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Transfer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to transfer <strong>{formatCurrency(parseFloat(amount || '0'))}</strong> from{' '}
            <strong>{accounts.find(a => a.accountId === fromAccount)?.accountName}</strong> to{' '}
            <strong>{accounts.find(a => a.accountId === toAccount)?.accountName}</strong>?
          </Typography>
          {memo && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Memo: {memo}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmTransfer} variant="contained">
            Confirm Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transfer; 