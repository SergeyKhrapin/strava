import { createContext } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
// import { Popup } from '@components/Popup'
import { Media } from '@components/Media'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { STRAVA_UI_URL, CLIENT_ID, ENV_VARS } from './constants'
import { useAuth } from '@hooks/useAuth'

// const Popup = lazy(() => import('./components/Popup'))
export const Context = createContext(null)

const authUrl = `${STRAVA_UI_URL}/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${ENV_VARS.APP_DOMAIN_URL}&scope=activity%3Aread_all`

function App() {
  // const [count, setCount] = useState(0)
  // const [isPopupShown, setIsPopupShown] = useState(false)
  const { authToken, isAuthTokenCalculating } = useAuth()

  console.log('authToken', authToken)
  console.log('isAuthTokenCalculating', isAuthTokenCalculating)
  

  return (
    <>
      {isAuthTokenCalculating ? null : (
        authToken ? (
          <Context.Provider value={authToken}>
            <Media />
          </Context.Provider>
        ) : (
          <Stack>
            <Button href={authUrl} variant="contained">Authorize</Button>
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
      {/* {isPopupShown ? <Popup/> : null} */}
    </>
  )
}

export default App
