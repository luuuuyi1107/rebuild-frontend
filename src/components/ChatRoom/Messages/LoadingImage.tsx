import { useState } from "react"
import { Icon } from "react-onsenui"

interface LoadingImageProps {
  src: string
  className: string
  onClick?: () => void
}

export default (props: LoadingImageProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false) // 控制图片加载状态
  return (
    <>
      {!isImageLoaded && (
        <div className="h-[120px] w-[120px] bg-gray-300 flex items-center justify-center rounded-[8px]">
          <Icon icon="ion-load-d" className="mr-0.5 text-[18px] animate-spin" />
        </div>
      )}
      {/* 实际图片 */}
      <img
        className={props.className + (isImageLoaded ? "" : " hidden")}
        src={props.src}
        onLoad={() => setIsImageLoaded(true)}
        onError={() => setIsImageLoaded(false)}
        onClick={props.onClick}
      />
    </>
  )

  return <img src={props.src} className={className} onLoad={() => setIsImageLoaded(true)} onError={() => setIsImageLoaded(false)} />
}
