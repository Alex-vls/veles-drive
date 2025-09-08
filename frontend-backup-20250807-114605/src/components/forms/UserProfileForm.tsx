import React, { useState } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { User } from '../../types';
import BaseForm from './BaseForm';

interface UserProfileFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: Partial<User>) => void;
  loading?: boolean;
  error?: string;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialData,
  onSubmit,
  loading,
  error,
}) => {
  const [formData, setFormData] = useState<Partial<User>>(
    initialData || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'user',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BaseForm
      title="Edit Profile"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitText="Update Profile"
    >
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="first_name"
          label="First Name"
          value={formData.first_name || ''}
          onChange={handleChange}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="last_name"
          label="Last Name"
          value={formData.last_name || ''}
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

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          name="phone"
          label="Phone"
          value={formData.phone || ''}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            name="role"
            value={formData.role || 'user'}
            onChange={handleChange}
            label="Role"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="company_owner">Company Owner</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </BaseForm>
  );
};

export default UserProfileForm; 