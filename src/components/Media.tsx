import { useState, useEffect, type FC } from "react"
import dayjs, { type Dayjs } from "dayjs"
import { toast } from 'react-toastify'
import { STRAVA_API_URL, STRAVA_UI_URL } from '../constants'
import { showPhotosLabel, showMorePhotosLabel, resetLabel, noPhotos, noActivities, authErrorMessage, errorMessage } from '@components/constants'
import Grid from "@mui/material/Grid"
import { DatePicker } from "@common/DatePicker"
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
import Cookies from 'js-cookie'

const imageSize = 5000

interface IMedia {
  authToken: string
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>
}

interface IMediaItemExtraData {
  activityId: number
  activityName: string
  activityDate: string
}

type IMediaSlide = IMediaItemExtraData & Slide

export const Media: FC<IMedia> = ({ authToken, setAuthToken }) => {
  const [activities, setActivities] = useState<any[] | null>(null)
  const [media, setMedia] = useState<IMediaSlide[] | null>(null)
  const [isMorePhotos, setIsMorePhotos] = useState(true)
  const [page, setPage] = useState(1)
  const [index, setIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
  const [dateTo, setDateTo] = useState<Dayjs | null>(null)

  const afterTimestamp = dayjs(dateFrom).unix()
  const beforeTimestamp = dayjs(dateTo).set('date', dayjs(dateTo).get('date') + 1).unix() // include a selected day
  
  const activitiesUrl =
    `${STRAVA_API_URL}/athlete/activities?page=${page}&per_page=30${dateTo ? '&before=' + beforeTimestamp : ''} ${dateFrom ? '&after=' + afterTimestamp : ''}`

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
          if (res.message === 'Authorization Error') {
            setAuthToken(null)
            Cookies.remove('access_token')
            toast(authErrorMessage, { type: 'error' })
          } else if (!res.length) {
            setIsLoading(false)
            setIsMorePhotos(false)
            if (page === 1) {
              toast(noActivities, { type: 'info' })
            }
          } else {
            setActivities(res)
            setPage(prev => ++prev)
          }
        })
        .catch(() => {
          setIsLoading(false)
          toast(errorMessage, { type: 'error'})
        })
    }
  }

  const resetPhotos = () => {
    setActivities(null)
    setMedia(null)
    setPage(1)
  }

  useEffect(() => {
    if (authToken) {
      const slides: IMediaSlide[] = []

      async function getActivitiesMedia() {        
        for (const a of activities!) {
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

        if (!slides.length) {
          setPage(1)
          toast(noPhotos, { type: 'info' })
        }

        setMedia((prev) => {
          if (prev === null) {
            return slides
          }
          return prev.concat(slides)
        })

        setIsLoading(false)
      }

      if (activities?.length) {
        getActivitiesMedia()
      }
    }
  }, [activities, authToken])

  return (
    <Grid container justifyContent="center">
      {!media || !media.length ? (
        <Grid size={12}>
          <Stack rowGap={2.5} width="100%">
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
        </Grid>
      ) : (
        <Grid size={12}>
          <Stack rowGap={2} width="100%">
            <Stack direction="row" justifyContent="center">
              {dateFrom || dateTo ? (
                <>
                  <Typography>{dateFrom ? dayjs(dateFrom).format('DD/MM/YYYY') : '--/--/----'}</Typography>
                  &nbsp;—&nbsp;
                  <Typography>{dateTo ? dayjs(dateTo).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY')}</Typography>
                </>
              ) : null}
            </Stack>
            <Box>
              <RowsPhotoAlbum
                photos={media as Photo[]}
                targetRowHeight={150}
                onClick={({ index }: { index: number }) => setIndex(index)}
                spacing={(containerWidth) => {
                  if (containerWidth >= 1200) {
                    return 10
                  } else if (containerWidth < 1200 && containerWidth >= 600) {
                    return 8
                  } else if (containerWidth < 600 && containerWidth >= 300) {
                    return 6
                  } else {
                    return 4
                  }
                }}
              />
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
                        bottom: '-6px',
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
            </Box>
            <Box>
              <Button sx={{ width: '130px' }} onClick={fetchActivities} loading={isLoading} disabled={!isMorePhotos} variant="contained">{showMorePhotosLabel}</Button>
            </Box>
            <Box>
              <Button sx={{ width: '130px' }} onClick={resetPhotos} variant="outlined">{resetLabel}</Button>
            </Box>
          </Stack>
        </Grid>
      )}
    </Grid>
  )
}
