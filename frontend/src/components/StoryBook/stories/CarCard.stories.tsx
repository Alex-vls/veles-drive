import CarCard from '@/components/redesigned/CarCard';
import { StoryBookStory } from '@/types/storybook';

export const CarCardStory: StoryBookStory = {
    title: 'CarCard',
    component: CarCard,
    variants: [
        {
            name: 'Default Car Card',
            description: 'Карточка автомобиля с основными данными',
            props: {
                imageUrl: 'https://via.placeholder.com/300x200?text=Car+Image',
                title: 'Toyota Camry 2023',
                description: 'Комфортный седан для города и трассы',
                tags: ['Седан', 'Бензин', 'Автомат'],
                price: '2 450 000 ₽'
            },
            containerProps: {
                width: '320px'
            }
        },
        {
            name: 'Car Card with Discount',
            description: 'Карточка со скидкой',
            props: {
                imageUrl: 'https://via.placeholder.com/300x200?text=Car+Sale',
                title: 'Honda Civic 2022',
                description: 'Спортивный седан с экономичным двигателем',
                tags: ['Седан', 'Гибрид', 'Передний привод'],
                price: '1 890 000 ₽',
                oldPrice: '2 100 000 ₽',
                discount: '10%'
            },
            containerProps: {
                width: '320px'
            }
        },
        {
            name: 'Compact Car Card',
            description: 'Компактная карточка автомобиля',
            props: {
                imageUrl: 'https://via.placeholder.com/250x150?text=Compact+Car',
                title: 'Kia Rio',
                description: 'Экономичный городской автомобиль',
                tags: ['Хэтчбек'],
                price: '1 200 000 ₽',
                compact: true
            },
            containerProps: {
                width: '280px'
            }
        }
    ]
};