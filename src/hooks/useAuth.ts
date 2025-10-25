import { useEffect, useState } from "react"
import { CLIENT_ID, STRAVA_UI_URL, GRANT_TYPE_INIT, CLIENT_SECRET, SCOPE_REQUIRED } from "src/constants"

// prevent calling token endpoint twice in dev mode
let isAuthorized = false

export const useAuth = () => {
  const [authToken, setAuthToken] = useState<{
    value: string | null
    error: any
  }>({
    value: null,
    error: null
  })
  const [isAuthInProgress, setIsAuthInProgress] = useState(true)
  const [isAccessMissing, setIsAccessMissing] = useState(false)
  
  const authCode = window.location.href.split('code=')[1]?.split('&')?.[0]
  const scope = window.location.href.split('scope=')[1]?.split('&')?.[0]  
  
  useEffect(() => {
    console.log('useEffect');
    
    if (!isAuthorized) {
      console.log('isAuthorized', isAuthorized);
      
      if (authCode) {
        if (scope === SCOPE_REQUIRED) {
          const authTokenUrl = `${STRAVA_UI_URL}/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${authCode}&grant_type=${GRANT_TYPE_INIT}`
      
          isAuthorized = true

          fetch(authTokenUrl, {
            method: 'POST'
          })
            .then((res) => res.json())  
            .then((data) => {
              setAuthToken((prev) => ({
                ...prev,
                value: data.access_token,
              }))
            })
            .catch((e) => {
              setAuthToken((prev) => ({
                ...prev,
                error: e,
              }))
            })
            .finally(() => {
              setIsAuthInProgress(false)
            })
        } else {
          setIsAccessMissing(true)
          setIsAuthInProgress(false)
        }
      } else {
        setIsAuthInProgress(false)
      }
    }
  }, [authCode, scope])

  return { authToken, isAuthInProgress, isAccessMissing }                                                                                       
}
