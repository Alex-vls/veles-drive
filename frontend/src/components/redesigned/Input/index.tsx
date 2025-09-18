import React from 'react';

interface InputProps {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({ value, placeholder, disabled, label, error, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {label && <label style={{ fontSize: '14px', fontWeight: '500' }}>{label}</label>}
            <input
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                onChange={onChange}
                style={{
                    padding: '8px 12px',
                    border: error ? '1px solid #dc3545' : '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                }}
            />
            {error && <span style={{ color: '#dc3545', fontSize: '12px' }}>{error}</span>}
        </div>
    );
};

export default Input;