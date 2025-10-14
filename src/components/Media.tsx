import { useState, useContext } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { MediaItem } from '@components/MediaItem';
import { STRAVA_API_URL } from '../constants';
import { Context } from "src/App";
import Button from "@mui/material/Button";

const activitiesUrl = `${STRAVA_API_URL}/athlete/activities?per_page=30`

export const Media = () => {
  const authToken = useContext(Context)
  const [activities, setActivities] = useState([]);

  const showPhotos = () => {
    if (authToken) {
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
        setActivities(res.slice(0, 5)) // TODO: remove slice
      })
    }
  }

  return (
    <Box>
      <Button onClick={showPhotos} variant="contained">Show photos</Button>
      <List>
        {activities.map((a: any) => (
          <MediaItem key={a.id} activityId={a.id} activityStartDate={a.start_date_local} activityName={a.name}  />
        ))}
      </List>
    </Box>
  )
}
