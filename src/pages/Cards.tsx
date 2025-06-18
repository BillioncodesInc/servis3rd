import React, { useState, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  CreditCard,
  Lock,
  LockOpen,
  Settings,
  Warning,
  Contactless,
  Public,
  LocalAtm,
  ShoppingCart,
  Block,
  MoreVert,
  ContentCopy,
  Visibility,
  VisibilityOff,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import stateService from '../services/stateService';
import { Card as CardType, CardTransaction } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`card-tabpanel-${index}`}
      aria-labelledby={`card-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Cards() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showCardDetails, setShowCardDetails] = useState<{ [key: string]: boolean }>({});
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [limitDialog, setLimitDialog] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reportDialog, setReportDialog] = useState(false);

  const cards = stateService.getCards();
  const allCardTransactions = stateService.getCardTransactions();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCardSelect = (card: CardType) => {
    setSelectedCard(card);
    setTabValue(0);
  };

  const handleToggleCardStatus = (card: CardType) => {
    stateService.toggleCardStatus(card.id);
    showNotification(
      card.status === 'active' 
        ? `Card ending in ${card.cardNumber.slice(-4)} has been frozen`
        : `Card ending in ${card.cardNumber.slice(-4)} has been activated`,
      card.status === 'active' ? 'warning' : 'success'
    );
    setSelectedCard({ ...card, status: card.status === 'active' ? 'frozen' : 'active' });
  };

  const handleToggleCardDetails = (cardId: string) => {
    setShowCardDetails(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleCopyCardNumber = (cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber.replace(/-/g, ''));
    showNotification('Card number copied to clipboard', 'success');
  };

  const handleUpdateSettings = () => {
    if (!selectedCard) return;

    const formData = new FormData(document.getElementById('card-settings-form') as HTMLFormElement);
    const settings = {
      contactless: formData.get('contactless') === 'on',
      onlineTransactions: formData.get('onlineTransactions') === 'on',
      internationalTransactions: formData.get('internationalTransactions') === 'on',
      atmWithdrawals: formData.get('atmWithdrawals') === 'on',
    };

    stateService.updateCardSettings(selectedCard.id, settings);
    showNotification('Card settings updated successfully', 'success');
    setSettingsDialog(false);
    setSelectedCard({ ...selectedCard, ...settings });
  };

  const handleUpdateLimit = () => {
    if (!selectedCard || !newLimit) return;

    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit <= 0) {
      showNotification('Please enter a valid limit amount', 'error');
      return;
    }

    stateService.updateCardLimit(selectedCard.id, limit);
    showNotification('Card limit updated successfully', 'success');
    setLimitDialog(false);
    setNewLimit('');
    setSelectedCard({ ...selectedCard, limit });
  };

  const handleReportLost = () => {
    if (!selectedCard) return;

    stateService.reportCardLost(selectedCard.id);
    showNotification('Card has been reported as lost and blocked', 'error');
    setReportDialog(false);
    setSelectedCard({ ...selectedCard, status: 'blocked' });
    setAnchorEl(null);
  };

  const getCardIcon = (cardType: 'debit' | 'credit') => {
    return cardType === 'credit' ? '💳' : '💵';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'frozen': return 'warning';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };

  const formatCardNumber = (number: string, show: boolean) => {
    if (!show) {
      return `•••• •••• •••• ${number.slice(-4)}`;
    }
    return number;
  };

  const getCardTransactions = (cardId: string) => {
    return allCardTransactions
      .filter(trans => trans.cardId === cardId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const calculateSpendingTrend = (card: CardType) => {
    const transactions = getCardTransactions(card.id);
    const thisMonth = transactions
      .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const lastMonth = transactions
      .filter(t => {
        const date = new Date(t.date);
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        return date.getMonth() === lastMonthDate.getMonth();
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return thisMonth > lastMonth ? 'up' : 'down';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Card Management
      </Typography>

      <Grid container spacing={3}>
        {/* Cards List */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Your Cards
          </Typography>
          {cards.map((card) => (
            <Card
              key={card.id}
              sx={{
                mb: 2,
                cursor: 'pointer',
                border: selectedCard?.id === card.id ? 2 : 0,
                borderColor: 'primary.main',
                position: 'relative',
                overflow: 'visible',
              }}
              onClick={() => handleCardSelect(card)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{getCardIcon(card.cardType)}</span>
                      {card.cardType === 'credit' ? 'Credit Card' : 'Debit Card'}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {formatCardNumber(card.cardNumber, false)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires: {card.expiryDate}
                    </Typography>
                  </Box>
                  <Chip
                    label={card.status}
                    color={getStatusColor(card.status)}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      ${card.spent.toFixed(2)} / ${card.limit.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {((card.spent / card.limit) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(card.spent / card.limit) * 100}
                    sx={{ mt: 1 }}
                    color={card.spent / card.limit > 0.8 ? 'error' : 'primary'}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Card Details */}
        <Grid item xs={12} md={8}>
          {selectedCard ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Card Details
                </Typography>
                <Box>
                  <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                  >
                    <MenuItem onClick={() => { setSettingsDialog(true); setAnchorEl(null); }}>
                      <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                      Card Settings
                    </MenuItem>
                    <MenuItem onClick={() => { setLimitDialog(true); setAnchorEl(null); }}>
                      <ListItemIcon><CreditCard fontSize="small" /></ListItemIcon>
                      Change Limit
                    </MenuItem>
                    <MenuItem onClick={() => { setReportDialog(true); setAnchorEl(null); }}>
                      <ListItemIcon><Warning fontSize="small" /></ListItemIcon>
                      Report Lost/Stolen
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Card Number
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleCardDetails(selectedCard.id)}
                          >
                            {showCardDetails[selectedCard.id] ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCardNumber(selectedCard.cardNumber)}
                          >
                            <ContentCopy />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="h6">
                        {formatCardNumber(selectedCard.cardNumber, showCardDetails[selectedCard.id] || false)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Cardholder Name
                      </Typography>
                      <Typography>{selectedCard.cardName}</Typography>
                    </Grid>

                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">
                        Expires
                      </Typography>
                      <Typography>{selectedCard.expiryDate}</Typography>
                    </Grid>

                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">
                        CVV
                      </Typography>
                      <Typography>
                        {showCardDetails[selectedCard.id] ? selectedCard.cvv : '•••'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Card Status
                          </Typography>
                          <Chip
                            label={selectedCard.status}
                            color={getStatusColor(selectedCard.status)}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                        {selectedCard.status !== 'blocked' && (
                          <Button
                            variant="outlined"
                            startIcon={selectedCard.status === 'active' ? <Lock /> : <LockOpen />}
                            onClick={() => handleToggleCardStatus(selectedCard)}
                            color={selectedCard.status === 'active' ? 'warning' : 'success'}
                          >
                            {selectedCard.status === 'active' ? 'Freeze Card' : 'Unfreeze Card'}
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Transactions" />
                  <Tab label="Settings" />
                  <Tab label="Insights" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <List>
                  {getCardTransactions(selectedCard.id).slice(0, 10).map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem>
                        <ListItemIcon>
                          {transaction.type === 'purchase' && <ShoppingCart />}
                          {transaction.type === 'withdrawal' && <LocalAtm />}
                          {transaction.type === 'refund' && <TrendingUp color="success" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={transaction.description}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                {transaction.merchant && ` • ${transaction.merchant}`}
                                {transaction.location && ` • ${transaction.location}`}
                              </Typography>
                            </Box>
                          }
                        />
                        <Typography
                          variant="h6"
                          color={transaction.amount > 0 ? 'success.main' : 'text.primary'}
                        >
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </Typography>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
                {getCardTransactions(selectedCard.id).length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No transactions found for this card
                    </Typography>
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Card Features
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon><Contactless /></ListItemIcon>
                          <ListItemText primary="Contactless Payments" />
                          <Switch
                            checked={selectedCard.contactless}
                            disabled={selectedCard.status !== 'active'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ShoppingCart /></ListItemIcon>
                          <ListItemText primary="Online Transactions" />
                          <Switch
                            checked={selectedCard.onlineTransactions}
                            disabled={selectedCard.status !== 'active'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Public /></ListItemIcon>
                          <ListItemText primary="International Transactions" />
                          <Switch
                            checked={selectedCard.internationalTransactions}
                            disabled={selectedCard.status !== 'active'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocalAtm /></ListItemIcon>
                          <ListItemText primary="ATM Withdrawals" />
                          <Switch
                            checked={selectedCard.atmWithdrawals}
                            disabled={selectedCard.status !== 'active'}
                          />
                        </ListItem>
                      </List>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => setSettingsDialog(true)}
                          disabled={selectedCard.status !== 'active'}
                        >
                          Update Settings
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Spending Limit
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h4">
                          ${selectedCard.limit.toFixed(2)}
                        </Typography>
                        <Typography color="text.secondary">
                          Current limit
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography>
                          ${selectedCard.spent.toFixed(2)} spent
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(selectedCard.spent / selectedCard.limit) * 100}
                          sx={{ mt: 1 }}
                          color={selectedCard.spent / selectedCard.limit > 0.8 ? 'error' : 'primary'}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => setLimitDialog(true)}
                      >
                        Change Limit
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Spending Overview
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="h4">
                          ${selectedCard.spent.toFixed(2)}
                        </Typography>
                        {calculateSpendingTrend(selectedCard) === 'up' ? (
                          <TrendingUp color="error" />
                        ) : (
                          <TrendingDown color="success" />
                        )}
                      </Box>
                      <Typography color="text.secondary">
                        {calculateSpendingTrend(selectedCard) === 'up' 
                          ? 'Spending increased from last month'
                          : 'Spending decreased from last month'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Top Categories
                      </Typography>
                      <List dense>
                        {['Shopping', 'Dining', 'Gas', 'Groceries'].map((category, index) => (
                          <ListItem key={category}>
                            <ListItemText 
                              primary={category}
                              secondary={`$${(Math.random() * 500).toFixed(2)}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CreditCard sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Select a card to view details
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Card Settings</DialogTitle>
        <DialogContent>
          <form id="card-settings-form">
            <FormControlLabel
              control={
                <Switch
                  name="contactless"
                  defaultChecked={selectedCard?.contactless}
                />
              }
              label="Enable Contactless Payments"
            />
            <FormControlLabel
              control={
                <Switch
                  name="onlineTransactions"
                  defaultChecked={selectedCard?.onlineTransactions}
                />
              }
              label="Enable Online Transactions"
            />
            <FormControlLabel
              control={
                <Switch
                  name="internationalTransactions"
                  defaultChecked={selectedCard?.internationalTransactions}
                />
              }
              label="Enable International Transactions"
            />
            <FormControlLabel
              control={
                <Switch
                  name="atmWithdrawals"
                  defaultChecked={selectedCard?.atmWithdrawals}
                />
              }
              label="Enable ATM Withdrawals"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateSettings} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Limit Dialog */}
      <Dialog open={limitDialog} onClose={() => setLimitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Spending Limit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Limit"
            type="number"
            fullWidth
            variant="outlined"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            InputProps={{
              startAdornment: '$',
            }}
            helperText={`Current limit: $${selectedCard?.limit.toFixed(2)}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setLimitDialog(false); setNewLimit(''); }}>
            Cancel
          </Button>
          <Button onClick={handleUpdateLimit} variant="contained">
            Update Limit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Lost Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Card as Lost or Stolen</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will immediately block your card. A new card will be sent to your registered address.
          </Alert>
          <Typography>
            Card ending in {selectedCard?.cardNumber.slice(-4)} will be permanently blocked.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button onClick={handleReportLost} variant="contained" color="error">
            Report and Block Card
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 