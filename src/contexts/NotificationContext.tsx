import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps } from '@mui/material';

interface Notification {
  id: string;
  message: string;
  severity: AlertColor;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor, duration?: number) => void;
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, severity: AlertColor = 'info', duration: number = 5000) => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      severity,
      duration,
    };

    setNotifications(prev => [...prev, notification]);
    setCurrentNotification(notification);
    setOpen(true);

    // Auto close after duration
    setTimeout(() => {
      handleClose();
    }, duration);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
      if (notifications.length > 1) {
        setCurrentNotification(notifications[1]);
        setOpen(true);
      }
    }, 300);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, notifications }}>
      {children}
      {currentNotification && (
        <Snackbar
          open={open}
          autoHideDuration={currentNotification.duration}
          onClose={handleClose}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleClose}
            severity={currentNotification.severity}
            sx={{
              width: '100%',
              boxShadow: 3,
              '& .MuiAlert-icon': {
                fontSize: 26,
              },
            }}
            variant="filled"
            elevation={6}
          >
            {currentNotification.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 