import { useState, useEffect, type FC, useRef } from "react"
import dayjs, { type Dayjs } from "dayjs"
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'
import { STRAVA_API_URL } from '../constants'
import { showPhotosLabel, showMorePhotosLabel, resetLabel, noPhotos, noActivities, authErrorMessage, errorMessage, sortLabel, SortMedia } from '@components/constants'
import { DatePicker } from "@common/DatePicker"
import { Lightbox } from "@common/Lightbox"
import { PhotoAlbum } from "@common/PhotoAlbum"
import { sortMedia } from "@utils/sortMedia"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import ClearIcon from '@mui/icons-material/Clear'
import Tooltip from '@mui/material/Tooltip'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { type Slide } from "yet-another-react-lightbox"
import { type Photo } from "react-photo-album"

const imageSize = 5000
const imagesPerPage = 30
interface IMedia {
  authToken: string
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>
}

interface IMediaItemExtraData {
  activityId: number
  activityName: string
  activityDate: string
}

export type IMediaSlide = IMediaItemExtraData & Slide

export const Media: FC<IMedia> = ({ authToken, setAuthToken }) => {
  const prevPage = useRef<number | null>(null)
  const [activities, setActivities] = useState<any[] | null>(null)
  const [media, setMedia] = useState<IMediaSlide[] | null>(null)
  const [isMoreMedia, setIsMoreMedia] = useState(true)
  const [sorting, setSorting] = useState<keyof typeof SortMedia | null>(null)
  const [page, setPage] = useState(1)
  const [index, setIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null)
  const [dateTo, setDateTo] = useState<Dayjs | null>(null)

  const sortTooltipLabel = `${sortLabel} ${sorting === SortMedia.ASC ? '(latest > oldest)' : '(oldest > latest)'}`

  const afterTimestamp = dayjs(dateFrom).unix()
  const beforeTimestamp = dayjs(dateTo).set('date', dayjs(dateTo).get('date') + 1).unix() // include a selected day
  
  const activitiesUrl =
    `${STRAVA_API_URL}/athlete/activities?page=${page}&per_page=${imagesPerPage}${dateTo ? '&before=' + beforeTimestamp : ''} ${dateFrom ? '&after=' + afterTimestamp : ''}`

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
            setIsMoreMedia(false)
            if (page === 1) {
              toast(noActivities, { type: 'info' })
            }
          } else {
            setIsMoreMedia(res.length < imagesPerPage ? false : true)
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

  const handleResetMedia = () => {    
    setActivities(null)
    setMedia(null)
    setSorting(SortMedia.DESC)
    setPage(1)
    prevPage.current = null
    setIsMoreMedia(true)
    setDateFrom(null)
    setDateTo(null)
  }

  const handleSortMedia = () => {
    const newSorting = sorting === SortMedia.ASC ? SortMedia.DESC : SortMedia.ASC
    
    setMedia(currentMedia => sortMedia(currentMedia, newSorting))
    setSorting(newSorting)
  }

  useEffect(() => {
    // Set initial sorting - before Show Photos button is clicked for the first time
    if (activities === null && media === null) {      
      if (dateFrom && !dateTo) {
        setSorting(SortMedia.ASC)
      } else {
        setSorting(SortMedia.DESC)
      }
    }
  }, [activities, dateFrom, dateTo, media])

  useEffect(() => {    
    if (authToken) {
      const slides: IMediaSlide[] = []

      async function getActivitiesMedia() {     
        for (const a of activities!) {
          if (a.total_photo_count > 0) {
            const activityUrlData = {
              activityId: a.id,
              activityName: a.name,
              activityDate: new Date(a.start_date_local).toLocaleDateString()
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
          const sortedSlides = sortMedia(slides, sorting)
          const isDateFromNoDateTo = dateFrom && !dateTo

          if ((sorting === SortMedia.DESC && !isDateFromNoDateTo) || (sorting === SortMedia.ASC && isDateFromNoDateTo)) {
            return (prev ?? []).concat(sortedSlides)
          } else if (sorting === SortMedia.ASC || (sorting === SortMedia.DESC && isDateFromNoDateTo)) {
            return sortedSlides.concat(prev ?? [])
          }
          
          return prev
        })

        setIsLoading(false)
        prevPage.current = page
      }
      
      if (activities?.length && page !== prevPage.current) {
        getActivitiesMedia()
      }
    }
  }, [activities, authToken, dateFrom, dateTo, page, sorting])

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
              <PhotoAlbum photos={media as Photo[]} setIndex={setIndex} />
              <Lightbox slides={media} index={index} setIndex={setIndex} />
            </Box>
            <Stack flexDirection="row" justifyContent="center" columnGap={2}>
              <Tooltip title={sortTooltipLabel}>
                <Button onClick={handleSortMedia} variant="outlined">
                  {sorting === SortMedia.DESC ? <ArrowDownwardIcon /> : <ArrowUpwardIcon /> }
                </Button>
              </Tooltip>
              <Button sx={{ width: '130px' }} onClick={fetchActivities} loading={isLoading} disabled={!isMoreMedia} variant="contained">{showMorePhotosLabel}</Button>
              <Tooltip title={resetLabel}>
                <Button onClick={handleResetMedia} variant="outlined">
                  <ClearIcon />
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Grid>
      )}
    </Grid>
  )
}
