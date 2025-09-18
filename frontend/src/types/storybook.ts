export interface StoryBookStory {
    title: string;
    component: React.ComponentType<any>;
    variants: StoryBookVariant[];
}

export interface StoryBookVariant {
    name: string;
    props?: Record<string, any>;
    description?: string;
    containerProps?: ContainerProps;
}

export interface ContainerProps {
    width?: string | number;
    height?: string | number;
    padding?: string;
    backgroundColor?: string;
    border?: string;
    maxWidth?: string | number;
}