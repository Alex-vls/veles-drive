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
  Container,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mockNews, News } from '../data/mockData';
import NewsCard from '../components/Cards/NewsCard';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  const itemsPerPage = 9;

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // Используем тестовые данные вместо API
      console.log('Loading mock news:', mockNews);
      setNews(mockNews);
    } catch (err) {
      setError('Ошибка загрузки новостей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    // Фильтрация новостей по категории
    let filtered = [...news];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredNews(filtered);
    setCount(Math.ceil(filtered.length / itemsPerPage));
    setPage(1);
  }, [news, selectedCategory]);

  // Получаем новости для текущей страницы
  const paginatedNews = filteredNews.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Получаем уникальные категории
  const categories = ['all', ...Array.from(new Set(news.map(item => item.category)))];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
    } catch {
      return dateString;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F5F7' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        <Typography 
          variant="h3" 
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 700,
            color: '#1D1D1F',
            mb: 4,
          }}
        >
          Новости
        </Typography>

        {/* Фильтр по категориям */}
        <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category === 'all' ? 'Все' : category}
              onClick={() => setSelectedCategory(category)}
              sx={{
                backgroundColor: selectedCategory === category ? '#0071E3' : '#F5F5F7',
                color: selectedCategory === category ? 'white' : '#636366',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: selectedCategory === category ? '#007AFF' : '#E5E5EA',
                },
              }}
            />
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredNews.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'white', borderRadius: '16px' }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#636366',
                mb: 2,
              }}
            >
              Новости не найдены
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#636366',
              }}
            >
              Попробуйте выбрать другую категорию
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedNews.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <NewsCard
                    news={{
                      id: parseInt(item.id),
                      title: item.title,
                      excerpt: item.excerpt,
                      content: item.content,
                      image: item.image,
                      author: {
                        name: item.author,
                        avatar: undefined,
                      },
                      publishedAt: item.date,
                      category: item.category,
                      readTime: item.readTime,
                      tags: item.tags,
                      isBookmarked: false,
                    }}
                    onBookmarkToggle={(id) => console.log('Bookmark news:', id)}
                    onShare={(id) => console.log('Share news:', id)}
                  />
                </Grid>
              ))}
            </Grid>
            
            {count > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={count}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '8px',
                      fontWeight: 600,
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#0071E3',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#007AFF',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default NewsPage; 