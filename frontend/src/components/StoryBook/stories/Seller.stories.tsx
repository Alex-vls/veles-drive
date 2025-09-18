import Seller from '@/components/redesigned//Seller';
import { StoryBookStory } from '@/types/storybook';

export const SellerStory: StoryBookStory = {
    title: 'Seller',
    component: Seller,
    variants: [
        {
            name: 'Default Seller',
            description: 'Продавец с аватаркой и именем',
            props: {
                avatarUrl: 'https://via.placeholder.com/32x32?text=AV',
                name: 'Александр Иванов',
            }
        },
    ]
};