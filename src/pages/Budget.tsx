import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fade,
  Grow,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Add,
  Edit,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Warning,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import budgetsData from '../data/budgets.json';
import stateService from '../services/stateService';
import { Budget } from '../types';

const BudgetPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');

  useEffect(() => {
    if (user) {
      // Get budget from state service
      const userBudget = stateService.getBudget();
      if (userBudget) {
        setBudget(userBudget);
      } else {
        // Load from JSON if not in state
        const budgetData = budgetsData.budgets.find(b => b.userId === user.userId);
        if (budgetData) {
          const formattedBudget: Budget = {
            userId: budgetData.userId,
            categories: budgetData.categories.reduce((acc: any, cat: any) => {
              acc[cat.category] = {
                limit: cat.limit,
                spent: cat.spent,
                icon: cat.icon || '',
                color: cat.color
              };
              return acc;
            }, {}),
            monthlyLimit: budgetData.totalLimit,
            alerts: true
          };
          setBudget(formattedBudget);
          
          // Calculate actual spending from transactions
          calculateCategorySpending(formattedBudget);
        }
      }
    }
  }, [user]);

  const calculateCategorySpending = (currentBudget?: Budget) => {
    const budgetToUpdate = currentBudget || budget;
    if (user && budgetToUpdate) {
      const userTransactions = stateService.getTransactions();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTransactions = userTransactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === currentMonth && 
               transDate.getFullYear() === currentYear &&
               t.type === 'debit';
      });

      // Update spending for each category
      const updatedCategories = { ...budgetToUpdate.categories };
      
      // Reset all spent amounts
      Object.keys(updatedCategories).forEach(category => {
        updatedCategories[category].spent = 0;
      });
      
      // Calculate spending per category
      monthlyTransactions.forEach(trans => {
        if (updatedCategories[trans.category]) {
          updatedCategories[trans.category].spent += Math.abs(trans.amount);
        }
      });
      
      const updatedBudget: Budget = {
        ...budgetToUpdate,
        categories: updatedCategories
      };
      
      setBudget(updatedBudget);
      stateService.updateBudget(updatedBudget);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPercentage = (spent: number, limit: number) => {
    return Math.round((spent / limit) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const getTotalSpent = () => {
    if (!budget) return 0;
    return Object.values(budget.categories).reduce((sum, cat) => sum + cat.spent, 0);
  };

  const getInsights = () => {
    if (!budget) return [];
    
    const insights = [];
    const totalSpent = getTotalSpent();
    const overallPercentage = getPercentage(totalSpent, budget.monthlyLimit);
    
    if (overallPercentage < 50) {
      insights.push({
        type: 'success',
        message: `Great job! You've only used ${overallPercentage}% of your monthly budget.`,
        icon: <TrendingDown />,
      });
    } else if (overallPercentage > 80) {
      insights.push({
        type: 'warning',
        message: `Careful! You've used ${overallPercentage}% of your monthly budget.`,
        icon: <Warning />,
      });
    }

    Object.entries(budget.categories).forEach(([catName, cat]) => {
      const percentage = getPercentage(cat.spent, cat.limit);
      if (percentage > 90) {
        insights.push({
          type: 'error',
          message: `You're close to exceeding your ${catName} budget (${percentage}% used).`,
          icon: <TrendingUp />,
        });
      }
    });

    return insights;
  };

  if (!budget) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Budget & Insights
        </Typography>
        <Card>
          <CardContent>
            <Box textAlign="center" py={5}>
              <Typography variant="h6" color="text.secondary">
                No budget set up yet
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} startIcon={<Add />}>
                Create Your First Budget
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const totalSpent = getTotalSpent();
  
  const pieData = Object.entries(budget.categories).map(([name, cat]) => ({
    name,
    value: cat.spent,
    color: cat.color,
  }));

  const barData = Object.entries(budget.categories).map(([name, cat]) => ({
    category: name,
    budget: cat.limit,
    spent: cat.spent,
    remaining: Math.max(0, cat.limit - cat.spent),
  }));

  const insights = getInsights();

  return (
    <Fade in timeout={500}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Budget & Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your spending and stay on budget
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Edit Budget">
              <IconButton color="primary">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Category">
              <IconButton color="primary">
                <Add />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Budget Overview */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Grow in timeout={300}>
              <Card sx={{ 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Budget Overview
                  </Typography>
                  <Typography variant="h3" sx={{ my: 2 }}>
                    {formatCurrency(totalSpent)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    of {formatCurrency(budget.monthlyLimit)} budget
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={getPercentage(totalSpent, budget.monthlyLimit)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white',
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {getPercentage(totalSpent, budget.monthlyLimit)}% used
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Insights */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Info sx={{ mr: 1 }} />
                  <Typography variant="h6">Spending Insights</Typography>
                </Box>
                <List>
                  {insights.map((insight, index) => (
                    <Grow in timeout={500 + index * 100} key={index}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              {insight.icon}
                              <Typography sx={{ ml: 1 }}>{insight.message}</Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={insight.type}
                            color={insight.type as any}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Grow>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Breakdown */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">Category Breakdown</Typography>
                  <Box>
                    <Button
                      variant={viewMode === 'pie' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setViewMode('pie')}
                      startIcon={<PieChartIcon />}
                      sx={{ mr: 1 }}
                    >
                      Pie Chart
                    </Button>
                    <Button
                      variant={viewMode === 'bar' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setViewMode('bar')}
                      startIcon={<BarChartIcon />}
                    >
                      Bar Chart
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box height={400}>
                      {viewMode === 'pie' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: any) => formatCurrency(value as number)} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <RechartsTooltip formatter={(value: any) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="spent" fill="#8884d8" name="Spent" />
                            <Bar dataKey="remaining" fill="#82ca9d" name="Remaining" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <List>
                      {Object.entries(budget.categories).map(([catName, category], index) => {
                        const percentage = getPercentage(category.spent, category.limit);
                        return (
                          <Fade in timeout={300 + index * 100} key={catName}>
                            <Paper sx={{ mb: 2, p: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2">{catName}</Typography>
                                <Chip
                                  label={`${percentage}%`}
                                  size="small"
                                  color={getProgressColor(percentage) as any}
                                />
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={percentage}
                                color={getProgressColor(percentage) as any}
                                sx={{ mb: 1, height: 8, borderRadius: 4 }}
                              />
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  {formatCurrency(category.spent)} spent
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {formatCurrency(category.limit)} limit
                                </Typography>
                              </Box>
                            </Paper>
                          </Fade>
                        );
                      })}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default BudgetPage; 