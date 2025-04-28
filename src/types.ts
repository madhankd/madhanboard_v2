//interface for card to define the data type
export interface card{
    id:number
    title:string
    description:string  
  }

  //interface for each column
export interface List{
    id:number,
    title:string,
    cards:card[]
  }