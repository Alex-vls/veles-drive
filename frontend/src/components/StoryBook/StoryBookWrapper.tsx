import React, { useState } from 'react';
import StoryBookComponentContainer from './StoryBookContainer';
import { StoryBookStory } from '@/types/storybook';

interface StoryBookPageProps {
    stories: StoryBookStory[];
    title?: string;
    description?: string;
}

const StoryBookWrapper: React.FC<StoryBookPageProps> = ({
                                                         stories,
                                                         title = 'Component Library',
                                                         description = 'Демонстрация компонентов',
                                                     }) => {
    const [selectedStory, setSelectedStory] = useState(0);
    const currentStory = stories[selectedStory];
    const Component = currentStory.component;

    return (
        <div style={{
            padding: '24px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh',
            marginTop: '64px'
        }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#333' }}>{title}</h1>
                <p style={{ margin: '0', color: '#666' }}>{description}</p>
            </header>

            <div style={{ display: 'flex', gap: '32px' }}>
                {/* Навигация */}
                <nav style={{
                    width: '250px',
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Компоненты</h3>
                    <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                        {stories.map((story, index) => (
                            <li key={story.title} style={{ marginBottom: '8px' }}>
                                <button
                                    onClick={() => setSelectedStory(index)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 12px',
                                        border: 'none',
                                        backgroundColor: selectedStory === index ? '#007bff' : 'transparent',
                                        color: selectedStory === index ? 'white' : '#333',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    {story.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Контент */}
                <main style={{ flex: 1 }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ margin: '0 0 24px 0', color: '#333' }}>
                            {currentStory.title}
                        </h2>

                        {currentStory.variants.map((variant, index) => (
                            <StoryBookComponentContainer
                                key={index}
                                title={variant.name}
                                description={variant.description}
                                containerProps={variant.containerProps}
                            >
                                <Component {...variant.props} />
                            </StoryBookComponentContainer>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StoryBookWrapper;