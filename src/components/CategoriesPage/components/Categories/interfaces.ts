interface Approach {
  title: string
  description: string
}

interface Category {
  title: string
  competitions: string
  description: string
  approaches?: Approach[]
}

export interface CategoriesDefaultProps {
  translate: Category[]
}

export interface CategoriesProps {
  categories: Category[]
  images: any[]
}
