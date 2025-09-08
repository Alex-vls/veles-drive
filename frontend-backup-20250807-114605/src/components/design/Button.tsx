import React from 'react';
import { Button as MuiButton, styled, ButtonProps as MuiButtonProps } from '@mui/material';

// Стилизованный компонент на основе дизайна
const StyledButton = styled(MuiButton)(({ theme, variant }) => ({
  // Базовые стили
  borderRadius: 'var(--border-radius-lg)',
  padding: 'var(--spacing-md) var(--spacing-lg)',
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-h2)',
  textTransform: 'none',
  transition: 'all 0.2s ease-in-out',
  minHeight: '48px',
  
  // Primary вариант
  '&.MuiButton-contained': {
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
    color: 'var(--color-text)',
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
    border: 'none',
    
    '&:hover': {
      background: 'linear-gradient(135deg, #0056CC 0%, #4A47B8 100%)',
      boxShadow: '0 6px 16px rgba(0, 122, 255, 0.4)',
      transform: 'translateY(-1px)',
    },
    
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
    },
    
    '&:disabled': {
      background: 'var(--color-text-secondary)',
      color: 'var(--color-surface)',
      boxShadow: 'none',
    },
  },
  
  // Secondary вариант
  '&.MuiButton-outlined': {
    border: '2px solid var(--color-primary)',
    color: 'var(--color-primary)',
    background: 'transparent',
    
    '&:hover': {
      background: 'var(--color-primary)',
      color: 'var(--color-text)',
      borderColor: 'var(--color-primary)',
      transform: 'translateY(-1px)',
    },
    
    '&:active': {
      transform: 'translateY(0)',
    },
    
    '&:disabled': {
      borderColor: 'var(--color-text-secondary)',
      color: 'var(--color-text-secondary)',
    },
  },
  
  // Text вариант
  '&.MuiButton-text': {
    color: 'var(--color-primary)',
    background: 'transparent',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    
    '&:hover': {
      background: 'rgba(0, 122, 255, 0.1)',
      transform: 'translateY(-1px)',
    },
    
    '&:active': {
      transform: 'translateY(0)',
    },
    
    '&:disabled': {
      color: 'var(--color-text-secondary)',
    },
  },
  
  // Размеры
  '&.MuiButton-sizeSmall': {
    padding: 'var(--spacing-sm) var(--spacing-md)',
    fontSize: '14px',
    minHeight: '36px',
  },
  
  '&.MuiButton-sizeLarge': {
    padding: 'var(--spacing-lg) var(--spacing-xl)',
    fontSize: '18px',
    minHeight: '56px',
  },
  
  // Полная ширина
  '&.MuiButton-fullWidth': {
    width: '100%',
  },
}));

// Расширенные пропсы для нашего компонента
export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  ...props
}) => {
  // Преобразование наших вариантов в Material-UI варианты
  const muiVariant = variant === 'ghost' ? 'text' : 
                    variant === 'secondary' ? 'outlined' : 'contained';
  
  // Преобразование размеров
  const muiSize = size === 'small' ? 'small' : 
                  size === 'large' ? 'large' : 'medium';
  
  return (
    <StyledButton
      variant={muiVariant}
      size={muiSize}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          Загрузка...
        </div>
      ) : (
        children
      )}
    </StyledButton>
  );
};

// CSS анимация для спиннера
const spinKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

export default Button; 