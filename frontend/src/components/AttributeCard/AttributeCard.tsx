import React from 'react';
import './AttributeCard.css';

const AttributeCard = ({
  icon,
  title,
  value,
  description,
  trend,
  isHighlighted,
}) => {
  return (
    <div className={`attribute-card ${isHighlighted ? 'attribute-card--highlighted' : ''}`}>
      <div className="attribute-card__icon">
        {icon}
      </div>
      
      <div className="attribute-card__content">
        <h3 className="attribute-card__title">{title}</h3>
        <div className="attribute-card__value">{value}</div>
        {description && (
          <p className="attribute-card__description">{description}</p>
        )}
        {trend && (
          <div className={`attribute-card__trend attribute-card__trend--${trend.type}`}>
            {trend.value}%
            <span className="attribute-card__trend-icon">
              {trend.type === 'up' ? '↑' : '↓'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeCard; 