import React from 'react';
import { Link } from 'react-router-dom';
import SchemaOrg from '../SchemaOrg/SchemaOrg';
import { generateCarSchema } from '../../utils/schemaOrg';
import './CarCard.css';

const CarCard = ({
  id,
  brand,
  model,
  year,
  price,
  mileage,
  engine,
  transmission,
  images,
  company,
  isNew,
  isPromoted,
}) => {
  // Генерируем Schema.org микроразметку для автомобиля
  const carSchema = generateCarSchema({
    id,
    brand,
    model,
    year,
    price,
    mileage,
    engine,
    transmission,
    images,
    company
  });

  return (
    <div className="car-card">
      {/* Schema.org микроразметка */}
      <SchemaOrg schema={carSchema} />
      
      <div className="car-card__image-container">
        <img
          src={images[0]}
          alt={`${brand} ${model}`}
          className="car-card__image"
          loading="lazy"
        />
        {isNew && <span className="car-card__badge car-card__badge--new">Новое</span>}
        {isPromoted && <span className="car-card__badge car-card__badge--promoted">Продвигаемое</span>}
      </div>
      
      <div className="car-card__content">
        <div className="car-card__header">
          <h3 className="car-card__title">
            {brand} {model}
          </h3>
          <span className="car-card__year">{year}</span>
        </div>

        <div className="car-card__price">
          {price.toLocaleString()} ₽
        </div>

        <div className="car-card__specs">
          <div className="car-card__spec">
            <span className="car-card__spec-icon">🛣️</span>
            <span className="car-card__spec-value">{mileage.toLocaleString()} км</span>
          </div>
          <div className="car-card__spec">
            <span className="car-card__spec-icon">⚡</span>
            <span className="car-card__spec-value">{engine}</span>
          </div>
          <div className="car-card__spec">
            <span className="car-card__spec-icon">⚙️</span>
            <span className="car-card__spec-value">{transmission}</span>
          </div>
        </div>

        <div className="car-card__company">
          <img
            src={company.logo}
            alt={company.name}
            className="car-card__company-logo"
            loading="lazy"
          />
          <div className="car-card__company-info">
            <span className="car-card__company-name">{company.name}</span>
            <span className="car-card__company-location">{company.city}</span>
          </div>
        </div>

        <Link to={`/cars/${id}`} className="car-card__button">
          Подробнее
        </Link>
      </div>
    </div>
  );
};

export default CarCard; 