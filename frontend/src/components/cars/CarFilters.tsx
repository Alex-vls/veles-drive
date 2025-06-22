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
  Slider,
  Button,
  Grid,
} from '@mui/material';
import { CarFilters } from './services/cars';

interface Props {
  filters: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
  onReset: () => void;
}

const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Механическая' },
  { value: 'automatic', label: 'Автоматическая' },
  { value: 'robot', label: 'Робот' },
  { value: 'variator', label: 'Вариатор' },
];

const FUEL_TYPE_OPTIONS = [
  { value: 'petrol', label: 'Бензин' },
  { value: 'diesel', label: 'Дизель' },
  { value: 'gas', label: 'Газ' },
  { value: 'hybrid', label: 'Гибрид' },
  { value: 'electric', label: 'Электро' },
];

const CarFiltersComponent: React.FC<Props> = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (field: keyof CarFilters) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    onFilterChange({
      ...filters,
      [field]: event.target.value,
    });
  };

  const handleRangeChange = (field: string) => (_: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onFilterChange({
        ...filters,
        [`min_${field}`]: newValue[0],
        [`max_${field}`]: newValue[1],
      });
    }
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
            label="Марка"
            value={filters.brand || ''}
            onChange={handleChange('brand')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Модель"
            value={filters.model || ''}
            onChange={handleChange('model')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Коробка передач</InputLabel>
            <Select
              value={filters.transmission || ''}
              label="Коробка передач"
              onChange={handleChange('transmission')}
            >
              <MenuItem value="">Все</MenuItem>
              {TRANSMISSION_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Тип топлива</InputLabel>
            <Select
              value={filters.fuel_type || ''}
              label="Тип топлива"
              onChange={handleChange('fuel_type')}
            >
              <MenuItem value="">Все</MenuItem>
              {FUEL_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography gutterBottom>Цена</Typography>
          <Slider
            value={[filters.min_price || 0, filters.max_price || 10000000]}
            onChange={handleRangeChange('price')}
            valueLabelDisplay="auto"
            min={0}
            max={10000000}
            step={100000}
            valueLabelFormat={(value) => `${value.toLocaleString()} ₽`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography gutterBottom>Год выпуска</Typography>
          <Slider
            value={[filters.min_year || 1990, filters.max_year || new Date().getFullYear()]}
            onChange={handleRangeChange('year')}
            valueLabelDisplay="auto"
            min={1990}
            max={new Date().getFullYear()}
            step={1}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Typography gutterBottom>Пробег</Typography>
          <Slider
            value={[filters.min_mileage || 0, filters.max_mileage || 300000]}
            onChange={handleRangeChange('mileage')}
            valueLabelDisplay="auto"
            min={0}
            max={300000}
            step={10000}
            valueLabelFormat={(value) => `${value.toLocaleString()} км`}
          />
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
              <MenuItem value="price">По возрастанию цены</MenuItem>
              <MenuItem value="-price">По убыванию цены</MenuItem>
              <MenuItem value="year">По году выпуска (старые)</MenuItem>
              <MenuItem value="-year">По году выпуска (новые)</MenuItem>
              <MenuItem value="mileage">По пробегу (малый)</MenuItem>
              <MenuItem value="-mileage">По пробегу (большой)</MenuItem>
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

export default CarFiltersComponent; 