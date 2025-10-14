import { useContext, useEffect, useMemo, useState, type FC } from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ListItem from '@mui/material/ListItem';
import { STRAVA_API_URL, STRAVA_UI_URL } from '../constants';
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Context } from "src/App";

interface IMediaItem {
  activityId: string;
  activityName: string;
  activityStartDate: string;
}

export const MediaItem: FC<IMediaItem> = ({ activityId, activityName, activityStartDate }) => {
  const authToken = useContext(Context);
  const imageSize = 5000

  // const activityUrl = `${STRAVA_API_URL}/activities/16074531508/photos`; // TODO: handle video

  const activityUrl = `${STRAVA_API_URL}/activities/15962796024/photos?size=${imageSize}`;

  const [activityMedia, setActivityMedia] = useState<any>([]);

  const activityLinkText = useMemo(() => {
    const [date, time] = activityStartDate?.split('T') ?? [];
    return `${activityName} ${date} ${time?.split('Z')[0]}`;
  },[activityName, activityStartDate]);

  useEffect(() => {
    if (authToken && activityId) {
      fetch(activityUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then((data) => data.json()).then((res) => setActivityMedia(res));
    }
  }, [authToken, activityId]);

  return (
    <ListItem>
      <Stack>
        <Link href={`${STRAVA_UI_URL}/activities/${activityId}`}>{activityLinkText}</Link>
        <Typography>Image urls:</Typography>
        {activityMedia.map((m: any) => (
          <Box key={m.unique_id}>{m.urls[imageSize]}</Box>
        ))}
      </Stack>
    </ListItem>
  );
};
