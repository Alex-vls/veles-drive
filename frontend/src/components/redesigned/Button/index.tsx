import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'stroke' | 'light';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           size = 'medium',
                                           disabled = false,
                                           loading = false,
                                           fullWidth = false,
                                           icon,
                                           iconPosition = 'left',
                                           onClick,
                                           type = 'button',
                                           className = ''
                                       }) => {
    const handleClick = () => {
        if (!disabled && !loading && onClick) {
            onClick();
        }
    };

    const buttonClasses = [
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        disabled ? styles['button--disabled'] : '',
        loading ? styles['button--loading'] : '',
        fullWidth ? styles['button--fullWidth'] : '',
        className
    ].filter(Boolean).join(' ');

    const iconClasses = [
        styles.button__icon,
        iconPosition === 'left' ? styles['button__icon--left'] : styles['button__icon--right']
    ].join(' ');

    return (
        <button
            className={buttonClasses}
            onClick={handleClick}
            disabled={disabled || loading}
            type={type}
        >
            {loading && (
                <span className={styles.button__loader}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
            />
          </svg>
        </span>
            )}

            {!loading && icon && iconPosition === 'left' && (
                <span className={iconClasses}>
          {icon}
        </span>
            )}

            <span className={styles.button__content}>
        {children}
      </span>

            {!loading && icon && iconPosition === 'right' && (
                <span className={iconClasses}>
          {icon}
        </span>
            )}
        </button>
    );
};

export default Button;