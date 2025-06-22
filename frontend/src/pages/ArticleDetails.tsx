import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CardMedia,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { articleService } from './services/article';
import { Article } from './types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ArticleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) return;
        const articleData = await articleService.getArticleItem(Number(id));
        setArticle(articleData);
      } catch (err) {
        setError('Ошибка загрузки статьи');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    if (!article) return;
    if (window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      try {
        await articleService.deleteArticle(article.id);
        navigate('/articles');
      } catch (err) {
        setError('Ошибка при удалении статьи');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !article) {
    return <Alert severity="error">{error || 'Статья не найдена'}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/articles')}
            sx={{ cursor: 'pointer' }}
          >
            Статьи
          </Link>
          <Typography color="text.primary">{article.title}</Typography>
        </Breadcrumbs>
        <Box>
          <IconButton onClick={() => navigate('/articles')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={() => navigate(`/articles/${article.id}/edit`)} sx={{ mr: 1 }}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleDelete} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        {article.image && (
          <CardMedia
            component="img"
            height="400"
            image={article.image}
            alt={article.title}
            sx={{ borderRadius: 2, mb: 3 }}
          />
        )}
        <Typography variant="h4" gutterBottom>
          {article.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {article.author?.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {article.author?.username} • {format(new Date(article.created_at), 'PP', { locale: ru })}
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {article.content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ArticleDetails; 