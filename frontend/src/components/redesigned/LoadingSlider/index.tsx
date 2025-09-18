import React from 'react';
import styles from './LoadingSlider.module.css';

interface LoadingSliderProps {
    fill: number;
    className?: string;
}

const LoadingSlider: React.FC<LoadingSliderProps> = ({ fill, className }) => {
    const normalizedFill = Math.max(0, Math.min(100, fill));

    const getBarFill = (barIndex: number): number => {
        const barStart = barIndex * 25;
        const barEnd = (barIndex + 1) * 25;

        if (normalizedFill <= barStart) {
            return 0;
        } else if (normalizedFill >= barEnd) {
            return 100;
        } else {
            return ((normalizedFill - barStart) / 25) * 100;
        }
    };

    return (
        <div className={`${styles.container} ${className || ''}`}>
            {[0, 1, 2, 3].map((barIndex) => (
                <div key={barIndex} className={styles.bar}>
                    <div
                        className={styles.filled}
                        style={{ width: `${getBarFill(barIndex)}%` }}
                    />
                </div>
            ))}
        </div>
    );
};

export default LoadingSlider;