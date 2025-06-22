import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Car } from './types';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Механическая' },
  { value: 'automatic', label: 'Автоматическая' },
  { value: 'robot', label: 'Робот' },
  { value: 'variator', label: 'Вариатор' },
];

const FUEL_TYPE_OPTIONS = [
  { value: 'petrol', label: 'Бензин' },
  { value: 'diesel', label: 'Дизель' },
  { value: 'gas', label: 'Газ' },
  { value: 'hybrid', label: 'Гибрид' },
  { value: 'electric', label: 'Электро' },
];

interface Props {
  initialData?: Car;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

const CarForm: React.FC<Props> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    mileage: initialData?.mileage || 0,
    transmission: initialData?.transmission || '',
    fuel_type: initialData?.fuel_type || '',
    engine_volume: initialData?.engine_volume || 0,
    power: initialData?.power || 0,
    color: initialData?.color || '',
    price: initialData?.price || 0,
    description: initialData?.description || '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    initialData?.images?.map(img => img.image) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Очистка URL превью при размонтировании компонента
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    setImages(prev => [...prev, ...newImages]);

    // Создаем превью для новых изображений
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();

      // Добавляем все поля формы
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      // Добавляем изображения
      images.forEach((image, index) => {
        data.append(`images`, image);
      });

      await onSubmit(data);
    } catch (err) {
      setError('Ошибка при сохранении автомобиля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Марка"
              value={formData.brand}
              onChange={handleChange('brand')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Модель"
              value={formData.model}
              onChange={handleChange('model')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Год выпуска"
              value={formData.year}
              onChange={handleChange('year')}
              inputProps={{ min: 1900, max: new Date().getFullYear() }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Пробег (км)"
              value={formData.mileage}
              onChange={handleChange('mileage')}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Коробка передач</InputLabel>
              <Select
                value={formData.transmission}
                label="Коробка передач"
                onChange={handleChange('transmission')}
              >
                {TRANSMISSION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Тип топлива</InputLabel>
              <Select
                value={formData.fuel_type}
                label="Тип топлива"
                onChange={handleChange('fuel_type')}
              >
                {FUEL_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Объем двигателя (л)"
              value={formData.engine_volume}
              onChange={handleChange('engine_volume')}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Мощность (л.с.)"
              value={formData.power}
              onChange={handleChange('power')}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Цвет"
              value={formData.color}
              onChange={handleChange('color')}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Цена (₽)"
              value={formData.price}
              onChange={handleChange('price')}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Описание"
              value={formData.description}
              onChange={handleChange('description')}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Фотографии
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {previewUrls.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                  }}
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 4,
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                    }}
                    onClick={() => removeImage(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                component="label"
                variant="outlined"
                startIcon={<AddPhotoAlternateIcon />}
                sx={{
                  width: 150,
                  height: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                Добавить фото
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default CarForm; 