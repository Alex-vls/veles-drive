import Tabs from '@/components/redesigned//Tabs';
import { StoryBookStory } from '@/types/storybook';

export const TabsStory: StoryBookStory = {
    title: 'Tabs',
    component: Tabs,
    variants: [
        {
            name: 'Default Tabs',
            description: 'Обычные табы с 3 вкладками',
            props: {
                tabs: [
                    { id: 'tab1', label: 'Вкладка 1', content: 'Содержимое 1' },
                    { id: 'tab2', label: 'Вкладка 2', content: 'Содержимое 2' },
                    { id: 'tab3', label: 'Вкладка 3', content: 'Содержимое 3' }
                ],
                activeTab: 'tab1',
                onChange: (tabId: string) => console.log('Selected tab:', tabId)
            },
            containerProps: {
                width: '100%',
                maxWidth: '600px'
            }
        },
        {
            name: 'Many Tabs',
            description: 'Табы с большим количеством вкладок',
            props: {
                tabs: [
                    { id: 'tab1', label: 'Профиль', content: 'Профиль пользователя' },
                    { id: 'tab2', label: 'Настройки', content: 'Настройки аккаунта' },
                    { id: 'tab3', label: 'Безопасность', content: 'Настройки безопасности' },
                    { id: 'tab4', label: 'Уведомления', content: 'Настройки уведомлений' },
                    { id: 'tab5', label: 'Внешний вид', content: 'Настройки внешнего вида' }
                ],
                activeTab: 'tab2',
                onChange: (tabId: string) => console.log('Selected tab:', tabId)
            },
            containerProps: {
                width: '100%',
                maxWidth: '800px'
            }
        }
    ]
};