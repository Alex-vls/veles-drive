import PromotionCard from '@/components/redesigned/PromotionCard';
import { StoryBookStory } from '@/types/storybook';

export const PromotionCardStory: StoryBookStory = {
    title: 'PromotionCard',
    component: PromotionCard,
    variants: [
        {
            name: 'Default Promotion Card',
            description: 'Стандартная карточка промо-акции',
            props: {
                title: 'Больше предложений в нашем разделе',
                description: 'Ознакомьтесь со всеми предложениями, которые мы подобрали для вас',
                button: {
                    label: 'Перейти в раздел',
                    onClick: () => console.log('Promotion button clicked'),
                    variant: 'primary'
                }
            },
            containerProps: {
                maxWidth: '670px',
            }
        }
    ]
};