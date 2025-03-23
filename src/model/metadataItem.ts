export interface MetadataItem {
    id: string;
    name: string;
    type: string;
    file?: string;
    parent?: MetadataItem;
    children?: MetadataItem[];
} 