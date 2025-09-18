import Breadcrumbs from '@/components/redesigned/Breadcrumbs';
import { StoryBookStory } from '@/types/storybook';

export const BreadcrumbsStory: StoryBookStory = {
    title: 'Breadcrumbs',
    component: Breadcrumbs,
    variants: [
        {
            name: 'Default Breadcrumbs',
            description: 'Стандартная хлебная крошка с 3 уровнями',
            props: {
                items: [
                    { label: 'Главная', onClick: () => console.log('Главная clicked') },
                    { label: 'Каталог', onClick: () => console.log('Каталог clicked') },
                    { label: 'Автомобили', onClick: () => console.log('Автомобили clicked') }
                ]
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '16px'
            }
        },
        {
            name: 'With Links',
            description: 'Хлебная крошка с HTML ссылками',
            props: {
                items: [
                    { label: 'Главная', href: '/' },
                    { label: 'Блог', href: '/blog' },
                    { label: 'Статьи', href: '/blog/articles' },
                    { label: 'Как выбрать автомобиль' }
                ]
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '16px'
            }
        },
        {
            name: 'Long Breadcrumbs',
            description: 'Длинная хлебная крошка с многими уровнями',
            props: {
                items: [
                    { label: 'Главная', onClick: () => console.log('Главная clicked') },
                    { label: 'Автомобили', onClick: () => console.log('Автомобили clicked') },
                    { label: 'Легковые', onClick: () => console.log('Легковые clicked') },
                    { label: 'Седаны', onClick: () => console.log('Седаны clicked') },
                    { label: 'Toyota', onClick: () => console.log('Toyota clicked') },
                    { label: 'Camry' }
                ]
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '16px'
            }
        },
        {
            name: 'Single Item',
            description: 'Хлебная крошка с одним элементом',
            props: {
                items: [
                    { label: 'Главная' }
                ]
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '16px'
            }
        },
        {
            name: 'With Mixed Actions',
            description: 'Комбинация кликов и ссылок',
            props: {
                items: [
                    { label: 'Главная', href: '/' },
                    { label: 'Каталог', onClick: () => console.log('Каталог clicked') },
                    { label: 'Марки', href: '/brands' },
                    { label: 'Toyota', onClick: () => console.log('Toyota clicked') },
                    { label: 'Camry 2023' }
                ]
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '16px'
            }
        }
    ]
};