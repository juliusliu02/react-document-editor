export interface FileType {
    id: number
    title: string
    isEditing: boolean
    url: string
    content: string
}

export interface FolderType {
    id: number
    title: string
    isEditing: boolean
    items: FileType[]
}