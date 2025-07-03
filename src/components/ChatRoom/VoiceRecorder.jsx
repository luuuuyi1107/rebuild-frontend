import React, { useState, useRef, useEffect, useMemo } from "react"
import util from "@/magic/util"

const VoiceRecorder = (props) => {
  const TIME_LIMIT = 10
  const [isRecording, setIsRecording] = useState(false)
  const [isHover, setIsHover] = useState(false)
  const [isBeingCancelled, setIsBeingCancelled] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 })
  const audioBlobRef = useRef(null)
  const cancelBallRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)
  const voiceRef = useRef(null)

  const isCancelled = useMemo(() => {
    if (!cancelBallRef.current) return false
    if (isHover) return true
    const rect = cancelBallRef.current
    return touchPosition.x > rect.x && touchPosition.x < rect.x + rect.width && touchPosition.y > rect.y && touchPosition.y < rect.y + rect.height
  }, [touchPosition, isHover])

  useEffect(() => {
    uploadRecording()
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        if (isBeingCancelled) return
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        audioBlobRef.current = audioBlob
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
      }

      mediaRecorderRef.current.start()
      // 开始计时
      setRecordingTime(0)
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("录音失败:", err)
      alert(err.message || err.Message)
      props.onClose()
    }
  }

  const stopRecording = (e) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      clearInterval(timerIntervalRef.current)
      setIsRecording(false)
      const _isBeingCancelled = e?.target.id === "cancelButton" || isCancelled || recordingTime < 1
      setIsBeingCancelled(_isBeingCancelled)
      if (_isBeingCancelled) props.onClose()
    }
  }

  const uploadRecording = async () => {
    if (!audioBlobRef.current) {
      console.log("沒有可上傳的錄音")
      return
    }

    try {
      console.log("上傳中...")
      const audioFile = new File([audioBlobRef.current], "recording.wav", {
        type: "audio/wav",
        lastModified: new Date().getTime(),
      })
      props.onUpload({ target: { files: [audioFile], recordingTime } }).then(() => {
        console.log("上傳成功")
        props.onClose()
      })
    } catch (error) {
      console.error("上傳錯誤:", error)
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setRecordingTime(0)
    setIsRecording(false)
  }

  const handleLocalTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    setTouchPosition({
      x: touch.clientX,
      y: touch.clientY,
    })
    console.log("區域內觸摸開始")
  }

  useEffect(() => {
    if (!isRecording) return
    // 添加全局事件監聽
    const handleGlobalTouchMove = (e) => {
      if (!voiceRef.current) return
      const touch = e.touches[0]
      const rect = voiceRef.current.getBoundingClientRect()
      setTouchPosition({
        x: touch.clientX,
        y: touch.clientY,
      })
    }

    const handleGlobalTouchEnd = () => {}

    // 組件掛載時添加監聽
    document.addEventListener("touchmove", handleGlobalTouchMove, { passive: false })
    document.addEventListener("touchend", handleGlobalTouchEnd)
    cancelBallRef.current = document.getElementById("cancelBallElement").getBoundingClientRect()

    startRecording()

    // 組件卸載時移除監聽
    return () => {
      document.removeEventListener("touchmove", handleGlobalTouchMove)
      document.removeEventListener("touchend", handleGlobalTouchEnd)
    }
  }, [isRecording])

  useEffect(() => {
    if (recordingTime >= TIME_LIMIT) {
      stopRecording()
    }
  }, [recordingTime])

  return (
    <div
      ref={voiceRef}
      onMouseUp={stopRecording}
      onTouchEnd={stopRecording}
      onTouchStart={() => {
        setIsRecording(true)
      }}
      onMouseDown={() => {
        setIsRecording(true)
      }}
      className={`w-full flex flex-col justify-end  items-end ${isRecording ? "fixed inset-0 bg-black/50" : ""}`}
    >
      <div className={`text-[16px] font-[600] text-center w-full ${isRecording ? "hidden" : ""}`}>按住说话</div>

      {isRecording && (
        <div className="relative pt-8 w-full max-w-[600px] mx-auto">
          <div>{isCancelled ? "" : ""}</div>
          {isCancelled ? (
            <div className="bg-[#FA5151] w-6 h-6 rounded absolute -translate-x-1/2 left-[18%] -top-[20vh] flex justify-center items-center">
              <img src={util.buildAssetsPath("/assets/icons/ic_voicewave.svg")} />
              <div className="border-solid absolute top-full left-1/2 -translate-x-1/2 h-0 w-0 border-x-8 border-b-transparent border-x-transparent border-t-[10px] border-t-[#FA5151]" />
            </div>
          ) : (
            <div className="bg-[#95EC69] w-14 h-6 rounded absolute -translate-x-1/2 left-1/2 -top-[25vh] flex justify-center items-center">
              <img src={util.buildAssetsPath("/assets/voice_animations.webp")} />
              <div className="border-solid absolute top-full left-1/2 -translate-x-1/2 h-0 w-0 border-x-8 border-b-transparent border-x-transparent border-t-[10px] border-t-[#95EC69]" />
            </div>
          )}

          <div className="relative box-content">
            <div className="absolute inset-0 pt-4 flex justify-center items-center">
              <img className="brightness-150" src={util.buildAssetsPath("/assets/icons/ic_audio.svg")} />
            </div>
            {isCancelled ? (
              <img className="w-full block" src={util.buildAssetsPath("/assets/recordcancel_bg.svg")} />
            ) : (
              <img className="w-full block" src={util.buildAssetsPath("/assets/record_bg.svg")} />
            )}
          </div>

          <div className="w-6 h-6 absolute top-[0%] left-[10%] group" id="cancelBallElement">
            <div
              className={`text-[#ccc] text-[16px] pointer-events-none group-hover:opacity-100 -translate-y-2 ${
                isCancelled ? " opacity-100" : " opacity-0"
              }`}
            >
              松开 取消
            </div>
            <div
              id="cancelButton"
              onMouseOver={() => {
                setIsHover(true)
              }}
              onMouseLeave={() => {
                setIsHover(false)
              }}
              className={`transition-all flex rounded-full w-full h-full justify-center items-center rotate-[-10deg]  group-hover:bg-white group-hover:scale-100 ${
                isCancelled ? "scale-100 bg-white" : " scale-75 bg-black/60"
              }`}
            >
              <div className="pointer-events-none h-[18px] w-[2px] bg-[#9c9c9c] group-hover:bg-[#171717] rotate-45 translate-x-1/2" />
              <div className="pointer-events-none h-[18px] w-[2px] bg-[#9c9c9c] group-hover:bg-[#171717] -rotate-45 -translate-x-1/2" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder
