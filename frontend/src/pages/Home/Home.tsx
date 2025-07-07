import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, Chip, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGetVehiclesQuery } from '@/services/api';
import SchemaOrg from '@/components/SchemaOrg/SchemaOrg';

// Стилизованные компоненты в стиле Apple
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
  color: 'white',
  padding: theme.spacing(15, 0),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  }
}));

const ProductCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 20,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  }
}));

const CategoryButton = styled(Button)(({ theme, active }: { theme: any; active?: boolean }) => ({
  background: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 25,
  padding: theme.spacing(1.5, 3),
  margin: theme.spacing(0, 1),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  }
}));

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { data: vehiclesData, isLoading } = useGetVehiclesQuery({
    vehicle_type: selectedCategory === 'all' ? '' : selectedCategory,
    limit: 12
  });

  const categories = [
    { id: 'all', name: 'Вся техника', icon: '🚗' },
    { id: 'car', name: 'Автомобили', icon: '🏎️' },
    { id: 'motorcycle', name: 'Мотоциклы', icon: '🏍️' },
    { id: 'boat', name: 'Лодки', icon: '⛵' },
    { id: 'helicopter', name: 'Вертолеты', icon: '🚁' },
    { id: 'airplane', name: 'Самолеты', icon: '✈️' },
  ];

  const premiumVehicles = vehiclesData?.results || [];

  // Schema.org разметка
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VELES AUTO",
    "description": "Премиальные автомобили и техника",
    "url": "https://veles-auto.com",
    "logo": "https://veles-auto.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7 (937) 669-88-88",
      "contactType": "customer service"
    }
  };

  return (
    <Box>
      <SchemaOrg data={schemaData} />
      
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h1" sx={{ fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: 700, mb: 2 }}>
              VELES AUTO
            </Typography>
            <Typography variant="h2" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem', mb: 4, opacity: 0.9 }}>
              Премиальная техника. Безупречное качество.
            </Typography>
            <Typography variant="h3" sx={{ fontSize: isMobile ? '1rem' : '1.2rem', mb: 6, opacity: 0.7 }}>
              Подберём, купим, растаможим и доставим любой автомобиль из США, Европы и Азии
            </Typography>
            
            {/* Category Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 6 }}>
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  active={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  startIcon={<span>{category.icon}</span>}
                >
                  {category.name}
                </CategoryButton>
              ))}
            </Box>
          </motion.div>
        </Container>
      </HeroSection>

      {/* Premium Vehicles Section */}
      <Box sx={{ py: 8, background: '#000' }}>
        <Container maxWidth="lg">
          <SectionTitle>
            Премиальная техника
          </SectionTitle>
          
          <Grid container spacing={4}>
            {premiumVehicles.map((vehicle, index) => (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                    <CardMedia
                      component="img"
                      height="250"
                      image={vehicle.images?.[0]?.image || '/images/placeholder.jpg'}
                      alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
                        {vehicle.brand.name} {vehicle.model.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                        {vehicle.year} • {vehicle.power} л.с.
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                          {vehicle.price.toLocaleString()} ₽
                        </Typography>
                        <Chip 
                          label={vehicle.vehicle_type === 'car' ? 'Автомобиль' : 
                                 vehicle.vehicle_type === 'motorcycle' ? 'Мотоцикл' :
                                 vehicle.vehicle_type === 'boat' ? 'Лодка' :
                                 vehicle.vehicle_type === 'helicopter' ? 'Вертолет' :
                                 vehicle.vehicle_type === 'airplane' ? 'Самолет' : 'Техника'}
                          size="small"
                          sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                        />
                      </Box>
                      <Button 
                        variant="contained" 
                        fullWidth
                        sx={{ 
                          background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Подробнее
                      </Button>
                    </CardContent>
                  </ProductCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 8, background: '#111' }}>
        <Container maxWidth="lg">
          <SectionTitle>
            Наши услуги
          </SectionTitle>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>🚗</Typography>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Покупка техники
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Широкий выбор премиальной техники с доставкой по всему миру
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>💰</Typography>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Лизинг и кредит
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Гибкие финансовые решения для приобретения техники
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>🛡️</Typography>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Страхование
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Полный спектр страховых услуг для вашей техники
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
              Готовы к покупке?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Оставьте заявку и мы свяжемся с вами в течение 15 минут
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                background: 'white',
                color: '#007AFF',
                px: 4,
                py: 2,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
              onClick={() => navigate('/vehicles')}
            >
              Перейти в каталог
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 