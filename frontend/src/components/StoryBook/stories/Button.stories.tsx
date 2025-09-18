import Button from '@/components/redesigned/Button';
import { StoryBookStory } from '@/types/storybook';

export const ButtonStory: StoryBookStory = {
    title: 'Button',
    component: Button,
    variants: [
        {
            name: 'Primary Button',
            description: 'Основная кнопка с заполненным фоном',
            props: {
                children: 'Primary Button',
                variant: 'primary',
                onClick: () => console.log('Clicked!')
            }
        },
        {
            name: 'Secondary Button',
            description: 'Вторичная кнопка с обводкой',
            props: {
                children: 'Secondary Button',
                variant: 'secondary',
                onClick: () => console.log('Clicked!')
            }
        },
        {
            name: 'Disabled Button',
            description: 'Отключенная кнопка',
            props: {
                children: 'Disabled Button',
                variant: 'primary',
                disabled: true,
                onClick: () => console.log('Clicked!')
            }
        },
        {
            name: 'Small Button',
            description: 'Маленькая кнопка',
            props: {
                children: 'Small Button',
                variant: 'primary',
                size: 'small',
                onClick: () => console.log('Clicked!')
            },
            containerProps: {
                width: '200px'
            }
        }
    ]
};