import React from 'react';

interface CheckboxProps {
    label?: string;
    checked?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked = false, disabled = false, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled && onChange) {
            onChange(e.target.checked);
        }
    };

    return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={handleChange}
                style={{
                    width: '16px',
                    height: '16px',
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }}
            />
            {label && (
                <span style={{
                    fontSize: '14px',
                    color: disabled ? '#999' : '#333',
                    opacity: disabled ? 0.6 : 1
                }}>
          {label}
        </span>
            )}
        </label>
    );
};

export default Checkbox;