import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
  Fade,
  Grow,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
} from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  Savings,
  MonetizationOn,
  TrendingUp,
  History,
  ContentCopy,
  Info,
  CheckCircle,
  Warning,
  CalendarToday,
  AccountBalanceWallet,
  Speed,
  Security,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Account, Transaction } from '../types';
import accountService from '../services/accountService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Accounts: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const userAccounts = accountService.getUserAccounts(user.userId);
      setAccounts(userAccounts);
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <AccountBalanceWallet />;
      case 'savings':
        return <Savings />;
      case 'credit':
        return <CreditCard />;
      case 'loan':
        return <MonetizationOn />;
      default:
        return <AccountBalance />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking':
        return '#2196F3';
      case 'savings':
        return '#4CAF50';
      case 'credit':
        return '#FF9800';
      case 'loan':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account);
    // Get recent transactions for this account
    const transactions = accountService.getUserTransactions(user!.userId);
    const accountTransactions = transactions
      .filter(t => t.accountId === account.accountId)
      .slice(0, 5);
    setRecentTransactions(accountTransactions);
    setShowDetails(true);
  };

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return '';
    const last4 = accountNumber.slice(-4);
    return `****-****-****-${last4}`;
  };

  const calculateAccountAge = (openDate: string) => {
    const open = new Date(openDate);
    const now = new Date();
    const years = now.getFullYear() - open.getFullYear();
    const months = now.getMonth() - open.getMonth();
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  const totalAssets = accounts
    .filter(acc => acc.accountType === 'checking' || acc.accountType === 'savings')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const totalDebt = accounts
    .filter(acc => acc.accountType === 'credit' || acc.accountType === 'loan')
    .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

  return (
    <Fade in timeout={500}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              My Accounts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and view all your accounts in one place
            </Typography>
          </Box>
          <Tooltip title={showAccountNumbers ? "Hide account numbers" : "Show account numbers"}>
            <IconButton onClick={() => setShowAccountNumbers(!showAccountNumbers)} color="primary">
              {showAccountNumbers ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={4}>
            <Grow in timeout={300}>
              <Card sx={{ 
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Assets
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                        {formatCurrency(totalAssets)}
                      </Typography>
                      <Chip
                        icon={<TrendingUp />}
                        label="+5.2% this month"
                        size="small"
                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </Box>
                    <AccountBalanceWallet sx={{ fontSize: 48, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Grow in timeout={400}>
              <Card sx={{ 
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #c31432 0%, #240b36 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Debt
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                        {formatCurrency(totalDebt)}
                      </Typography>
                      <Chip
                        icon={<Warning />}
                        label="2 payments due"
                        size="small"
                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </Box>
                    <CreditCard sx={{ fontSize: 48, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Grow in timeout={500}>
              <Card sx={{ 
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Net Worth
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600, my: 1 }}>
                        {formatCurrency(totalAssets - totalDebt)}
                      </Typography>
                      <Chip
                        icon={<Speed />}
                        label="Good standing"
                        size="small"
                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    </Box>
                    <TrendingUp sx={{ fontSize: 48, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Accounts List */}
        <Grid container spacing={3}>
          {accounts.map((account, index) => (
            <Grid item xs={12} md={6} key={account.accountId}>
              <Grow in timeout={600 + index * 100}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    }
                  }}
                  onClick={() => handleViewDetails(account)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: `${getAccountColor(account.accountType)}20`,
                            color: getAccountColor(account.accountType),
                          }}
                        >
                          {getAccountIcon(account.accountType)}
                        </Box>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {account.accountName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {showAccountNumbers ? account.accountNumber : maskAccountNumber(account.accountNumber)}
                          </Typography>
                          <Chip
                            label={account.accountType}
                            size="small"
                            sx={{ 
                              mt: 1,
                              backgroundColor: `${getAccountColor(account.accountType)}20`,
                              color: getAccountColor(account.accountType),
                            }}
                          />
                        </Box>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          {formatCurrency(account.balance)}
                        </Typography>
                        {account.availableBalance !== undefined && account.availableBalance !== account.balance && (
                          <Typography variant="body2" color="text.secondary">
                            Available: {formatCurrency(account.availableBalance)}
                          </Typography>
                        )}
                        {account.interestRate > 0 && (
                          <Chip
                            label={`${account.interestRate}% APY`}
                            size="small"
                            color="success"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Button
                        size="small"
                        startIcon={<History />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/transactions', { state: { accountId: account.accountId } });
                        }}
                      >
                        View Transactions
                      </Button>
                      <Box display="flex" gap={1}>
                        {account.status === 'active' && (
                          <Chip
                            icon={<CheckCircle />}
                            label="Active"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Account Details Dialog */}
        <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
          {selectedAccount && (
            <>
              <DialogTitle>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${getAccountColor(selectedAccount.accountType)}20`,
                      color: getAccountColor(selectedAccount.accountType),
                    }}
                  >
                    {getAccountIcon(selectedAccount.accountType)}
                  </Box>
                  <Box>
                    <Typography variant="h6">{selectedAccount.accountName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Account Details
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Alert severity="info" icon={<Security />}>
                      Your account information is protected with bank-grade encryption
                    </Alert>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Info />
                        </ListItemIcon>
                        <ListItemText
                          primary="Account Number"
                          secondary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {selectedAccount.accountNumber}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleCopyToClipboard(selectedAccount.accountNumber, 'account')}
                              >
                                {copied === 'account' ? <CheckCircle color="success" /> : <ContentCopy />}
                              </IconButton>
                            </Box>
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Info />
                        </ListItemIcon>
                        <ListItemText
                          primary="Routing Number"
                          secondary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2">
                                {selectedAccount.routingNumber || '121000248'}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleCopyToClipboard(selectedAccount.routingNumber || '121000248', 'routing')}
                              >
                                {copied === 'routing' ? <CheckCircle color="success" /> : <ContentCopy />}
                              </IconButton>
                            </Box>
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText
                          primary="Account Age"
                          secondary={calculateAccountAge(selectedAccount.openDate)}
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <AccountBalance />
                        </ListItemIcon>
                        <ListItemText
                          primary="Current Balance"
                          secondary={formatCurrency(selectedAccount.balance)}
                        />
                      </ListItem>
                      {selectedAccount.interestRate > 0 && (
                        <ListItem>
                          <ListItemIcon>
                            <TrendingUp />
                          </ListItemIcon>
                          <ListItemText
                            primary="Interest Rate"
                            secondary={`${selectedAccount.interestRate}% APY`}
                          />
                        </ListItem>
                      )}
                      {selectedAccount.creditLimit && (
                        <ListItem>
                          <ListItemIcon>
                            <CreditCard />
                          </ListItemIcon>
                          <ListItemText
                            primary="Credit Limit"
                            secondary={formatCurrency(selectedAccount.creditLimit)}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Recent Transactions
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {recentTransactions.length > 0 ? (
                            recentTransactions.map((transaction) => (
                              <TableRow key={transaction.transactionId}>
                                <TableCell>
                                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell align="right">
                                  <Typography
                                    color={transaction.type === 'credit' ? 'success.main' : 'inherit'}
                                  >
                                    {transaction.type === 'credit' ? '+' : '-'}
                                    {formatCurrency(Math.abs(transaction.amount))}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} align="center">
                                <Typography color="text.secondary" py={2}>
                                  No recent transactions
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowDetails(false)}>Close</Button>
                <Button
                  variant="contained"
                  startIcon={<History />}
                  onClick={() => {
                    navigate('/transactions', { state: { accountId: selectedAccount.accountId } });
                  }}
                >
                  View All Transactions
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Accounts; 