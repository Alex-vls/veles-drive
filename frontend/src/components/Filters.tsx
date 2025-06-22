import React from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { CarFilters, CompanyFilters } from '../types';

interface FiltersProps {
  type: 'car' | 'company';
  filters: CarFilters | CompanyFilters;
  onFilterChange: (filters: Partial<CarFilters | CompanyFilters>) => void;
  onReset: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  type,
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    if (name) {
      onFilterChange({ [name]: value });
    }
  };

  const renderCarFilters = () => (
    <>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          name="brand"
          label="Brand"
          value={filters.brand}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          name="model"
          label="Model"
          value={filters.model}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          name="yearFrom"
          label="Year From"
          type="number"
          value={filters.yearFrom}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          name="yearTo"
          label="Year To"
          type="number"
          value={filters.yearTo}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          name="priceFrom"
          label="Price From"
          type="number"
          value={filters.priceFrom}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          name="priceTo"
          label="Price To"
          type="number"
          value={filters.priceTo}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel>Transmission</InputLabel>
          <Select
            name="transmission"
            value={filters.transmission}
            label="Transmission"
            onChange={handleChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="manual">Manual</MenuItem>
            <MenuItem value="automatic">Automatic</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel>Fuel Type</InputLabel>
          <Select
            name="fuelType"
            value={filters.fuelType}
            label="Fuel Type"
            onChange={handleChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="petrol">Petrol</MenuItem>
            <MenuItem value="diesel">Diesel</MenuItem>
            <MenuItem value="electric">Electric</MenuItem>
            <MenuItem value="hybrid">Hybrid</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </>
  );

  const renderCompanyFilters = () => (
    <>
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          fullWidth
          name="city"
          label="City"
          value={filters.city}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth>
          <InputLabel>Verified</InputLabel>
          <Select
            name="isVerified"
            value={filters.isVerified}
            label="Verified"
            onChange={handleChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Verified</MenuItem>
            <MenuItem value="false">Not Verified</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <FormControl fullWidth>
          <InputLabel>Rating</InputLabel>
          <Select
            name="rating"
            value={filters.rating}
            label="Rating"
            onChange={handleChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="4">4+ Stars</MenuItem>
            <MenuItem value="3">3+ Stars</MenuItem>
            <MenuItem value="2">2+ Stars</MenuItem>
            <MenuItem value="1">1+ Stars</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        {type === 'car' ? renderCarFilters() : renderCompanyFilters()}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={onReset}>
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Filters; 