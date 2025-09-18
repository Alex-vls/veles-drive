import React from 'react';
import {
    Select as MuiSelect,
    MenuItem,
    FormControl,
    SelectProps as MuiSelectProps,
    styled
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import styles from './Select.module.css';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends Omit<MuiSelectProps, 'onChange'> {
    label?: string;
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    error?: boolean;
    helperText?: string;
}

const StyledSelect = styled(MuiSelect)({
    '&.MuiSelect-select': {
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        border: '1px solid transparent',
        fontFamily: '"Martian Grotesk"',
        fontStyle: 'normal',
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '120%',
        color: '#FFFFFF',
        '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        '&.Mui-focused': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
        },
    },
    '& .MuiSelect-icon': {
        color: '#FFFFFF',
    },
    '&.Mui-error': {
        borderColor: '#f44336',
    },
});

const StyledMenuItem = styled(MenuItem)({
    fontFamily: '"Martian Grotesk"',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '120%',
    color: '#FFFFFF',
    padding: '12px 16px',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '&.Mui-selected': {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
    },
});

const Select: React.FC<SelectProps> = ({
                                           label,
                                           options,
                                           value,
                                           onChange,
                                           placeholder = 'Выберите вариант',
                                           error = false,
                                           helperText,
                                           ...props
                                       }) => {
    const handleChange = (event: any) => {
        if (onChange) {
            onChange(event.target.value);
        }
    };

    const selectedOption = options.find(option => option.value === value);

    return (
        <FormControl fullWidth error={error}>
            {label && (
                <label className={styles.label}>
                    {label}
                </label>
            )}

            <StyledSelect
                value={value || ''}
                onChange={handleChange}
                displayEmpty
                IconComponent={ExpandMore}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            marginTop: '4px',
                            '& .MuiMenu-list': {
                                padding: 0,
                            },
                        },
                    },
                }}
                renderValue={(selected) => {
                    if (!selected) {
                        return (
                            <span className={styles.placeholder}>
                                {placeholder}
                            </span>
                        );
                    }
                    return (
                        <span className={styles.selectedItem}>
                            {selectedOption?.label || selected}
                        </span>
                    );
                }}
                {...props}
            >
                {options.map((option) => (
                    <StyledMenuItem
                        key={option.value}
                        value={option.value}
                        className={value === option.value ? styles.menuItemSelected : ''}
                    >
                        {option.label}
                    </StyledMenuItem>
                ))}
            </StyledSelect>

            {helperText && (
                <span style={{
                    fontSize: '12px',
                    color: error ? '#f44336' : 'rgba(255, 255, 255, 0.6)',
                    marginTop: '4px',
                    display: 'block'
                }}>
                    {helperText}
                </span>
            )}
        </FormControl>
    );
};

export default Select;