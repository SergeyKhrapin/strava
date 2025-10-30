import { type Dispatch, type FC } from "react"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { STRAVA_UI_URL } from "src/constants"
import { type IMediaSlide } from "@components/Media"
import { getDevice } from '@utils/getDevice'
import ReactLightbox from "yet-another-react-lightbox"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Slideshow from "yet-another-react-lightbox/plugins/slideshow"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Video from "yet-another-react-lightbox/plugins/video"
import Counter from "yet-another-react-lightbox/plugins/counter"
import "yet-another-react-lightbox/plugins/thumbnails.css"
import "yet-another-react-lightbox/plugins/counter.css"
import "yet-another-react-lightbox/styles.css"

interface ILightbox {
  slides: IMediaSlide[]
  index: number
  setIndex: Dispatch<React.SetStateAction<number>>
}

export const Lightbox: FC<ILightbox> = ({ slides, index, setIndex }) => {
  const { isMobile } = getDevice()
  const plugins = [Video, Fullscreen, Slideshow, Zoom, Counter]

  if (!isMobile) {
    plugins.push(Thumbnails)
  }

  return (
    <ReactLightbox
      slides={slides}
      carousel={{
        finite: true
      }}
      open={index >= 0}
      index={index}
      close={() => setIndex(-1)}
      plugins={plugins}
      thumbnails={{
        hidden: true,
        showToggle: true,
      }}
      render={{
        ...(isMobile && {
          iconZoomIn: () => null,
          iconZoomOut: () => null,
          iconPrev: () => null,
          iconNext: () => null,
        }),
        // TODO: pass slideFooter as a prop because Lightbox is supposed to be a common component
        slideFooter: (props) => {
          const slide = props.slide as IMediaSlide
          
          return (
            <Typography sx={{
              position: 'absolute',
              bottom: '10px',
              color: '#fff'
            }}>
              <Link
                href={`${STRAVA_UI_URL}/activities/${slide.activityId}`}
                sx={{
                  opacity: 0.8,
                  '&:hover': {
                    color: '#fff',
                    opacity: 1
                  }
                }}
                color="inherit"
                underline="none"
                target="_blank"
                rel="noreferrer"
                >
                {`${slide.activityName} ${slide.activityDate}`}
              </Link>
            </Typography>
          )
        }
      }}
      animation={{
        swipe: 300
      }}
      controller={{
        closeOnBackdropClick: true
      }}
    />
  )
}
