import { useEffect, useMemo, useState, type FC } from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ListItem from '@mui/material/ListItem';
import { STRAVA_API_URL, STRAVA_UI_URL } from '../constants';
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

interface IMediaItem {
  authToken: string | null;
  activityId: string;
  activityName: string;
  activityStartDate: string;
}

export const MediaItem: FC<IMediaItem> = ({ authToken, activityId, activityName, activityStartDate }) => {
  // const activityUrl = `${STRAVA_API_URL}/activities/${activityId}?include_all_efforts=false`;
  const activityUrl = `${STRAVA_API_URL}/activities/15962796024/photos`;

  const [activity, setActivity] = useState<any>(null);

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
      }).then((data) => data.json()).then((res) => setActivity(res));
    }
  }, [authToken, activityId]);

  return (
    <ListItem>
      <Stack>
        <Link href={`${STRAVA_UI_URL}/activities/${activityId}`}>{activityLinkText}</Link>
        <Typography>Image urls:</Typography>
        <Box>{activity?.photos?.primary?.urls[600]}</Box>
      </Stack>
    </ListItem>
  );
};
