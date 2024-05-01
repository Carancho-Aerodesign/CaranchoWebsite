export interface CategoriesHeaderProps {
  translate: {
    title: string
    description: string
    categories: string[]
  }
  scrollToSection?: (sectionId: string) => void
}
