import React, { useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { Car } from '../../types';
import BaseForm from './BaseForm';
import { useGetBrandsQuery } from '../../services/api';

interface CarFormProps {
  initialData?: Partial<Car>;
  onSubmit: (data: Partial<Car>) => void;
  loading?: boolean;
  error?: string;
}

const CarForm: React.FC<CarFormProps> = ({
  initialData,
  onSubmit,
  loading,
  error,
}) => {
  const [formData, setFormData] = useState<Partial<Car>>(
    initialData || {
      brand: undefined,
      model: undefined,
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      transmission: 'manual',
      fuel_type: 'petrol',
      body_type: 'sedan',
      color: '',
      description: '',
      is_available: true,
    }
  );

  const { data: brands } = useGetBrandsQuery();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BaseForm
      title={initialData ? 'Edit Car' : 'Add New Car'}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitText={initialData ? 'Update Car' : 'Add Car'}
    >
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Brand</InputLabel>
          <Select
            name="brand"
            value={formData.brand || ''}
            label="Brand"
            onChange={handleChange}
            required
          >
            {brands?.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="model"
          label="Model"
          value={formData.model || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="year"
          label="Year"
          type="number"
          value={formData.year || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="price"
          label="Price"
          type="number"
          value={formData.price || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="mileage"
          label="Mileage"
          type="number"
          value={formData.mileage || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Transmission</InputLabel>
          <Select
            name="transmission"
            value={formData.transmission || ''}
            label="Transmission"
            onChange={handleChange}
            required
          >
            <MenuItem value="manual">Manual</MenuItem>
            <MenuItem value="automatic">Automatic</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Fuel Type</InputLabel>
          <Select
            name="fuel_type"
            value={formData.fuel_type || ''}
            label="Fuel Type"
            onChange={handleChange}
            required
          >
            <MenuItem value="petrol">Petrol</MenuItem>
            <MenuItem value="diesel">Diesel</MenuItem>
            <MenuItem value="electric">Electric</MenuItem>
            <MenuItem value="hybrid">Hybrid</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Body Type</InputLabel>
          <Select
            name="body_type"
            value={formData.body_type || ''}
            label="Body Type"
            onChange={handleChange}
            required
          >
            <MenuItem value="sedan">Sedan</MenuItem>
            <MenuItem value="suv">SUV</MenuItem>
            <MenuItem value="hatchback">Hatchback</MenuItem>
            <MenuItem value="coupe">Coupe</MenuItem>
            <MenuItem value="wagon">Wagon</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="color"
          label="Color"
          value={formData.color || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          name="description"
          label="Description"
          multiline
          rows={4}
          value={formData.description || ''}
          onChange={handleChange}
          required
        />
      </Grid>
    </BaseForm>
  );
};

export default CarForm; 