import { useState, useContext, useEffect } from "react"
import Box from "@mui/material/Box"
import { STRAVA_API_URL } from '../constants'
import { Context } from "src/App"
import Button from "@mui/material/Button"
import { RowsPhotoAlbum } from "react-photo-album"
import "react-photo-album/rows.css"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Slideshow from "yet-another-react-lightbox/plugins/slideshow"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/plugins/thumbnails.css"


const imageSize = 5000

export const Media = () => {
  const authToken = useContext(Context)
  const [activities, setActivities] = useState([])
  const [media, setMedia] = useState<any>([])
  const [page, setPage] = useState(1)
  const [index, setIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)

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
      const media: any[] = []

      async function getActivitiesMedia() {
        for (const a of activities as any[]) {
          // TODO: doesn't work with videos
          // TODO: double check - if it really works for photos
          if (a.total_photo_count > 0) {
            const data = await fetch(`${STRAVA_API_URL}/activities/${a.id}/photos?size=${imageSize}`, {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            })
            const res = await data.json()
            res.map((item: any) => {
              media.push({
                src: item.urls[imageSize],
                width: item.sizes[imageSize][0],
                height: item.sizes[imageSize][1],
                activityId: a.id
            })})
          }
        }

        setMedia((prev: any) => prev.concat(media))
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

  return (
    <Box>
      {!media.length ? (
        <Button onClick={fetchActivities} loading={isLoading} variant="contained">Show photos</Button>
      ) : null}
      {media.length ? (
        <>
          <RowsPhotoAlbum photos={media} targetRowHeight={150} onClick={({ index }: { index: number }) => setIndex(index)} />
          <Lightbox
            slides={media}
            open={index >= 0}
            index={index}
            close={() => setIndex(-1)}
            plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
          />
          <Box sx={{ marginTop: 2 }}>
            <Button onClick={fetchActivities} loading={isLoading} variant="contained">Show more</Button>
          </Box>
        </>
      ) : null}
    </Box>
  )
}
