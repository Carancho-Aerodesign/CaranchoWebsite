interface Approach {
    title: string
    description: string
  }
  
  export interface CategoryDefaultProps {
    title: string
    image: any
    competitions: string
    description: string
    approaches?: Approach[]
    tables?: any[]
  }