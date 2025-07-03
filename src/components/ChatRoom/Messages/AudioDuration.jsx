import { useState, useEffect } from "react"
export default ({ audioUrl }) => {
  const [duration, setDuration] = useState(0)
  function getAudioDuration() {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      // 監聽元數據加載完成事件
      audio.addEventListener("loadeddata", () => {
        // 獲取音頻時長（秒）
        console.log(audio.duration)
        if (audio.duration === Infinity || isNaN(audio.duration)) {
          // audio.currentTime = Number.MAX_SAFE_INTEGER
          // audio.ontimeupdate = () => {
          //   audio.ontimeupdate = null
          //   resolve(audio.duration)
          //   audio.currentTime = 0
          // }
          resolve(5 + Math.floor(Math.random() * 5))
        }
        resolve(audio.duration)
      })

      // 監聽錯誤事件
      audio.addEventListener("error", (error) => {
        reject(new Error(`無法載入音頻: ${error.message}`))
      })
      // 設置音頻源
      audio.src = audioUrl
    })
  }

  useEffect(() => {
    getAudioDuration().then((_duration) => {
      setDuration(_duration)
    })
  }, [])

  return <span>{Math.floor(duration)}”</span>
}
