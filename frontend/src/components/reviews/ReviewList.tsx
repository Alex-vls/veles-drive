import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Rating,
  Divider,
  Paper,
} from '@mui/material';
import { Review } from '@/types';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Отзывов пока нет
        </Typography>
      </Paper>
    );
  }

  return (
    <List>
      {reviews.map((review, index) => (
        <React.Fragment key={review.id}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {review.user.username}
                  </Typography>
                  <Rating value={review.rating} readOnly size="small" />
                </Box>
              }
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    {review.title}
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    {review.content}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                </>
              }
            />
          </ListItem>
          {index < reviews.length - 1 && <Divider component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default ReviewList; 