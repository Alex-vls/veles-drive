import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateUserProfileMutation, useChangePasswordMutation } from '@/services/api';
import CarCard from '@/components/cars/CarCard';
import ReviewList from '@/components/reviews/ReviewList';
import CompanyCard from '@/components/companies/CompanyCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [updateProfile] = useUpdateUserProfileMutation();
  const [changePassword] = useChangePasswordMutation();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await updateProfile(profileData).unwrap();
      setSuccess('Профиль успешно обновлен');
    } catch (err: any) {
      setError(err.data?.message || 'Ошибка при обновлении профиля');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      await changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      }).unwrap();
      setSuccess('Пароль успешно изменен');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.data?.message || 'Ошибка при изменении пароля');
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Пожалуйста, войдите в систему
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Профиль пользователя
        </Typography>
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            centered
          >
            <Tab label="Основная информация" />
            <Tab label="Избранные автомобили" />
            <Tab label="Мои отзывы" />
            <Tab label="Мои компании" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Редактировать профиль
                  </Typography>
                  {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                  {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                  <Box component="form" onSubmit={handleProfileSubmit}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Имя пользователя"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Телефон"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Сохранить изменения
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Изменить пароль
                  </Typography>
                  <Box component="form" onSubmit={handlePasswordSubmit}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Текущий пароль"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Новый пароль"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Подтвердите новый пароль"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Изменить пароль
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {user.favorite_cars?.map((car) => (
                <Grid item xs={12} sm={6} md={4} key={car.id}>
                  <CarCard car={car} />
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ReviewList reviews={user.reviews || []} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              {user.companies?.map((company) => (
                <Grid item xs={12} sm={6} md={4} key={company.id}>
                  <CompanyCard company={company} />
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 