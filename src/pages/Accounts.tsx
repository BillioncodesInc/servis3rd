import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  LinearProgress,
  Tooltip,
  Fade,
  Grow,
} from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  Savings,
  AccountBalanceWallet,
  MoreVert,
  TrendingUp,
  Close,
  Info,
  History,
  Download,
  Print,
  ContentCopy,
  CheckCircle,
  TrendingDown,
  CalendarToday,
  AttachMoney,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Account, Transaction } from '../types';
import accountService from '../services/accountService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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

const Accounts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountTransactions, setAccountTransactions] = useState<Transaction[]>([]);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

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
        return <AccountBalance fontSize="large" />;
      case 'savings':
        return <Savings fontSize="large" />;
      case 'credit':
        return <CreditCard fontSize="large" />;
      case 'loan':
        return <AccountBalanceWallet fontSize="large" />;
      default:
        return <AccountBalance fontSize="large" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'primary';
      case 'savings':
        return 'success';
      case 'credit':
        return 'warning';
      case 'loan':
        return 'error';
      default:
        return 'primary';
    }
  };

  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account);
    const transactions = accountService.getAccountTransactions(account.accountId);
    setAccountTransactions(transactions.slice(0, 10)); // Get last 10 transactions
    setDetailsDialog(true);
    setTabValue(0);
  };

  const handleViewTransactions = (account: Account) => {
    // Navigate to transactions page with account filter
    navigate('/transactions', { state: { accountId: account.accountId } });
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => {
      if (account.accountType === 'credit' || account.accountType === 'loan') {
        return total - account.balance;
      }
      return total + account.balance;
    }, 0);
  };

  const calculateMonthlyChange = () => {
    // Simulated monthly change
    return Math.random() * 1000 - 500;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Accounts
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage and view all your accounts in one place
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Grow in timeout={300}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Net Worth
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {formatCurrency(calculateTotalBalance())}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="body2">
                        +{formatCurrency(Math.abs(calculateMonthlyChange()))} this month
                      </Typography>
                    </Box>
                  </Box>
                  <AttachMoney sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grow in timeout={500}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Accounts
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {accounts.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {accounts.filter(a => a.status === 'active').length} active
                    </Typography>
                  </Box>
                  <AccountBalance sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grow in timeout={700}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Recent Activity
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      24
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transactions this week
                    </Typography>
                  </Box>
                  <History sx={{ fontSize: 48, color: 'secondary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Account Cards */}
      <Grid container spacing={3}>
        {accounts.map((account, index) => (
          <Grid item xs={12} md={6} key={account.accountId}>
            <Fade in timeout={300 + index * 100}>
              <Card 
                sx={{ 
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: `${getAccountColor(account.accountType)}.light`,
                          color: `${getAccountColor(account.accountType)}.main`,
                          mr: 2,
                        }}
                      >
                        {getAccountIcon(account.accountType)}
                      </Box>
                      <Box>
                        <Typography variant="h6">{account.accountName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ****{account.accountNumber.slice(-4)}
                        </Typography>
                        <Chip
                          label={account.accountType.toUpperCase()}
                          size="small"
                          color={getAccountColor(account.accountType) as any}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Current Balance
                      </Typography>
                      <Typography variant="h5" color={account.balance >= 0 ? 'inherit' : 'error'}>
                        {formatCurrency(account.balance)}
                      </Typography>
                    </Grid>
                    {account.availableBalance !== undefined && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Available Balance
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(account.availableBalance)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {account.creditLimit && (
                    <Box mt={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Credit Utilization
                        </Typography>
                        <Typography variant="body2">
                          {Math.round((account.balance / account.creditLimit) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(account.balance / account.creditLimit) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )}

                  {account.interestRate && (
                    <Box mt={2} display="flex" alignItems="center">
                      <TrendingUp fontSize="small" color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {account.interestRate}% APY
                      </Typography>
                    </Box>
                  )}

                  <Box mt={3} display="flex" gap={1}>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      fullWidth
                      onClick={() => handleViewDetails(account)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      fullWidth
                      onClick={() => handleViewTransactions(account)}
                    >
                      Transactions
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: 200,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Open a New Account
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Expand your financial portfolio with our range of account options
              </Typography>
              <Button variant="contained" color="primary">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Account Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedAccount?.accountName} Details
            </Typography>
            <IconButton onClick={() => setDetailsDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAccount && (
            <>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Account Information" />
                <Tab label="Recent Transactions" />
                <Tab label="Statements" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Account Details
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Info />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Account Number"
                            secondary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <span>{selectedAccount.accountNumber}</span>
                                <Tooltip title={copied === 'account' ? 'Copied!' : 'Copy'}>
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleCopyToClipboard(selectedAccount.accountNumber, 'account')}
                                  >
                                    {copied === 'account' ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
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
                                <span>{selectedAccount.routingNumber || '021000021'}</span>
                                <Tooltip title={copied === 'routing' ? 'Copied!' : 'Copy'}>
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleCopyToClipboard(selectedAccount.routingNumber || '021000021', 'routing')}
                                  >
                                    {copied === 'routing' ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarToday />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Account Opened"
                            secondary={format(new Date(selectedAccount.openDate), 'MMMM dd, yyyy')}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Status"
                            secondary={
                              <Chip 
                                label={selectedAccount.status.toUpperCase()} 
                                size="small" 
                                color="success"
                              />
                            }
                          />
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Balance Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <AttachMoney />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Current Balance"
                            secondary={formatCurrency(selectedAccount.balance)}
                          />
                        </ListItem>
                        {selectedAccount.availableBalance !== undefined && (
                          <ListItem>
                            <ListItemIcon>
                              <AttachMoney />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Available Balance"
                              secondary={formatCurrency(selectedAccount.availableBalance)}
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
                        {selectedAccount.interestRate !== undefined && (
                          <ListItem>
                            <ListItemIcon>
                              <TrendingUp />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Interest Rate"
                              secondary={`${selectedAccount.interestRate}% ${selectedAccount.accountType === 'savings' ? 'APY' : 'APR'}`}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" icon={<Info />}>
                      For security reasons, some account features can only be modified by visiting a branch or calling customer service.
                    </Alert>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accountTransactions.map((transaction) => (
                        <TableRow key={transaction.transactionId}>
                          <TableCell>
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Chip 
                              label={transaction.category} 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                              {transaction.type === 'credit' ? (
                                <TrendingUp fontSize="small" color="success" />
                              ) : (
                                <TrendingDown fontSize="small" color="error" />
                              )}
                              <Typography
                                variant="body2"
                                color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                              >
                                {transaction.type === 'credit' ? '+' : '-'}
                                {formatCurrency(Math.abs(transaction.amount))}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(transaction.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {accountTransactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            <Typography color="text.secondary">
                              No recent transactions
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box mt={2} display="flex" justifyContent="center">
                  <Button 
                    variant="text" 
                    onClick={() => handleViewTransactions(selectedAccount)}
                  >
                    View All Transactions
                  </Button>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <List>
                  {['December 2023', 'November 2023', 'October 2023', 'September 2023'].map((month) => (
                    <ListItem key={month}>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${month} Statement`}
                        secondary="PDF • 2.3 MB"
                      />
                      <Box>
                        <IconButton>
                          <Download />
                        </IconButton>
                        <IconButton>
                          <Print />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Statements are available for the past 24 months. For older statements, please contact customer service.
                </Alert>
              </TabPanel>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounts; 