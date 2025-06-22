import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { RootState } from '../store';
import { removeNotification } from '../store/slices/uiSlice';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state: RootState) => state.ui.notifications
  );

  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [notifications, dispatch]);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 2 }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default Notifications; 