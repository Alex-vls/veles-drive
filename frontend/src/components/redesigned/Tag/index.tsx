import React from 'react';

interface TagProps {
    children: React.ReactNode;
    active?: boolean;
    disabled?: boolean;
    closable?: boolean;
    size?: 'small' | 'medium';
    onClick?: () => void;
    onClose?: () => void;
}

const Tag: React.FC<TagProps> = ({
                                     children,
                                     active = false,
                                     disabled = false,
                                     closable = false,
                                     size = 'medium',
                                     onClick,
                                     onClose
                                 }) => {
    const handleClick = () => {
        if (!disabled && onClick) {
            onClick();
        }
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled && onClose) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: size === 'small' ? '4px 8px' : '6px 12px',
                backgroundColor: active ? '#007bff' : disabled ? '#f8f9fa' : '#e9ecef',
                color: active ? 'white' : disabled ? '#adb5bd' : '#495057',
                borderRadius: '16px',
                fontSize: size === 'small' ? '12px' : '14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: active ? '1px solid #007bff' : `1px solid ${disabled ? '#dee2e6' : '#ced4da'}`,
                opacity: disabled ? 0.6 : 1
            }}
        >
            <span>{children}</span>
            {closable && !disabled && (
                <button
                    onClick={handleClose}
                    style={{
                        border: 'none',
                        background: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '0',
                        margin: '0',
                        lineHeight: '1'
                    }}
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default Tag;