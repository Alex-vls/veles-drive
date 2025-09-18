import NewsCard from '@/components/redesigned//NewsCard';
import { StoryBookStory } from '@/types/storybook';

export const NewsCardStory: StoryBookStory = {
    title: 'NewsCard',
    component: NewsCard,
    variants: [
        {
            name: 'Default News Card',
            description: 'Карточка новости с заголовком',
            props: {
                imageUrl: 'https://via.placeholder.com/350x200?text=News+Image',
                title: 'НОВЫЕ ТЕХНОЛОГИИ В АВТОМОБИЛЕСТРОЕНИИ',
                date: '15 декабря 2023'
            },
            containerProps: {
                width: '350px'
            }
        },
        {
            name: 'News Card with Category',
            description: 'Карточка новости с категорией',
            props: {
                imageUrl: 'https://via.placeholder.com/350x200?text=Tech+News',
                title: 'ЭЛЕКТРОМОБИЛИ БУДУЩЕГО',
                category: 'Технологии',
                date: '10 декабря 2023'
            },
            containerProps: {
                width: '350px'
            }
        },
        {
            name: 'News Card with Description',
            description: 'Карточка новости с кратким описанием',
            props: {
                imageUrl: 'https://via.placeholder.com/350x200?text=Business+News',
                title: 'РОСТ РЫНКА АВТОМОБИЛЕЙ В 2024 ГОДУ',
                description: 'Аналитики прогнозируют рост продаж на 15% по сравнению с предыдущим годом',
                date: '5 декабря 2023'
            },
            containerProps: {
                width: '350px'
            }
        }
    ]
};