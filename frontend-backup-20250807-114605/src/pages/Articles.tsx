import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { articleService } from './services/article';
import { Article, PaginatedResponse } from './types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import SearchIcon from '@mui/icons-material/Search';

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchArticles = async (pageNum = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data: PaginatedResponse<Article> = await articleService.getArticles({ 
        page: pageNum,
        search: search || undefined
      });
      setArticles(data.results);
      setCount(Math.ceil(data.count / 10));
    } catch (err) {
      setError('Ошибка загрузки статей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles(page, searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [page, searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Статьи
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Поиск статей..."
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : articles.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Статьи не найдены
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {articles.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/articles/${item.id}`)}>
                    {item.image && (
                      <CardMedia
                        component="img"
                        height="160"
                        image={item.image}
                        alt={item.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.author?.username} • {format(new Date(item.created_at), 'PP', { locale: ru })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {item.content}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          {count > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={count}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ArticlesPage; 