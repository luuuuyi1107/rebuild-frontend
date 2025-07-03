import React, { useState, useRef, useEffect } from "react"
import util from "@/magic/util"

const AudioPlayer = ({ src, time }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [canAutoPlay, setCanAutoPlay] = useState(false)
  const audioRef = useRef(null)

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause()
          setIsPlaying(false)
        } else {
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
            setIsPlaying(true)
          }
        }
      } catch (error) {
        console.error("播放出錯:", error)
        setIsPlaying(false)
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto " onClick={togglePlay}>
      <div className="audio-container">
        <div className="w-[18px] flex items-center">
          {isPlaying ? (
            <img className="icon audio-icon mx-auto" src={util.buildAssetsPath("assets/audio-play.webp")} />
          ) : (
            <img className="icon audio-icon mx-auto" src={util.buildAssetsPath("assets/icons/audio-play.svg")} />
          )}
        </div>
        {/* <img className="icon audio-icon" src={util.buildAssetsPath("assets/icons/audio-play.svg")} /> */}
        <div className="mx-1 flex-1">
          <audio onEnded={() => setIsPlaying(false)} ref={audioRef} src={src} className="w-0 h-0" />
          <span>{Math.floor(time === 0 ? Math.random() * 2 + 5 : time)}”</span>
        </div>
        <div className="w-5" />
      </div>
    </div>
  )
}

export default AudioPlayer
