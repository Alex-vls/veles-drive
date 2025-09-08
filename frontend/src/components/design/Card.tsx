import React from 'react';
import { Card as MuiCard, CardContent, CardMedia, CardActions, styled, CardProps as MuiCardProps } from '@mui/material';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  background: 'var(--color-surface)',
  borderRadius: 'var(--border-radius-lg)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    borderColor: 'var(--color-primary)',
  },
  
  '& .MuiCardContent-root': {
    padding: 'var(--spacing-lg)',
  },
  
  '& .MuiCardMedia-root': {
    height: 200,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  
  '& .MuiCardActions-root': {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    justifyContent: 'space-between',
  },
}));

export interface CardProps extends Omit<MuiCardProps, 'variant'> {
  variant?: 'default' | 'elevated' | 'outlined';
  image?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  price?: string;
  rating?: number;
  actions?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  image,
  title,
  subtitle,
  description,
  price,
  rating,
  actions,
  onClick,
  loading = false,
  children,
  ...props
}) => {
  const renderRating = (rating: number) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < rating ? '#FFD700' : '#666' }}>
            ★
          </span>
        ))}
        <span style={{ marginLeft: '4px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          ({rating})
        </span>
      </div>
    );
  };

  return (
    <StyledCard 
      variant={variant === 'outlined' ? 'outlined' : 'elevation'}
      elevation={variant === 'elevated' ? 4 : 1}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      {image && (
        <CardMedia
          component="img"
          image={image}
          alt={title || 'Card image'}
          style={{ opacity: loading ? 0.6 : 1 }}
        />
      )}
      
      <CardContent>
        {title && (
          <h3 style={{
            fontSize: 'var(--font-size-h2)',
            fontWeight: 'var(--font-weight-h2)',
            color: 'var(--color-text)',
            margin: '0 0 var(--spacing-sm) 0',
            lineHeight: 'var(--line-height-h2)',
          }}>
            {title}
          </h3>
        )}
        
        {subtitle && (
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--spacing-sm) 0',
          }}>
            {subtitle}
          </p>
        )}
        
        {rating && renderRating(rating)}
        
        {description && (
          <p style={{
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text)',
            margin: 'var(--spacing-sm) 0',
            lineHeight: 'var(--line-height-body)',
          }}>
            {description}
          </p>
        )}
        
        {price && (
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--color-primary)',
            marginTop: 'var(--spacing-sm)',
          }}>
            {price}
          </div>
        )}
        
        {children}
      </CardContent>
      
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default Card; 