import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';

interface BaseFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitText?: string;
  loading?: boolean;
  error?: string;
}

const BaseForm: React.FC<BaseFormProps> = ({
  title,
  onSubmit,
  children,
  submitText = 'Submit',
  loading = false,
  error,
}) => {
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {title}
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Grid container spacing={3}>
          {children}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : submitText}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BaseForm; 