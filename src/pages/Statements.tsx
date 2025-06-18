import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Fade,
  Grow,
  useTheme,
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  Description,
  CalendarToday,
  AccountBalance,
  Info,
  Lock,
  Visibility,
} from '@mui/icons-material';
import { format, subMonths, startOfMonth, endOfMonth, isAfter } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { Account } from '../types';
import accountService from '../services/accountService';

interface Statement {
  id: string;
  accountId: string;
  month: Date;
  startDate: Date;
  endDate: Date;
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  isAvailable: boolean;
}

const Statements: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [statements, setStatements] = useState<Statement[]>([]);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    if (user) {
      const userAccounts = accountService.getUserAccounts(user.userId);
      setAccounts(userAccounts);
      generateStatements(userAccounts);
    }
  }, [user]);

  useEffect(() => {
    if (accounts.length > 0) {
      generateStatements(accounts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, accounts]);

  const generateStatements = (userAccounts: Account[]) => {
    const statementsData: Statement[] = [];
    const today = new Date();
    const accountsToProcess = selectedAccount === 'all' 
      ? userAccounts 
      : userAccounts.filter(acc => acc.accountId === selectedAccount);

    // Generate statements for the last 24 months
    for (let i = 0; i < 24; i++) {
      const statementMonth = subMonths(today, i);
      const monthStart = startOfMonth(statementMonth);
      const monthEnd = endOfMonth(statementMonth);

      accountsToProcess.forEach(account => {
        // Only generate statements for months after account creation
        // For demo purposes, we'll assume all accounts were created 2 years ago
        const statement: Statement = {
          id: `${account.accountId}-${format(statementMonth, 'yyyy-MM')}`,
          accountId: account.accountId,
          month: statementMonth,
          startDate: monthStart,
          endDate: monthEnd,
          openingBalance: Math.random() * 10000 + 1000,
          closingBalance: Math.random() * 10000 + 1000,
          totalDeposits: Math.random() * 5000 + 500,
          totalWithdrawals: Math.random() * 4000 + 200,
          transactionCount: Math.floor(Math.random() * 50) + 10,
          isAvailable: !isAfter(statementMonth, subMonths(today, 1)), // Statements available for completed months only
        };
        statementsData.push(statement);
      });
    }

    setStatements(statementsData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.accountId === accountId);
    return account ? `${account.accountName} (${account.accountNumber})` : accountId;
  };

  const handleDownload = (statement: Statement) => {
    // This would normally trigger a download
    console.log('Download statement:', statement.id);
  };

  const handleView = (statement: Statement) => {
    // This would normally open a statement viewer
    console.log('View statement:', statement.id);
  };

  // Group statements by month
  const groupedStatements = statements.reduce((acc, statement) => {
    const monthKey = format(statement.month, 'MMMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(statement);
    return acc;
  }, {} as Record<string, Statement[]>);

  return (
    <Fade in timeout={500}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Account Statements
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and download your monthly account statements
            </Typography>
          </Box>
          <Chip
            icon={<PictureAsPdf />}
            label="PDF Format"
            color="primary"
            variant="outlined"
          />
        </Box>

        {showInfo && (
          <Grow in timeout={300}>
            <Alert 
              severity="info" 
              onClose={() => setShowInfo(false)}
              sx={{ mb: 3 }}
              icon={<Info />}
            >
              Statements are available for download after the end of each month. 
              Current month statements will be available after {format(endOfMonth(new Date()), 'MMMM dd, yyyy')}.
            </Alert>
          </Grow>
        )}

        {/* Account Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Account</InputLabel>
                  <Select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    label="Select Account"
                    startAdornment={<AccountBalance sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    <MenuItem value="all">All Accounts</MenuItem>
                    {accounts.map((account) => (
                      <MenuItem key={account.accountId} value={account.accountId}>
                        {account.accountName} ({account.accountNumber})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Showing statements for the last 24 months
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Statements List */}
        {Object.entries(groupedStatements).map(([monthKey, monthStatements], index) => (
          <Grow in timeout={300 + index * 50} key={monthKey}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{monthKey}</Typography>
                  {!monthStatements[0].isAvailable && (
                    <Chip
                      label="In Progress"
                      size="small"
                      color="warning"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Account</TableCell>
                        <TableCell align="right">Opening Balance</TableCell>
                        <TableCell align="right">Deposits</TableCell>
                        <TableCell align="right">Withdrawals</TableCell>
                        <TableCell align="right">Closing Balance</TableCell>
                        <TableCell align="center">Transactions</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthStatements.map((statement) => (
                        <TableRow key={statement.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {getAccountName(statement.accountId)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(statement.startDate, 'MMM dd')} - {format(statement.endDate, 'MMM dd, yyyy')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(statement.openingBalance)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="success.main">
                              +{formatCurrency(statement.totalDeposits)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="error.main">
                              -{formatCurrency(statement.totalWithdrawals)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={500}>
                              {formatCurrency(statement.closingBalance)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={statement.transactionCount}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" gap={1} justifyContent="center">
                              <Tooltip title={statement.isAvailable ? "View Statement" : "Statement not yet available"}>
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleView(statement)}
                                    disabled={!statement.isAvailable}
                                    color="primary"
                                  >
                                    <Visibility />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={statement.isAvailable ? "Download Statement" : "Statement not yet available"}>
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownload(statement)}
                                    disabled={true}
                                    color="primary"
                                  >
                                    <Download />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grow>
        ))}

        {/* Empty State */}
        {statements.length === 0 && (
          <Card>
            <CardContent>
              <Box textAlign="center" py={5}>
                <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Statements Available
                </Typography>
                <Typography color="text.secondary">
                  Statements will appear here once they are generated at the end of each month.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card sx={{ 
          mt: 3, 
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
            : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Lock sx={{ mr: 2, color: theme.palette.mode === 'dark' ? 'white' : 'primary.main' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight={500}>
                  Secure Document Access
                </Typography>
                <Typography variant="body2" color={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'text.secondary'}>
                  Your statements are protected with bank-grade encryption. 
                  All documents require authentication before access.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default Statements; 