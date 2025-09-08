import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Rating,
  Typography,
  Paper,
} from '@mui/material';
import { Review } from './types';

interface Props {
  onSubmit: (data: { rating: number; comment: string }) => Promise<void>;
  initialData?: Review;
}

const ReviewForm: React.FC<Props> = ({ onSubmit, initialData }) => {
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Пожалуйста, выберите оценку');
      return;
    }
    if (!comment.trim()) {
      setError('Пожалуйста, напишите комментарий');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({ rating, comment });
      setRating(0);
      setComment('');
    } catch (err) {
      setError('Ошибка при отправке отзыва');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend" gutterBottom>
            Ваша оценка
          </Typography>
          <Rating
            value={rating}
            onChange={(_, value) => {
              setRating(value || 0);
              setError(null);
            }}
            size="large"
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Ваш отзыв"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setError(null);
          }}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Отправить отзыв'}
        </Button>
      </form>
    </Paper>
  );
};

export default ReviewForm; 