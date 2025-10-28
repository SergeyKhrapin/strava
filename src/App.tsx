// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
// import { Popup } from '@components/Popup'
import { Media } from '@components/Media'
import Stack from '@mui/material/Stack'
import { STRAVA_UI_URL, CLIENT_ID, ENV_VARS } from './constants'
import { useAuth } from '@hooks/useAuth'
import stravaBtn from './assets/strava_btn.svg'
import Link from '@mui/material/Link'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/en-gb'
import Alert from '@mui/material/Alert'
import { ToastContainer } from 'react-toastify'
import { Analytics } from "@vercel/analytics/react"

// const Popup = lazy(() => import('./components/Popup'))

const authUrl = `${STRAVA_UI_URL}/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${ENV_VARS.APP_DOMAIN_URL}&scope=activity%3Aread_all`

function App() {
  // const [count, setCount] = useState(0)
  // const [isPopupShown, setIsPopupShown] = useState(false)
  const { authToken, setAuthToken, isAuthInProgress, isAccessMissing } = useAuth()
  
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en-gb'>
        <ToastContainer />
        {isAuthInProgress ? null : (
          authToken ? (
            <Media authToken={authToken} setAuthToken={setAuthToken} />
          ) : (
            <Stack>
              {isAccessMissing ? (
                <Alert severity="warning" sx={{ marginBottom: '2rem' }}>Please provide access to your data to be able to use IZHA app</Alert>
              ) : null}
              <Link href={authUrl} sx={{ height: '48px' }}>
                <img src={stravaBtn} alt="Strava button" />
              </Link>
            </Stack>
          )
        )}

        {/* <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
        <button onClick={() => setIsPopupShown((isShown) => !isShown)}>
          {`${isPopupShown ? "Hide" : "Show"} popup`}
        </button> */}
        {/* {isPopupShown ? <Suspense fallback={null}><Popup/></Suspense> : null} */}
        {/* {isPopupShown ? <Popup count={count} /> : null} */}
      </LocalizationProvider>
      <Analytics />
    </>
  )
}

export default App
