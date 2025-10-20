import { useState, useContext, useEffect } from "react"
import { STRAVA_API_URL, STRAVA_UI_URL } from '../constants'
import { showPhotosLabel, showMorePhotosLabel } from '@components/constants'
import { DatePicker } from "@common/DatePicker"
import { Context } from "src/App"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Link from "@mui/material/Link"
import Stack from "@mui/material/Stack"
import { RowsPhotoAlbum, type Photo } from "react-photo-album"
import "react-photo-album/rows.css"
import Lightbox, { type Slide } from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Slideshow from "yet-another-react-lightbox/plugins/slideshow"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Video from "yet-another-react-lightbox/plugins/video"
import "yet-another-react-lightbox/plugins/thumbnails.css"
import { type Dayjs } from "dayjs"

const imageSize = 5000

interface IMediaItemExtraData {
  activityId: number
  activityName: string
  activityDate: string
}

type IMediaSlide = IMediaItemExtraData & Slide

export const Media = () => {
  const authToken = useContext(Context)
  const [activities, setActivities] = useState([])
  const [media, setMedia] = useState<IMediaSlide[]>([])
  const [page, setPage] = useState(1)
  const [index, setIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
  const [dateTo, setDateTo] = useState<Dayjs | null>(null)

  // console.log('dateFrom', dateFrom);
  // console.log('dateTo', dateTo);
  

  const activitiesUrl = `${STRAVA_API_URL}/athlete/activities?page=${page}&per_page=30`  

  const fetchActivities = () => {
    if (authToken) {
      setIsLoading(true)

      fetch(activitiesUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      .then((data) => data.json())
      .then((res) => {
        if (res.errors?.length) {
          throw new Error(res.message)
        }
        setActivities(res)
        setPage(prev => ++prev)
      })
    }
  }

  useEffect(() => {
    if (authToken) {
      const slides: typeof media = []

      async function getActivitiesMedia() {
        for (const a of activities as any[]) {
          if (a.total_photo_count > 0) {
            const activityUrlData = {
              activityId: a.id,
              activityName: a.name,
              activityDate: new Date(a.start_date_local.split('T')).toLocaleDateString()
            }
            try {
              const res = await fetch(`${STRAVA_API_URL}/activities/${a.id}/photos?size=${imageSize}`, {
                headers: {
                  Authorization: `Bearer ${authToken}`
                }
              })
              
              const data = await res.json()
              data?.map((item: any) => {
                if (item.video_url) {
                  slides.push({
                    type: 'video',
                    sources: [{
                      src: item.video_url,
                      type: ''
                    }],
                    src: item.urls[imageSize], // RowsPhotoAlbum and Lightbox types contradict each others
                    poster: item.urls[imageSize],
                    width: item.sizes[imageSize][0],
                    height: item.sizes[imageSize][1],
                    ...activityUrlData
                  } as IMediaSlide)
                } else {
                  slides.push({
                    src: item.urls[imageSize],
                    width: item.sizes[imageSize][0],
                    height: item.sizes[imageSize][1],
                    ...activityUrlData
                  })
                }
              })
            } catch(e) {
              Array.from({ length: a.total_photo_count }).map((_, i) => {
                console.error(`Failed to fetch image for ${a.name}`)
                slides.push({
                  src: `https://placehold.jp/9a9a9e/ffffff/150x150.png?text=Failed%20to%20load%20this%20image&key=${i}`,
                  width: 150,
                  height: 150,
                  ...activityUrlData
              })})
            }
          }
        }

        setMedia((prev) => prev.concat(slides))
        setIsLoading(false)
      }

      getActivitiesMedia()

      // Option 2
      //  Promise.all(activities.map((a: any) => {
      //   // TODO: doesn't work with videos
      //   // TODO: double check - if it really works for photos
      //   if (a.total_photo_count > 0) {
      //     return fetch(`${STRAVA_API_URL}/activities/${a.id}/photos?size=${imageSize}`, {
      //       headers: {
      //         Authorization: `Bearer ${authToken}`
      //       }
      //     })
      //       .then((data) => data.json())
      //       .then((res) => {
      //         return res.map((item: any) => ({
      //             src: item.urls[imageSize],
      //             width: item.sizes[imageSize][0],
      //             height: item.sizes[imageSize][1],
      //             activityId: a.id
      //         }))
      //       })            
      //     }
      //     return []
      // })).then((res) => {
      //   setMedia(res.flat())
      // })
    }
  }, [activities, authToken])

  console.log('media', media);

  return (
    <Box>
      {!media.length ? (
        <Stack rowGap={2.5}>
          <Button onClick={fetchActivities} loading={isLoading} variant="contained">{showPhotosLabel}</Button>
          <Stack direction="row" columnGap={2}>
            <DatePicker
              value={dateFrom}
              setValue={setDateFrom}
              label="From"
              disableFuture
              />
            <DatePicker
              value={dateTo}
              setValue={setDateTo}
              label="To"
              disableFuture
            />
          </Stack>
        </Stack>
      ) : null}
      {media.length ? (
        <>
          <RowsPhotoAlbum photos={media as Photo[]} targetRowHeight={150} onClick={({ index }: { index: number }) => setIndex(index)} />
          <Lightbox
            slides={media}
            carousel={{
              finite: true
            }}
            open={index >= 0}
            index={index}
            close={() => setIndex(-1)}
            plugins={[Video, Fullscreen, Slideshow, Thumbnails, Zoom]}
            render={{
              slideFooter: (props) => {
                const slide = props.slide as IMediaSlide

                return (
                  <Typography sx={{
                    position: 'absolute',
                    bottom: '20px',
                    color: '#fff'
                  }}>
                    <Link
                      href={`${STRAVA_UI_URL}/activities/${slide.activityId}`}
                      sx={{
                        opacity: 0.7,
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
          <Box sx={{ marginTop: 2 }}>
            <Button onClick={fetchActivities} loading={isLoading} variant="contained">{showMorePhotosLabel}</Button>
          </Box>
        </>
      ) : null}
    </Box>
  )
}
