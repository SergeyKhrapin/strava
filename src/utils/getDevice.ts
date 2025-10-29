export const getDevice = () => {
  const mobileWidthPortraitBreakpoint = 480
  const mobileWidthLandscapeBreakpoint = 956 // iPhone 17 Pro Max
  const isLandscape = window.matchMedia("(orientation: landscape)").matches
  const isPortrait = window.matchMedia("(orientation: portrait)").matches
  const isMobile =  (window.innerWidth <= mobileWidthPortraitBreakpoint && isPortrait) || (window.innerWidth <= mobileWidthLandscapeBreakpoint && isLandscape)

  return {
    isMobile
  };
}
