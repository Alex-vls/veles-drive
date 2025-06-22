import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Company } from './types';

interface Props {
  initialData?: Company;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

const CompanyForm: React.FC<Props> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          data.append(key, value);
        }
      });

      if (logo) {
        data.append('logo', logo);
      }

      await onSubmit(data);
    } catch (err) {
      setError('Ошибка при сохранении данных компании');
      console.error('Error submitting company form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Основная информация
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Название компании"
              value={formData.name}
              onChange={handleChange('name')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Город"
              value={formData.city}
              onChange={handleChange('city')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Адрес"
              value={formData.address}
              onChange={handleChange('address')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Описание"
              value={formData.description}
              onChange={handleChange('description')}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Контактная информация
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Телефон"
              value={formData.phone}
              onChange={handleChange('phone')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange('email')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Веб-сайт"
              value={formData.website}
              onChange={handleChange('website')}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Логотип
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {logoPreview && (
                <Box sx={{ position: 'relative', width: 100, height: 100 }}>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveLogo}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
              <Button variant="outlined" component="label">
                {logoPreview ? 'Изменить логотип' : 'Загрузить логотип'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {initialData ? 'Сохранить' : 'Создать'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CompanyForm; 