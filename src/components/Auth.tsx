import { useState, type FC } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';

interface IAuth {
  setAuthToken: any;
}

export const Auth: FC<IAuth> = ({ setAuthToken }) => {
  const [value, setValue] = useState('');
  
  const handleSetValue = (e: any) => {
    setValue(e.target.value);
  };

  const handleSetToken = () => {
    setAuthToken(value);
  };

  return (
    <Stack>
      <Link href="https://www.strava.com/oauth/authorize">Authorize</Link>
      <TextField onChange={handleSetValue} label="Put your auth token here" fullWidth />
      <Button onClick={handleSetToken} variant="contained">Set Auth token</Button>
    </Stack>
  );
};