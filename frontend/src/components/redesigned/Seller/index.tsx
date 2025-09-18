import React from 'react';

interface SellerProps {
    avatarUrl: string;
    name: string;
}

const Seller: React.FC<SellerProps> = ({
                                           avatarUrl,
                                           name,
                                       }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px'
        }}>
            {/* Аватар */}
            <div style={{ position: 'relative' }}>
                <img
                    src={avatarUrl}
                    alt={name}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                    }}
                />
            </div>

            {/* Информация */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333'
                  }}>
                    {name}
                  </span>
                </div>

            </div>
        </div>
    );
};

export default Seller;