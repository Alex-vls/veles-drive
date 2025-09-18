import React from 'react';
import StoryBookPage from '@/components/StoryBook/StoryBookWrapper';
import { ButtonStory } from '@/components/StoryBook/stories/Button.stories';
import {CheckboxStory} from "@/components/StoryBook/stories/Checkbox.stories";
import {TabsStory} from "@/components/StoryBook/stories/Tabs.stories";
import {TagStory} from "@/components/StoryBook/stories/Tag.stories";
import {CarCardStory} from "@/components/StoryBook/stories/CarCard.stories";
import {NewsCardStory} from "@/components/StoryBook/stories/NewsCard.stories";
import {SellerStory} from "@/components/StoryBook/stories/Seller.stories";
import {BreadcrumbsStory} from "@/components/StoryBook/stories/Breadcrumbs.stories";

const StoryBookRedesignedComponents: React.FC = () => {
    const stories = [
        ButtonStory,
        CheckboxStory,
        TabsStory,
        TagStory,
        CarCardStory,
        NewsCardStory,
        SellerStory,
        BreadcrumbsStory
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