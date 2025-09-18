import React from 'react';

interface CarCardProps {
    imageUrl: string;
    title: string;
    description: string;
    tags: string[];
    price: string;
    oldPrice?: string;
    discount?: string;
    compact?: boolean;
}

const CarCard: React.FC<CarCardProps> = ({
                                             imageUrl,
                                             title,
                                             description,
                                             tags,
                                             price,
                                             oldPrice,
                                             discount,
                                             compact = false
                                         }) => {
    return (
        <div style={{
            width: compact ? '280px' : '320px',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
        }}>
            {/* Изображение */}
            <div style={{
                height: compact ? '150px' : '200px',
                background: `url(${imageUrl}) center/cover no-repeat`,
                position: 'relative'
            }}>
                {discount && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {discount}
                    </div>
                )}
            </div>

            {/* Контент */}
            <div style={{ padding: compact ? '12px' : '16px' }}>
                {/* Заголовок и описание */}
                <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: compact ? '16px' : '18px',
                    color: '#333'
                }}>
                    {title}
                </h3>
                <p style={{
                    margin: '0 0 12px 0',
                    fontSize: compact ? '12px' : '14px',
                    color: '#666',
                    lineHeight: '1.4'
                }}>
                    {description}
                </p>

                {/* Теги */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '16px'
                }}>
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            style={{
                                padding: '4px 8px',
                                backgroundColor: '#f8f9fa',
                                color: '#495057',
                                borderRadius: '12px',
                                fontSize: '12px',
                                border: '1px solid #e9ecef'
                            }}
                        >
              {tag}
            </span>
                    ))}
                </div>

                {/* Цена */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
          <span style={{
              fontSize: compact ? '16px' : '18px',
              fontWeight: 'bold',
              color: '#28a745'
          }}>
            {price}
          </span>
                    {oldPrice && (
                        <span style={{
                            fontSize: '14px',
                            color: '#6c757d',
                            textDecoration: 'line-through'
                        }}>
              {oldPrice}
            </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CarCard;