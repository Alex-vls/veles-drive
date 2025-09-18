import React from 'react';
import StoryBookPage from '@/components/StoryBook/StoryBookWrapper';
import { ButtonStory } from '@/components/StoryBook/stories/Button.stories';

const StoryBookRedesignedComponents: React.FC = () => {
    const stories = [
        ButtonStory,
    ];

    return (
        <StoryBookPage
            stories={stories}
            title="UI Component Library"
            description="Демонстрация всех компонентов системы"
        />
    );
};

export default StoryBookRedesignedComponents;