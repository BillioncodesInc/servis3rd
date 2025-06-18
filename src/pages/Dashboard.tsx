import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  Fade,
  Grow,
} from '@mui/material';
import {
  TrendingUp,
  ArrowForward,
  Refresh,
  AttachMoney,
  SwapHoriz,
  Payment,
  CameraAlt,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Account, Transaction } from '../types';
import accountService from '../services/accountService';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    if (user) {
      // Load user accounts
      const userAccounts = accountService.getUserAccounts(user.userId);
      setAccounts(userAccounts);

      // Calculate total balance
      const total = userAccounts.reduce((sum, account) => sum + account.balance, 0);
      setTotalBalance(total);

      // Load recent transactions
      const allTransactions = accountService.getUserTransactions(user.userId);

      // Sort by date and get recent 5
      const sorted = allTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentTransactions(sorted.slice(0, 5));
    }
  }, [user]);

  // Generate chart data
  const generateChartData = () => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: format(date, 'MMM dd'),
        balance: totalBalance + Math.random() * 1000 - 500,
      });
    }
    return data;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const quickActions = [
    { icon: <SwapHoriz />, label: 'Transfer', href: '/transfer', color: '#2196F3' },
    { icon: <Payment />, label: 'Pay Bills', href: '/billpay', color: '#4CAF50' },
    { icon: <CameraAlt />, label: 'Deposit', href: '/mobile-deposit', color: '#FF9800' },
    { icon: <Description />, label: 'Statements', href: '/statements', color: '#9C27B0' },
  ];

  return (
    <Fade in timeout={500}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.profile.firstName}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's your financial overview for today
            </Typography>
          </Box>
          <IconButton 
            color="primary" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <Refresh className={refreshing ? 'rotating' : ''} />
          </IconButton>
        </Box>

        {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Total Balance Card */}
        <Grid item xs={12} md={4}>
          <Grow in timeout={300}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
              color: 'white',
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                      Total Balance
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                      {formatCurrency(totalBalance)}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="body2">
                        +2.5% from last month
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 64, 
                    height: 64,
                    backdropFilter: 'blur(10px)'
                  }}>
                    <AttachMoney sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
              <Box sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }} />
            </Card>
          </Grow>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grow in timeout={500 + index * 100} key={action.label}>
                    <Grid item xs={6} sm={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        href={action.href}
                        sx={{ 
                          py: 3,
                          flexDirection: 'column',
                          background: 'white',
                          color: action.color,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                            background: action.color,
                            color: 'white',
                            '& .MuiSvgIcon-root': {
                              color: 'white',
                            }
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Avatar sx={{ 
                          bgcolor: `${action.color}20`, 
                          mb: 1,
                          width: 48,
                          height: 48
                        }}>
                          {React.cloneElement(action.icon, { 
                            sx: { color: action.color, fontSize: 28 } 
                          })}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {action.label}
                        </Typography>
                      </Button>
                    </Grid>
                  </Grow>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Summary
              </Typography>
              <List>
                {accounts.map((account) => (
                  <ListItem key={account.accountId} divider>
                    <ListItemText
                      primary={account.accountName}
                      secondary={account.accountNumber}
                    />
                    <ListItemSecondaryAction>
                      <Typography variant="h6" color={account.balance >= 0 ? 'inherit' : 'error'}>
                        {formatCurrency(account.balance)}
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Box mt={2}>
                <Button fullWidth variant="text" endIcon={<ArrowForward />} href="/accounts">
                  View All Accounts
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <List>
                {recentTransactions.map((transaction) => (
                  <ListItem key={transaction.transactionId} divider>
                    <ListItemText
                      primary={transaction.description}
                      secondary={format(new Date(transaction.date), 'MMM dd, yyyy')}
                    />
                    <ListItemSecondaryAction>
                      <Box textAlign="right">
                        <Typography
                          variant="body1"
                          color={transaction.type === 'credit' ? 'success.main' : 'inherit'}
                        >
                          {transaction.type === 'credit' ? '+' : '-'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </Typography>
                        <Chip
                          label={transaction.category}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Box mt={2}>
                <Button fullWidth variant="text" endIcon={<ArrowForward />} href="/transactions">
                  View All Transactions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Balance Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Balance Trend
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#003366"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
              </Grid>
      </Box>
    </Fade>
  );
};

export default Dashboard; 