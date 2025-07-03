import React, { useState } from "react"
import util from "@/magic/util"

const VideoPreview = ({ src, img = null, onPlay }) => {
  const [thumbnail, setThumbnail] = useState(img)

  // Generate a thumbnail when the component loads
  React.useEffect(() => {
    if (!src || !!img) return
    const videoElement = document.createElement("video")
    videoElement.src = src
    videoElement.crossOrigin = "anonymous"
    // videoElement.crossOrigin = "*"
    videoElement.currentTime = 1
    videoElement.addEventListener("loadeddata", () => {
      const canvas = document.createElement("canvas")
      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight

      const context = canvas.getContext("2d")
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL("image/png")
      setThumbnail(dataUrl)
    })
    return () => {
      videoElement.remove()
    }
  }, [src])

  return (
    <div className="relative cursor-pointer group" onClick={onPlay}>
      {thumbnail ? <img src={thumbnail} alt="Video thumbnail" className="rounded-sm" /> : <div className="w-12 h-6 bg-gray-800 rounded-sm"></div>}
      <img
        className="icon absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 group-hover:opacity-100 drop-shadow"
        src={util.buildAssetsPath("assets/icons/video-play.svg")}
      />
    </div>
  )
}

export default VideoPreview
