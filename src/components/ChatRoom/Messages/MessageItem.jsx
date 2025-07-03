import { useState } from "react"
import { withEmojiContext } from "@/contexts/EmojiContext"
import { ConvertMessageData } from "@/components/HttpChatPage/Messages"
import VideoPreview from "@/components/VideoPreview"
import ModalPage from "@/components/ModalPage"
import AudioPlayer from "./AudioPlayer"
import EffectMenu from "./EffectMenu.jsx"
import ImageCarousel from "./ImageCarousel"
import LongPress from "@/magic/LongPress"
import Bus from "@/magic/EventBus"
import LoadingImage from "./LoadingImage.tsx"

export default withEmojiContext(({ content, emojiData, messageEffect, fromName, fromTime, allImages }) => {
  const messageData = {
    content: null,
    quote: null,
  }
  const [showEffectMenu, setShowEffectMenu] = useState(false)

  if (!content.startsWith("http")) {
    // 非图片、视频、音频
    if (content.startsWith("(:")) {
      const existEmojiData = emojiData?.emojiList?.find((emojiData) => emojiData.Code === content)
      if (existEmojiData) {
        return (
          <div className="inner">
            <img className="h-[120px] object-contain" src={existEmojiData.ImagePath} />
          </div>
        )
      } else {
        return <div className="inner h-[119px] w-[119px]"></div>
      }
    }

    if (content.includes("(quote)")) {
      const [_quote, _name, _time, _content] = content.split("(quote)")
      messageData.content = _content
      messageData.quote = {
        content: _content,
        name: _name,
        time: _time,
      }
    }

    if (content.startsWith("{") && content.includes("}")) {
      const { quoteText, time, text, fromName } = ConvertMessageData({ content })
      messageData.content = text
      messageData.quote = {
        content: quoteText,
        name: fromName,
        time: time,
      }
    }

    if (!!messageData.content) {
      return (
        <>
          <div className="inner">
            <LongPress onLongPress={() => setShowEffectMenu(true)}>
              <div className="whitespace-pre-line">{messageData.content}</div>
            </LongPress>
            {showEffectMenu && (
              <EffectMenu
                onClose={() => setShowEffectMenu(false)}
                onScroll={(value) => Bus.emit("chatRoom.scrollByValue", value)}
                messageEffect={(type) => {
                  Bus.emit("chatRoom.effectMenu", { content: messageData.content, fromName, type, time: fromTime })
                  setShowEffectMenu(false)
                }}
              />
            )}
          </div>
          <div className="quote-message mb-2">
            {messageData.quote.name}: <span dangerouslySetInnerHTML={{ __html: messageData.quote.content }}></span>
          </div>
        </>
      )
    }

    return (
      <>
        <div className="inner relative">
          <LongPress onLongPress={() => setShowEffectMenu(true)}>
            <span className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: content }}></span>
          </LongPress>
          {showEffectMenu && (
            <EffectMenu
              onScroll={(value) => Bus.emit("chatRoom.scrollByValue", value)}
              onClose={() => setShowEffectMenu(false)}
              messageEffect={(type) => {
                Bus.emit("chatRoom.effectMenu", { content, fromName, type, time: fromTime })
                setShowEffectMenu(false)
              }}
            />
          )}
        </div>
      </>
    )
  }
  const fileUrl = content.includes(",") ? content.split(",")[0] : content
  const [showModal, setShowModal] = useState(false)
  const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/i
  const videoRegex = /\.(mp4|webm|mov)$/i
  const audioRegex = /\.(mp3|wav|ogg)$/i

  const MEDIA_TYPE = {
    IMAGE: "image",
    VIDEO: "video",
    AUDIO: "audio",
    TEXT: "text",
  }

  let mediaType = MEDIA_TYPE.TEXT
  let mediaElement = null

  if (imageRegex.test(fileUrl)) {
    mediaType = MEDIA_TYPE.IMAGE
    mediaElement = (
      <LoadingImage
        src={content}
        onClick={() => {
          setShowModal(true)
        }}
      />
    )
  } else if (videoRegex.test(fileUrl)) {
    mediaType = MEDIA_TYPE.VIDEO
    if (content.includes(",")) {
      const [videoUrl, imgFile] = content.split(",")
      const imgUrl = videoUrl.split("/").slice(0, -1).join("/") + "/" + imgFile
      mediaElement = <VideoPreview src={videoUrl} img={imgUrl} onPlay={() => setShowModal(true)} />
    } else {
      mediaElement = <VideoPreview src={content} onPlay={() => setShowModal(true)} />
    }
  } else if (audioRegex.test(fileUrl)) {
    mediaType = MEDIA_TYPE.AUDIO
    const [src, time = 0] = content.split(",")
    mediaElement = <AudioPlayer src={src} time={time} />
  } else {
    mediaElement = <span dangerouslySetInnerHTML={{ __html: content }}></span>
  }

  return (
    <div className="inner">
      {mediaElement}
      <ModalPage
        className="contents"
        animationTime={0}
        isOpen={showModal}
        shouldCloseOnOverlayClick={true}
        onClose={() => {
          setShowModal(false)
        }}
      >
        {mediaType === MEDIA_TYPE.IMAGE ? (
          <ImageCarousel image={content} images={allImages} onClick={() => setShowModal(false)} />
        ) : mediaType === MEDIA_TYPE.VIDEO ? (
          <video
            src={content.includes(",") ? content.split(",")[0] : content}
            controls
            webkit-playsinline="true"
            playsinline="true"
            autoPlay={true}
            className="w-full max-h-[100vh] h-auto mx-auto"
          />
        ) : null}

        <img
          onClick={() => {
            setShowModal(false)
          }}
          className="w-2 absolute right-1 top-1"
          src={util.buildAssetsPath("assets/icons/ic_close.svg")}
        />
      </ModalPage>
    </div>
  )
})
