import {
  CodeBlock,
  HappyAircraft,
  Paper,
  ResearchLaptop,
  Star,
  Trophy,
} from '../assets'

const typeImageMap = {
  development: {
    leftImage: CodeBlock,
    rightImage: HappyAircraft,
  },
  research: {
    leftImage: Paper,
    rightImage: ResearchLaptop,
  },
  competitions: {
    leftImage: Star,
    rightImage: Trophy,
  },
}

export default typeImageMap
