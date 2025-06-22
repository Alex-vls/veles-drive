import React from 'react';
import { Link } from 'react-router-dom';
import './CompanyCard.css';

const CompanyCard = ({ company }) => {
  const {
    id,
    name,
    logo,
    rating,
    isVerified,
    advantages,
    phone,
    reviews,
    city
  } = company;

  return (
    <div className="company-card">
      <div className="company-card__header">
        <img 
          src={logo} 
          alt={name} 
          className="company-card__logo"
          loading="lazy"
        />
        <div className="company-card__info">
          <h3 className="company-card__name">
            {name}
            {isVerified && (
              <span className="company-card__verified" title="Проверенная компания">
                ✓
              </span>
            )}
          </h3>
          <div className="company-card__rating">
            <span className="company-card__stars">
              {'★'.repeat(Math.floor(rating))}
              {'☆'.repeat(5 - Math.floor(rating))}
            </span>
            <span className="company-card__rating-value">{rating.toFixed(1)}</span>
          </div>
          <div className="company-card__location">
            <span className="company-card__city">{city}</span>
          </div>
        </div>
      </div>

      <div className="company-card__advantages">
        {advantages.map((advantage, index) => (
          <div key={index} className="company-card__advantage">
            <span className="company-card__advantage-icon">{advantage.icon}</span>
            <span className="company-card__advantage-text">{advantage.text}</span>
          </div>
        ))}
      </div>

      <div className="company-card__reviews">
        {reviews.slice(0, 2).map((review, index) => (
          <div key={index} className="company-card__review">
            <div className="company-card__review-header">
              <span className="company-card__review-author">{review.author}</span>
              <span className="company-card__review-date">{review.date}</span>
            </div>
            <p className="company-card__review-text">{review.text}</p>
          </div>
        ))}
      </div>

      <div className="company-card__footer">
        <a href={`tel:${phone}`} className="company-card__phone">
          <span className="company-card__phone-icon">📞</span>
          {phone}
        </a>
        <Link to={`/companies/${id}`} className="button button--primary">
          Подробнее
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard; 