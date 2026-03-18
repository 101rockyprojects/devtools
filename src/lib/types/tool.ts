export interface Tool {
    id: string;
    name: string;
    description: string;
    details: string;
    category: string;
    tags: string[];
    url: string;
    coverImage: string;
    addedAt: string;
}

export type ToolFormData = Omit<Tool, 'id' | 'addedAt'>;
