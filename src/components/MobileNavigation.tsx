import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import {
  Dashboard,
  AccountBalance,
  SwapHoriz,
  Payment,
  Menu as MenuIcon,
  CreditCard,
} from '@mui/icons-material';

interface MobileNavigationProps {
  onMenuClick: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { label: 'Dashboard', value: '/dashboard', icon: <Dashboard /> },
    { label: 'Accounts', value: '/accounts', icon: <AccountBalance /> },
    { label: 'Transfer', value: '/transfer', icon: <SwapHoriz /> },
    { label: 'Cards', value: '/cards', icon: <CreditCard /> },
    { label: 'Bill Pay', value: '/billpay', icon: <Payment /> },
    { label: 'More', value: 'menu', icon: <MenuIcon /> },
  ];

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (newValue === 'menu') {
      onMenuClick();
    } else {
      navigate(newValue);
    }
  };

  const getPathIndex = (pathname: string): number => {
    const paths = ['/dashboard', '/accounts', '/transfer', '/cards', '/billpay'];
    const index = paths.findIndex(path => pathname.startsWith(path));
    return index === -1 ? 0 : index;
  };

  const getPathFromIndex = (index: number): string => {
    const paths = ['/dashboard', '/accounts', '/transfer', '/cards', '/billpay'];
    return paths[index] || '/dashboard';
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: 'block', sm: 'none' },
        zIndex: 1200,
      }}
      elevation={8}
    >
      <BottomNavigation
        value={location.pathname}
        onChange={handleChange}
        showLabels
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
            sx={{
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
        ))}
      </BottomNavigation>
      <Box sx={{ height: 'env(safe-area-inset-bottom)' }} />
    </Paper>
  );
};

export default MobileNavigation; 