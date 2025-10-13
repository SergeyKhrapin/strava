import { useEffect, useState, type FC } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import { MediaItem } from '@components/MediaItem';
import { STRAVA_API_URL } from '../constants';

interface IMedia {
  authToken: string | null;
}

export const Media: FC<IMedia> = ({ authToken }) => {
  const activitiesUrl = `${STRAVA_API_URL}/athlete/activities?per_page=30`;
  const [activities, setActivities] = useState([]);  

  useEffect(() => {
    if (authToken) {
      fetch(activitiesUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((data) => data.json()).then((res) => setActivities(res));
    }
  }, [authToken]);

  return (
    <Box>
      <List>
        {activities.map((a: any) => (
          <MediaItem key={a.id} authToken={authToken} activityId={a.id} activityStartDate={a.start_date_local} activityName={a.name}  />
        ))}
      </List>
    </Box>
  );
};
