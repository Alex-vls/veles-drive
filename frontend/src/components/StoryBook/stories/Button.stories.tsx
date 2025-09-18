import Button from '@/components/redesigned/Button';
import { StoryBookStory } from '@/types/storybook';

// Иконки для демонстрации
const ArrowIcon = () => (
    <span style={{ display: 'flex', alignItems: 'center' }}>→</span>
);

const StarIcon = () => (
    <span style={{ display: 'flex', alignItems: 'center' }}>★</span>
);

export const ButtonStory: StoryBookStory = {
    title: 'Button',
    component: Button,
    variants: [
        {
            name: 'Primary Button',
            description: 'Основная кнопка с синим фоном',
            props: {
                children: 'Primary Button',
                variant: 'primary',
                onClick: () => console.log('Primary button clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Secondary Button',
            description: 'Вторичная кнопка с белой обводкой',
            props: {
                children: 'Secondary Button',
                variant: 'secondary',
                onClick: () => console.log('Secondary button clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Ghost Button',
            description: 'Прозрачная кнопка без фона и обводки',
            props: {
                children: 'Ghost Button',
                variant: 'ghost',
                onClick: () => console.log('Ghost button clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Danger Button',
            description: 'Красная кнопка для опасных действий',
            props: {
                children: 'Danger Button',
                variant: 'danger',
                onClick: () => console.log('Danger button clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Stroke Button',
            description: 'Кнопка с тонкой белой обводкой',
            props: {
                children: 'Stroke Button',
                variant: 'stroke',
                onClick: () => console.log('Stroke button clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Light Button',
            description: 'Темная кнопка на светлом фоне',
            props: {
                children: 'Light Button',
                variant: 'light',
                onClick: () => console.log('Light button clicked')
            },
            containerProps: {
                backgroundColor: '#FFFFFF',
                padding: '20px'
            }
        },
        {
            name: 'Small Button',
            description: 'Маленькая кнопка',
            props: {
                children: 'Small Button',
                size: 'small',
                onClick: () => console.log('Small button clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Large Button',
            description: 'Большая кнопка',
            props: {
                children: 'Large Button',
                size: 'large',
                onClick: () => console.log('Large button clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Disabled Button',
            description: 'Отключенная кнопка',
            props: {
                children: 'Disabled Button',
                disabled: true,
                onClick: () => console.log('This should not be called')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Loading Button',
            description: 'Кнопка в состоянии загрузки',
            props: {
                children: 'Loading Button',
                loading: true,
                onClick: () => console.log('Loading button clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Full Width Button',
            description: 'Кнопка на всю ширину контейнера',
            props: {
                children: 'Full Width Button',
                fullWidth: true,
                onClick: () => console.log('Full width button clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px',
                width: '300px'
            }
        },
        {
            name: 'Button with Left Icon',
            description: 'Кнопка с иконкой слева',
            props: {
                children: 'Button with Icon',
                icon: <StarIcon />,
                iconPosition: 'left',
                onClick: () => console.log('Button with left icon clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        },
        {
            name: 'Button with Right Icon',
            description: 'Кнопка с иконкой справа',
            props: {
                children: 'Button with Icon',
                icon: <ArrowIcon />,
                iconPosition: 'right',
                onClick: () => console.log('Button with right icon clicked')
            },
            containerProps: {
                backgroundColor: '#1A1A1A',
                padding: '20px'
            }
        }
    ]
};