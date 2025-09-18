import React from 'react';
import { ContainerProps } from '@/types/storybook';

interface StoryBookComponentContainerProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    containerProps?: ContainerProps;
    showBorder?: boolean;
}

const StoryBookComponentContainer: React.FC<StoryBookComponentContainerProps> = ({
                                                                                     children,
                                                                                     title,
                                                                                     description,
                                                                                     containerProps = {},
                                                                                     showBorder = true,
                                                                                 }) => {
    const {
        width = '100%',
        height = 'auto',
        padding = '20px',
        backgroundColor = '#ffffff',
        border = '1px solid #e1e5e9',
    } = containerProps;

    const containerStyle: React.CSSProperties = {
        width,
        height,
        padding,
        backgroundColor,
        border: showBorder ? border : 'none',
        borderRadius: '8px',
        marginBottom: '24px',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ marginBottom: '32px' }}>
            {(title || description) && (
                <div style={{ marginBottom: '16px' }}>
                    {title && (
                        <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p style={{ margin: '0', color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                            {description}
                        </p>
                    )}
                </div>
            )}

            <div style={containerStyle}>
                {children}
            </div>
        </div>
    );
};

export default StoryBookComponentContainer;