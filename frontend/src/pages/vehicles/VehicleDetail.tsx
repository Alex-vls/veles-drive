import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  Button, 
  Chip, 
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetVehicleQuery } from '@/services/api';
import SchemaOrg from '@/components/SchemaOrg/SchemaOrg';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
  color: 'white',
  padding: theme.spacing(8, 0),
  position: 'relative',
  overflow: 'hidden',
}));

const ImageGallery = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const SpecCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  padding: theme.spacing(3),
  color: 'white',
}));

const VehicleDetail: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { data: vehicle, isLoading } = useGetVehicleQuery(Number(id));

  if (isLoading || !vehicle) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  // Schema.org разметка
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${vehicle.brand.name} ${vehicle.model.name}`,
    "description": vehicle.description,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brand.name
    },
    "model": vehicle.model.name,
    "category": vehicle.vehicle_type,
    "offers": {
      "@type": "Offer",
      "price": vehicle.price,
      "priceCurrency": vehicle.currency,
      "availability": vehicle.is_available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  const tabs = [
    { label: 'Описание', content: 'description' },
    { label: 'Характеристики', content: 'specs' },
    { label: 'Документы', content: 'docs' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#000' }}>
      <SchemaOrg data={schemaData} />
      
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h1" sx={{ 
                  fontSize: isMobile ? '2rem' : '3rem', 
                  fontWeight: 700, 
                  mb: 2 
                }}>
                  {vehicle.brand.name} {vehicle.model.name}
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontSize: isMobile ? '1.5rem' : '2rem', 
                  mb: 3,
                  opacity: 0.8 
                }}>
                  {vehicle.year} • {vehicle.power} л.с.
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontSize: isMobile ? '2rem' : '3rem', 
                  fontWeight: 700,
                  mb: 4,
                  color: '#007AFF'
                }}>
                  {vehicle.price.toLocaleString()} ₽
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                    onClick={() => navigate('/contact')}
                  >
                    Оставить заявку
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                    onClick={() => navigate('/leasing')}
                  >
                    Лизинг
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 20,
                  overflow: 'hidden'
                }}>
                  <CardMedia
                    component="img"
                    height="400"
                    image={vehicle.images?.[selectedImage]?.image || '/images/placeholder.jpg'}
                    alt={`${vehicle.brand.name} ${vehicle.model.name}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
                
                {/* Image Gallery */}
                {vehicle.images && vehicle.images.length > 1 && (
                  <ImageGallery>
                    {vehicle.images.map((image, index) => (
                      <Card
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        sx={{
                          cursor: 'pointer',
                          border: selectedImage === index ? '2px solid #007AFF' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 2,
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="100"
                          image={image.image}
                          alt={`${vehicle.brand.name} ${vehicle.model.name} - изображение ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Card>
                    ))}
                  </ImageGallery>
                )}
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      {/* Specifications */}
      <Box sx={{ py: 8, background: '#111' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ 
            fontSize: isMobile ? '2rem' : '3rem', 
            fontWeight: 700, 
            textAlign: 'center',
            color: 'white',
            mb: 6
          }}>
            Характеристики
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <SpecCard>
                <Typography variant="h6" sx={{ mb: 3, color: '#007AFF' }}>
                  Основные характеристики
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Марка" 
                      secondary={vehicle.brand.name}
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Модель" 
                      secondary={vehicle.model.name}
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Год выпуска" 
                      secondary={vehicle.year}
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Пробег" 
                      secondary={`${vehicle.mileage.toLocaleString()} км`}
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </ListItem>
                </List>
              </SpecCard>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SpecCard>
                <Typography variant="h6" sx={{ mb: 3, color: '#007AFF' }}>
                  Технические характеристики
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Тип топлива" 
                      secondary={vehicle.fuel_type === 'petrol' ? 'Бензин' :
                                vehicle.fuel_type === 'diesel' ? 'Дизель' :
                                vehicle.fuel_type === 'electric' ? 'Электро' :
                                vehicle.fuel_type === 'hybrid' ? 'Гибрид' : vehicle.fuel_type}
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Трансмиссия" 
                      secondary={vehicle.transmission === 'manual' ? 'Механика' :
                                vehicle.transmission === 'automatic' ? 'Автомат' :
                                vehicle.transmission === 'robot' ? 'Робот' :
                                vehicle.transmission === 'variator' ? 'Вариатор' : vehicle.transmission}
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Объем двигателя" 
                      secondary={`${vehicle.engine_volume} л`}
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Мощность" 
                      secondary={`${vehicle.power} л.с.`}
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                  </ListItem>
                </List>
              </SpecCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ py: 8, background: '#000' }}>
        <Container maxWidth="lg">
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)', mb: 4 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-selected': {
                    color: '#007AFF',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#007AFF',
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
          </Box>
          
          <Box sx={{ color: 'white' }}>
            {activeTab === 0 && (
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                {vehicle.description}
              </Typography>
            )}
            
            {activeTab === 1 && (
              <Grid container spacing={3}>
                {vehicle.features?.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ 
                      p: 3, 
                      background: 'rgba(255,255,255,0.05)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <Typography variant="subtitle1" sx={{ color: '#007AFF', mb: 1 }}>
                        {feature.name}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {feature.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {activeTab === 2 && (
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Документы будут доступны при оформлении заявки.
              </Typography>
            )}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
              Заинтересовались?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Оставьте заявку и мы свяжемся с вами в течение 15 минут
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                onClick={() => navigate('/contact')}
              >
                Оставить заявку
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                onClick={() => navigate('/vehicles')}
              >
                Вернуться к каталогу
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default VehicleDetail; 