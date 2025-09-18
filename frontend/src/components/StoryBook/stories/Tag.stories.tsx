import Tag from '@/components/redesigned//Tag';
import { StoryBookStory } from '@/types/storybook';

export const TagStory: StoryBookStory = {
    title: 'Tag',
    component: Tag,
    variants: [
        {
            name: 'Default Tag',
            description: 'Обычный тег',
            props: {
                children: 'Технологии',
                onClick: () => console.log('Tag clicked')
            }
        },
        {
            name: 'Active Tag',
            description: 'Активный тег',
            props: {
                children: 'Выбранный',
                active: true,
                onClick: () => console.log('Tag clicked')
            }
        },
        {
            name: 'Disabled Tag',
            description: 'Неактивный тег',
            props: {
                children: 'Недоступно',
                disabled: true
            }
        },
        {
            name: 'With Close Icon',
            description: 'Тег с кнопкой закрытия',
            props: {
                children: 'Удаляемый тег',
                closable: true,
                onClose: () => console.log('Tag closed')
            }
        },
        {
            name: 'Small Tag',
            description: 'Маленький тег',
            props: {
                children: 'Маленький',
                size: 'small',
                onClick: () => console.log('Tag clicked')
            }
        }
    ]
};