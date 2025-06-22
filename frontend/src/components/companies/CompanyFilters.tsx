import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from '@mui/material';
import { CompanyFilters } from './services/companies';

interface Props {
  filters: CompanyFilters;
  onFilterChange: (filters: CompanyFilters) => void;
  onReset: () => void;
}

const CompanyFiltersComponent: React.FC<Props> = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (field: keyof CompanyFilters) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    onFilterChange({
      ...filters,
      [field]: event.target.value,
    });
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Фильтры
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Название"
            value={filters.name || ''}
            onChange={handleChange('name')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Город"
            value={filters.city || ''}
            onChange={handleChange('city')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              value={filters.is_verified === undefined ? '' : filters.is_verified}
              label="Статус"
              onChange={handleChange('is_verified')}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="true">Проверенные</MenuItem>
              <MenuItem value="false">Непроверенные</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={filters.ordering || ''}
              label="Сортировка"
              onChange={handleChange('ordering')}
            >
              <MenuItem value="">По умолчанию</MenuItem>
              <MenuItem value="name">По названию (А-Я)</MenuItem>
              <MenuItem value="-name">По названию (Я-А)</MenuItem>
              <MenuItem value="rating">По рейтингу (возрастание)</MenuItem>
              <MenuItem value="-rating">По рейтингу (убывание)</MenuItem>
              <MenuItem value="cars_count">По количеству автомобилей</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onReset}>
          Сбросить фильтры
        </Button>
      </Box>
    </Paper>
  );
};

export default CompanyFiltersComponent; 