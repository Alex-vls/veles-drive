import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { RootState } from '../store';
import { closeModal } from '../store/slices/uiSlice';

interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  id,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
}) => {
  const dispatch = useDispatch();
  const isOpen = useSelector(
    (state: RootState) => state.ui.modals[id] || false
  );

  const handleClose = () => {
    dispatch(closeModal(id));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby={`${id}-title`}
    >
      <DialogTitle id={`${id}-title`}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
};

export default Modal; 