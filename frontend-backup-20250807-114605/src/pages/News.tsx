import React, { useState } from 'react';
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
import NewsCard from '../components/Cards/NewsCard';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface News {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: number;
  tags: string[];
}

const NewsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  const itemsPerPage = 9;

  // Статические данные новостей (пока нет API)
  const mockNews: News[] = [
    {
      id: '1',
      title: 'Новые электромобили Tesla Model Y поступили в продажу',
      excerpt: 'Компания Tesla объявила о начале продаж нового электромобиля Model Y в России.',
      content: 'Полный текст новости о Tesla Model Y...',
      image: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400&h=250&fit=crop',
      category: 'Электромобили',
      author: 'Алексей Петров',
      date: '2024-01-15',
      readTime: 3,
      tags: ['Tesla', 'Электромобили', 'Model Y']
    },
    {
      id: '2',
      title: 'BMW представил новое поколение X5',
      excerpt: 'Немецкий автопроизводитель показал обновленный внедорожник BMW X5.',
      content: 'Полный текст новости о BMW X5...',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop',
      category: 'Новинки',
      author: 'Мария Сидорова',
      date: '2024-01-12',
      readTime: 4,
      tags: ['BMW', 'X5', 'Внедорожники']
    },
    {
      id: '3',
      title: 'Изменения в правилах ОСАГО с 2024 года',
      excerpt: 'С 1 января 2024 года вступили в силу новые правила обязательного страхования.',
      content: 'Полный текст о изменениях в ОСАГО...',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
      category: 'Страхование',
      author: 'Дмитрий Козлов',
      date: '2024-01-10',
      readTime: 5,
      tags: ['ОСАГО', 'Страхование', 'Законодательство']
    },
    {
      id: '4',
      title: 'Mercedes-Benz обновил линейку C-Class',
      excerpt: 'Компания Mercedes-Benz представила обновленную версию популярного седана C-Class.',
      content: 'Полный текст о Mercedes-Benz C-Class...',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=250&fit=crop',
      category: 'Новинки',
      author: 'Елена Волкова',
      date: '2024-01-08',
      readTime: 3,
      tags: ['Mercedes-Benz', 'C-Class', 'Седаны']
    },
    {
      id: '5',
      title: 'Топ-10 самых надежных автомобилей 2024 года',
      excerpt: 'Эксперты составили рейтинг самых надежных автомобилей по итогам 2024 года.',
      content: 'Полный текст рейтинга надежности...',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop',
      category: 'Обзоры',
      author: 'Сергей Иванов',
      date: '2024-01-05',
      readTime: 7,
      tags: ['Надежность', 'Рейтинг', 'Обзор']
    },
    {
      id: '6',
      title: 'Новые технологии в автомобильной промышленности',
      excerpt: 'Обзор последних технологических достижений в автомобильной отрасли.',
      content: 'Полный текст о технологиях...',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop',
      category: 'Технологии',
      author: 'Анна Смирнова',
      date: '2024-01-03',
      readTime: 6,
      tags: ['Технологии', 'Инновации', 'Автопром']
    },
    {
      id: '7',
      title: 'Audi представил новый электрический концепт',
      excerpt: 'Audi показал концепт полностью электрического автомобиля будущего.',
      content: 'Полный текст о новом концепте Audi...',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop',
      category: 'Электромобили',
      author: 'Игорь Николаев',
      date: '2024-01-02',
      readTime: 4,
      tags: ['Audi', 'Электромобили', 'Концепт']
    },
    {
      id: '8',
      title: 'Рост продаж мотоциклов в России',
      excerpt: 'Статистика показывает значительный рост продаж мотоциклов в 2024 году.',
      content: 'Полный текст о росте продаж мотоциклов...',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
      category: 'Мотоциклы',
      author: 'Виктор Петров',
      date: '2024-01-01',
      readTime: 3,
      tags: ['Мотоциклы', 'Статистика', 'Продажи']
    },
    {
      id: '9',
      title: 'Новые правила регистрации автомобилей',
      excerpt: 'Изменения в процедуре регистрации автомобилей в ГИБДД.',
      content: 'Полный текст о новых правилах регистрации...',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
      category: 'Законодательство',
      author: 'Ольга Сидорова',
      date: '2023-12-30',
      readTime: 5,
      tags: ['Регистрация', 'ГИБДД', 'Законодательство']
    }
  ];

  // Фильтрация новостей по категории
  const filteredNews = selectedCategory === 'all' 
    ? mockNews 
    : mockNews.filter(item => item.category === selectedCategory);

  const count = Math.ceil(filteredNews.length / itemsPerPage);

  // Получаем новости для текущей страницы
  const paginatedNews = filteredNews.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const categories = [
    { id: 'all', name: 'Все категории' },
    { id: 'Новинки', name: 'Новинки' },
    { id: 'Электромобили', name: 'Электромобили' },
    { id: 'Обзоры', name: 'Обзоры' },
    { id: 'Технологии', name: 'Технологии' },
    { id: 'Страхование', name: 'Страхование' },
    { id: 'Законодательство', name: 'Законодательство' },
    { id: 'Мотоциклы', name: 'Мотоциклы' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Новости и обзоры
      </Typography>

      {/* Categories Filter */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              onClick={() => handleCategoryChange(category.id)}
              color={selectedCategory === category.id ? 'primary' : 'default'}
              variant={selectedCategory === category.id ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>

      {/* News Grid */}
      <Grid container spacing={3}>
        {paginatedNews.map((news) => (
          <Grid item xs={12} sm={6} md={4} key={news.id}>
            <NewsCard
              news={news}
              onBookmark={() => console.log('Bookmark:', news.id)}
              isBookmarked={false}
            />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {count > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={count}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default NewsPage; 