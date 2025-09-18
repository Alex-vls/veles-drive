import React from 'react';
import Input from '@/components/redesigned//Input';
import { StoryBookStory } from '@/types/storybook';

export const InputStory: StoryBookStory = {
    title: 'Input',
    component: Input,
    variants: [
        {
            name: 'Default Input',
            description: 'Обычное текстовое поле',
            props: {
                placeholder: 'Введите текст...',
                value: '',
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => console.log(e.target.value)
            }
        },
        {
            name: 'Disabled Input',
            description: 'Отключенное поле ввода',
            props: {
                placeholder: 'Отключено',
                disabled: true,
                value: ''
            }
        },
        {
            name: 'With Label',
            description: 'Поле с меткой',
            props: {
                label: 'Имя пользователя',
                placeholder: 'Введите ваше имя',
                value: ''
            }
        },
        {
            name: 'With Error',
            description: 'Поле с ошибкой',
            props: {
                label: 'Email',
                placeholder: 'email@example.com',
                error: 'Неверный формат email',
                value: 'wrong-email'
            }
        }
    ]
};