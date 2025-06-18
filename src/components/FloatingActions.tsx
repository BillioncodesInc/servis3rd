import React, { useState } from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  SwapHoriz,
  Payment,
  CameraAlt,
  AccountBalance,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FloatingActions: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: <SwapHoriz />, name: 'Transfer', path: '/transfer', color: '#2196F3' },
    { icon: <Payment />, name: 'Pay Bills', path: '/billpay', color: '#4CAF50' },
    { icon: <CameraAlt />, name: 'Deposit', path: '/mobile-deposit', color: '#FF9800' },
    { icon: <AccountBalance />, name: 'Accounts', path: '/accounts', color: '#9C27B0' },
  ];

  const handleAction = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <SpeedDial
      ariaLabel="Quick actions"
      sx={{
        position: 'fixed',
        bottom: isMobile ? 80 : 24,
        right: 24,
        '& .MuiSpeedDial-fab': {
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #003366 0%, #004080 100%)',
          '&:hover': {
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
              : 'linear-gradient(135deg, #004080 0%, #003366 100%)',
          },
        },
      }}
      icon={<SpeedDialIcon openIcon={<Close />} />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      direction="up"
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => handleAction(action.path)}
          sx={{
            backgroundColor: action.color,
            color: 'white',
            '&:hover': {
              backgroundColor: action.color,
              transform: 'scale(1.1)',
            },
          }}
        />
      ))}
    </SpeedDial>
  );
};

export default FloatingActions; 