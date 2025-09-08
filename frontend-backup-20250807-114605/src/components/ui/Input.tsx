import React, { forwardRef, useState } from 'react';
import './Input.css';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onIconClick?: () => void;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  className?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  label,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
  size = 'medium',
  icon,
  iconPosition = 'left',
  onIconClick,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  className = '',
  name,
  id,
  autoComplete,
  maxLength,
  minLength
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleIconClick = () => {
    if (onIconClick) {
      onIconClick();
    }
  };

  const inputClasses = [
    'input',
    `input--${size}`,
    fullWidth ? 'input--full-width' : '',
    disabled ? 'input--disabled' : '',
    error ? 'input--error' : '',
    isFocused ? 'input--focused' : '',
    icon ? `input--with-icon input--icon-${iconPosition}` : '',
    className
  ].filter(Boolean).join(' ');

  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      
      <div className="input__container">
        {icon && iconPosition === 'left' && (
          <span 
            className={`input__icon input__icon--${iconPosition} ${onIconClick ? 'input__icon--clickable' : ''}`}
            onClick={onIconClick ? handleIconClick : undefined}
          >
            {icon}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          name={name}
          value={value !== undefined ? value : inputValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          className={inputClasses}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
        />
        
        {icon && iconPosition === 'right' && (
          <span 
            className={`input__icon input__icon--${iconPosition} ${onIconClick ? 'input__icon--clickable' : ''}`}
            onClick={onIconClick ? handleIconClick : undefined}
          >
            {icon}
          </span>
        )}
      </div>
      
      {error && (
        <div className="input__error">
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 