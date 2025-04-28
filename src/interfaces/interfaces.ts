export interface Board {
    id?: string; 
    name: string;
    description: string;
    created_at: string; 
    boardList:BoardList[]
}

export interface BoardList{
    id?:string;
    title:string;
    items:ListItem[],
    created_at: string;
    order?:number;
}

export interface ListItem{
    id?:string;
    title:string;
    description?:string,
    created_at: string
    updated_at?: string
}
