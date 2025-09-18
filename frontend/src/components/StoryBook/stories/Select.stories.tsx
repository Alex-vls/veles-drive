import Select from '@/components/redesigned/Select';
import { StoryBookStory } from '@/types/storybook';

const options = [
    { value: 'option1', label: 'Вариант 1' },
    { value: 'option2', label: 'Вариант 2' },
    { value: 'option3', label: 'Вариант 3' },
    { value: 'option4', label: 'Вариант 4' },
    { value: 'option5', label: 'Вариант 5' },
];

export const SelectStory: StoryBookStory = {
    title: 'Select',
    component: Select,
    variants: [
        {
            name: 'Default Select',
            description: 'Обычный селект с плейсхолдером',
            props: {
                options,
                placeholder: 'Выберите вариант',
                onChange: (value: string) => console.log('Selected:', value)
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '20px',
                width: '300px'
            }
        },
        {
            name: 'With Label',
            description: 'Селект с меткой',
            props: {
                label: 'Выбор варианта',
                options,
                placeholder: 'Выберите из списка',
                onChange: (value: string) => console.log('Selected:', value)
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '20px',
                width: '300px'
            }
        },
        {
            name: 'With Selected Value',
            description: 'Селект с выбранным значением',
            props: {
                label: 'Выбор варианта',
                options,
                value: 'option2',
                onChange: (value: string) => console.log('Selected:', value)
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '20px',
                width: '300px'
            }
        },
        {
            name: 'Error State',
            description: 'Селект в состоянии ошибки',
            props: {
                label: 'Выбор варианта',
                options,
                error: true,
                helperText: 'Обязательное поле',
                onChange: (value: string) => console.log('Selected:', value)
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '20px',
                width: '300px'
            }
        },
        {
            name: 'Disabled Select',
            description: 'Отключенный селект',
            props: {
                label: 'Выбор варианта',
                options,
                disabled: true,
                placeholder: 'Недоступно',
                onChange: (value: string) => console.log('Selected:', value)
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '20px',
                width: '300px'
            }
        },
        {
            name: 'Many Options',
            description: 'Селект с большим количеством опций',
            props: {
                label: 'Выбор города',
                options: [
                    { value: 'moscow', label: 'Москва' },
                    { value: 'spb', label: 'Санкт-Петербург' },
                    { value: 'ekb', label: 'Екатеринбург' },
                    { value: 'nsk', label: 'Новосибирск' },
                    { value: 'kzn', label: 'Казань' },
                    { value: 'nn', label: 'Нижний Новгород' },
                    { value: 'smr', label: 'Самара' },
                    { value: 'krd', label: 'Краснодар' },
                ],
                placeholder: 'Выберите город',
                onChange: (value: string) => console.log('Selected:', value)
            },
            containerProps: {
                backgroundColor: '#1a1a1a',
                padding: '20px',
                width: '300px'
            }
        }
    ]
};