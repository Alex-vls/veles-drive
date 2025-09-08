import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CardMedia,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
} from '@mui/material';
import { newsService } from './services/news';
import { News } from './types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getNewsById } from '../data/mockData';

const NewsDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!id) return;
    const newsData = getNewsById(id);
    setNews(newsData || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }
  if (error || !news) {
    return <Alert severity="error">{error || 'Новость не найдена'}</Alert>;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        {news.image && (
          <CardMedia
            component="img"
            height="320"
            image={news.image}
            alt={news.title}
            sx={{ borderRadius: 2, mb: 2 }}
          />
        )}
        <Typography variant="h4" gutterBottom>
          {news.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {news.author?.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {news.author?.username} • {format(new Date(news.created_at), 'PP', { locale: ru })}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {news.content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default NewsDetails; 