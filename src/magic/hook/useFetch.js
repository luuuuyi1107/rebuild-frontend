import { useState } from "react"

export const useFetch = () => {
  const [isApiLoading, setIsApiLoading] = useState(false)
  const callApi = async (apiFn) => {
    try {
      setIsApiLoading(true)
      await apiFn()
    } finally {
      setIsApiLoading(false)
    }
  }
  return { isApiLoading, callApi }
}
