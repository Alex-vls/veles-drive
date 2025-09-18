import React from 'react';

interface NewsCardProps {
    imageUrl: string;
    title: string;
    date?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
                                               imageUrl,
                                               title,
                                               date
                                           }) => {
    return (
        <div style={{
            width: '350px',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
        }}>
            {/* Изображение */}
            <div style={{
                height: '200px',
                background: `url(${imageUrl}) center/cover no-repeat`
            }} />

            {/* Контент */}
            <div style={{ padding: '16px' }}>
                {/* Категория */}
                <h3 style={{
                    margin: '8px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#333',
                    textTransform: 'uppercase',
                    lineHeight: '1.3'
                }}>
                    {title}
                </h3>

                {/* Дата */}
                {date && (
                    <span style={{
                        fontSize: '12px',
                        color: '#999',
                        display: 'block',
                        marginTop: '12px'
                    }}>
            {date}
          </span>
                )}
            </div>
        </div>
    );
};

export default NewsCard;