import LoadingSlider from '@/components/redesigned/LoadingSlider';
import { StoryBookStory } from '@/types/storybook';

export const LoadingSliderStory: StoryBookStory = {
    title: 'LoadingSlider',
    component: LoadingSlider,
    variants: [
        {
            name: 'Empty (0%)',
            description: 'Ползунок полностью пустой',
            props: {
                fill: 0
            },
            containerProps: {
                width: '300px',
                padding: '20px',
                backgroundColor: '#fff'
            }
        },
        {
            name: 'First Bar (15%)',
            description: 'Заполнена первая полоска на 15%',
            props: {
                fill: 15
            },
            containerProps: {
                width: '300px',
                padding: '20px',
                backgroundColor: '#fff'
            }
        },
        {
            name: 'First Bar Full (25%)',
            description: 'Первая полоска полностью заполнена',
            props: {
                fill: 25
            },
            containerProps: {
                width: '300px',
                padding: '20px',
                backgroundColor: '#fff'
            }
        },
        {
            name: 'Second Bar (35%)',
            description: 'Заполнена вторая полоска на 10%',
            props: {
                fill: 35
            },
            containerProps: {
                width: '300px',
                padding: '20px',
                backgroundColor: '#fff'
            }
        },
        {
            name: 'Half (50%)',
            description: 'Заполнены две полоски полностью',
            props: {
                fill: 50
            },
            containerProps: {
                width: '300px',
                padding: '20px',
                backgroundColor: '#fff'
            }
        },
        {
            name: 'Third Bar (65%)',
            description: 'Заполнена третья полоска на 15%',
            props: {
                fill: 65
            },
            containerProps: {
                width: '300px',
                padding: '20px',
                backgroundColor: '#fff'
            }
        },
        {
            name: 'Three Quarters (75%)',
            description: 'Заполнены три полоски полностью',
            props: {
                fill: 75
            },
            containerProps: {
                width: '300px',
                padding: '20px',
                backgroundColor: '#fff'
            }
        },
        {
            name: 'Fourth Bar (85%)',
            description: 'Заполнена четвертая полоска на 10%',
            props: {
                fill: 85
            },
            containerProps: {
                width: '300px',
                padding: '20px',
                backgroundColor: '#fff'
            }
        },
        {
            name: 'Full (100%)',
            description: 'Все полоски полностью заполнены',
            props: {
                fill: 100
            },
            containerProps: {
                width: '300px',
                padding: '20px',
                backgroundColor: '#fff'
            }
        },
    ]
};