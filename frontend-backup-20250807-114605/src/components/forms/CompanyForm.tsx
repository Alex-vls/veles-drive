import React, { useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import { Company, CompanySchedule } from '../../types';
import BaseForm from './BaseForm';

interface CompanyFormProps {
  initialData?: Partial<Company>;
  onSubmit: (data: Partial<Company>) => void;
  loading?: boolean;
  error?: string;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  initialData,
  onSubmit,
  loading,
  error,
}) => {
  const [formData, setFormData] = useState<Partial<Company>>(
    initialData || {
      name: '',
      description: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      website: '',
      schedule: Array.from({ length: 7 }, (_, i) => ({
        day_of_week: i,
        open_time: '09:00',
        close_time: '18:00',
        is_closed: false,
      })) as CompanySchedule[],
    }
  );

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

  const handleScheduleChange = (
    dayIndex: number,
    field: keyof CompanySchedule,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const newSchedule = [...(prev.schedule || [])];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        [field]: value,
      };
      return {
        ...prev,
        schedule: newSchedule,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return (
    <BaseForm
      title={initialData ? 'Edit Company' : 'Add New Company'}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitText={initialData ? 'Update Company' : 'Add Company'}
    >
      <Grid item xs={12}>
        <TextField
          fullWidth
          name="name"
          label="Company Name"
          value={formData.name || ''}
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

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="address"
          label="Address"
          value={formData.address || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="city"
          label="City"
          value={formData.city || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="phone"
          label="Phone"
          value={formData.phone || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="email"
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          name="website"
          label="Website"
          value={formData.website || ''}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Working Hours
        </Typography>
        {days.map((day, index) => (
          <Grid container spacing={2} key={day} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <Typography>{day}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="time"
                value={formData.schedule?.[index]?.open_time || '09:00'}
                onChange={(e) =>
                  handleScheduleChange(index, 'open_time', e.target.value)
                }
                disabled={formData.schedule?.[index]?.is_closed}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="time"
                value={formData.schedule?.[index]?.close_time || '18:00'}
                onChange={(e) =>
                  handleScheduleChange(index, 'close_time', e.target.value)
                }
                disabled={formData.schedule?.[index]?.is_closed}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <Select
                  value={formData.schedule?.[index]?.is_closed ? 'closed' : 'open'}
                  onChange={(e) =>
                    handleScheduleChange(
                      index,
                      'is_closed',
                      e.target.value === 'closed'
                    )
                  }
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </BaseForm>
  );
};

export default CompanyForm; 