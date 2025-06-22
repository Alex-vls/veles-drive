import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  Card,
  CardContent,
  CardActions,
  Rating,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { usersService } from './services/users';
import { Review } from './types/review';

interface Props {
  userId: number;
}

const UserReviews: React.FC<Props> = ({ userId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUserReviews(userId, {
        page,
        page_size: 10,
        ordering: '-created_at',
      });
      setReviews(response.results);
      setTotalPages(Math.ceil(response.count / 10));
    } catch (err) {
      setError('Ошибка при загрузке отзывов');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId, page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;

    try {
      setLoading(true);
      await usersService.deleteCompanyReview(selectedReview.company.id, selectedReview.id);
      setReviews(reviews.filter(review => review.id !== selectedReview.id));
      setDeleteDialogOpen(false);
      setSelectedReview(null);
    } catch (err) {
      setError('Ошибка при удалении отзыва');
      console.error('Error deleting review:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          У вас пока нет отзывов
        </Typography>
        <Button variant="contained" href="/companies">
          Перейти к списку компаний
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Мои отзывы
      </Typography>
      {reviews.map((review) => (
        <Card key={review.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                {review.company.name}
              </Typography>
              <Box>
                <Tooltip title="Редактировать">
                  <IconButton
                    size="small"
                    onClick={() => window.location.href = `/companies/${review.company.id}/reviews/${review.id}/edit`}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(review)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={review.rating} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                {new Date(review.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            <Typography variant="body1">
              {review.text}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              href={`/companies/${review.company.id}`}
            >
              Перейти к компании
            </Button>
          </CardActions>
        </Card>
      ))}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот отзыв?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserReviews; 