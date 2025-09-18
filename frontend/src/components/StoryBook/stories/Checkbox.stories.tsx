import Checkbox from '@/components/redesigned//Checkbox';
import { StoryBookStory } from '@/types/storybook';

export const CheckboxStory: StoryBookStory = {
    title: 'Checkbox',
    component: Checkbox,
    variants: [
        {
            name: 'Default Checkbox',
            description: 'Обычный чекбокс',
            props: {
                label: 'Я согласен с условиями',
                checked: false,
                onChange: (checked: boolean) => console.log('Checked:', checked)
            }
        },
        {
            name: 'Checked State',
            description: 'Выбранный чекбокс',
            props: {
                label: 'Подписаться на рассылку',
                checked: true,
                onChange: (checked: boolean) => console.log('Checked:', checked)
            }
        },
        {
            name: 'Disabled Checkbox',
            description: 'Отключенный чекбокс',
            props: {
                label: 'Недоступно',
                disabled: true,
                checked: false
            }
        },
        {
            name: 'Disabled Checked',
            description: 'Отключенный выбранный чекбокс',
            props: {
                label: 'Заблокировано',
                disabled: true,
                checked: true
            }
        }
    ]
};