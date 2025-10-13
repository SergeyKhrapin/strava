import { useState, lazy } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import { Popup } from '@components/Popup'
import { Auth } from '@components/Auth'
import { Media } from '@components/Media'

const Popup = lazy(() => import('./components/Popup'))

function App() {
  const [count, setCount] = useState(0)
  const [isPopupShown, setIsPopupShown] = useState(false)
  const [authToken, setAuthToken] = useState(null); // 41658ac26be823ba677976a708de338f7e0c57bd

  return (
    <>
      <Auth setAuthToken={setAuthToken} />
      <Media authToken={authToken} />
      <div>
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
      </button>
      {/* {isPopupShown ? <Suspense fallback={null}><Popup/></Suspense> : null} */}
      {isPopupShown ? <Popup/> : null}
    </>
  )
}

export default App
