import React from 'react';
import styles from './Breadcrumbs.module.css';
import BreadcrumbsArrow from "@/components/redesigned/Breadcrumbs/breadcrumbs-arrow";

export interface BreadcrumbItem {
    label: string;
    href?: string;
    onClick?: () => void;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({items, className}) => {
    const handleClick = (item: BreadcrumbItem, index: number, e: React.MouseEvent) => {
        e.preventDefault();

        if (index === items.length - 1) return;

        if (item.onClick) {
            item.onClick();
        }
    };

    return (
        <nav className={`${styles.container} ${className || ''}`}>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span className={styles.separator}>
                            <BreadcrumbsArrow />
                        </span>
                    )}
                    {index === items.length - 1 ? (
                        <span className={`${styles.breadcrumb} ${styles.breadcrumbActive}`}>
                            {item.label}
                        </span>
                    ) : item.href ? (
                        <a
                            href={item.href}
                            className={styles.breadcrumb}
                            onClick={(e) => handleClick(item, index, e)}
                        >
                            {item.label}
                        </a>
                    ) : (
                        <button
                            className={styles.breadcrumb}
                            onClick={(e) => handleClick(item, index, e)}
                        >
                            {item.label}
                        </button>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;