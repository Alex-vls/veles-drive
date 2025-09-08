import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Rating,
  Typography,
} from '@mui/material';
import { Review } from '../../types';
import BaseForm from './BaseForm';

interface ReviewFormProps {
  initialData?: Partial<Review>;
  onSubmit: (data: Partial<Review>) => void;
  loading?: boolean;
  error?: string;
  companyId?: number;
  carId?: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  initialData,
  onSubmit,
  loading,
  error,
  companyId,
  carId,
}) => {
  const [formData, setFormData] = useState<Partial<Review>>(
    initialData || {
      rating: 0,
      comment: '',
      company: companyId,
      car: carId,
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

  const handleRatingChange = (_: React.SyntheticEvent, value: number | null) => {
    setFormData((prev) => ({
      ...prev,
      rating: value || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BaseForm
      title={initialData ? 'Edit Review' : 'Write a Review'}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      submitText={initialData ? 'Update Review' : 'Submit Review'}
    >
      <Grid item xs={12}>
        <Typography component="legend">Rating</Typography>
        <Rating
          name="rating"
          value={formData.rating || 0}
          onChange={handleRatingChange}
          precision={0.5}
          size="large"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          name="comment"
          label="Your Review"
          multiline
          rows={4}
          value={formData.comment || ''}
          onChange={handleChange}
          required
        />
      </Grid>
    </BaseForm>
  );
};

export default ReviewForm; 