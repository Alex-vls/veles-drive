import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { CarFilters, CompanyFilters } from '../types';

interface SortProps {
  type: 'car' | 'company';
  filters: CarFilters | CompanyFilters;
  onSortChange: (filters: Partial<CarFilters | CompanyFilters>) => void;
}

const Sort: React.FC<SortProps> = ({ type, filters, onSortChange }) => {
  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    if (name) {
      onSortChange({ [name]: value });
    }
  };

  const carSortOptions = [
    { value: 'price', label: 'Price' },
    { value: 'year', label: 'Year' },
    { value: 'mileage', label: 'Mileage' },
    { value: 'created_at', label: 'Date Added' },
  ];

  const companySortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Date Added' },
  ];

  const sortOptions = type === 'car' ? carSortOptions : companySortOptions;

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth>
        <InputLabel>Sort By</InputLabel>
        <Select
          name="sortBy"
          value={filters.sortBy}
          label="Sort By"
          onChange={handleChange}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Order</InputLabel>
        <Select
          name="sortOrder"
          value={filters.sortOrder}
          label="Order"
          onChange={handleChange}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default Sort; 