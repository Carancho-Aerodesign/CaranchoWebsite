import { StyledBanner, StyledImage, StyledContent } from './style'
import { Aircraft } from '@/assets'

const Banner = ({ translate }: { translate: any }) => {
  return (
    <StyledBanner>
      <StyledImage src={Aircraft} alt="Aeronave" />
      <StyledContent>
        <h2>
          <span>Carancho Aerodesign:</span> {translate.title}
        </h2>
        <p>{translate.complement}</p>
      </StyledContent>
    </StyledBanner>
  )
}

export default Banner
