import React, { useState, useRef } from "react"
import Bus from "@/magic/EventBus"
import util from "@/magic/util"
;<script src="https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.7/jsmediatags.min.js"></script>

const AudioPreview = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)
  const handlePlay = () => {
    Bus.emit("media-preview:stop")
    setIsPlaying(true)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
      }
    }, 0)
  }

  const closeEventHandler = () => {
    Bus.emit("media-preview:stop")
  }

  const toggleVideoPlay = () => {
    videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()
  }

  return (
    <div className="relative">
      {isPlaying ? (
        <>
          <audio ref={videoRef} src={src} controls />

          <img
            onClick={closeEventHandler.bind(null)}
            className="w-2 absolute right-1 top-1"
            src={util.buildAssetsPath("assets/icons/ic_close.svg")}
          />
        </>
      ) : (
        <div className="relative cursor-pointer group w-5 h-5 rounded-sm bg-blue-800" onClick={handlePlay}>
          <img
            className="icon absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 group-hover:opacity-100"
            src={util.buildAssetsPath("assets/icons/audio-play.svg")}
          />
        </div>
      )}
    </div>
  )
}

export default AudioPreview
