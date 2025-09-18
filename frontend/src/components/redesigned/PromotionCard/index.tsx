import React from 'react';
import styles from './PromotionCard.module.css';
import Button from "@/components/redesigned/Button";

interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large';
}

interface PromotionCardProps {
    title: string;
    description: string;
    button: ButtonProps;
    className?: string;
}

const PromotionCard: React.FC<PromotionCardProps> = ({
                                                         title,
                                                         description,
                                                         button,
                                                         className
                                                     }) => {
    return (
        <div className={`${styles.container} ${className || ''}`}>
            <div className={styles.content}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.description}>{description}</p>
            </div>
            <Button
                onClick={button.onClick}
                variant={button.variant}
                size={button.size}
            >
                {button.label}
            </Button>
        </div>
    );
};

export default PromotionCard;