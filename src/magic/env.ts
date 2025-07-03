export default class Env {
  static isDev() {
    return import.meta.env.VITE_API_URL === "https://611851.com/"
  }
  static isProd() {
    return import.meta.env.VITE_API_URL === "/"
  }
}
