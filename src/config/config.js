const apiNewUrl = import.meta.env.VITE_API_NEW_URL
export default {
  title: "76C彩票",
  pokerBg: "76C",
  apiUrl: import.meta.env.VITE_API_URL,
  wsUrl: import.meta.env.VITE_WS_URL,
  apiNewUrl: apiNewUrl.startsWith("http") ? apiNewUrl : `${location.origin}${apiNewUrl.startsWith("/") ? "" : "/"}${apiNewUrl}`,
  apiPointsUrl: import.meta.env.VITE_POINTS_SHOP_URL,
  timeOut: import.meta.env.VITE_TIME_OUT,
  domain: "7617.com",
}
