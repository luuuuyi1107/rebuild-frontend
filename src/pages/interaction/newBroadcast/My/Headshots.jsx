import { useState, useEffect, useMemo } from "react"
import { getAvatar } from "@/action/apis"
import AvatarIcon from "@/components/AvatarIcon"
export default (props) => {
  const [currentHeadImg, setCurrentHeadImg] = useState(props.current)
  const [headImgs, setHeadImgs] = useState([])
  const headItems = useMemo(() => {
    return headImgs.map((img) => ({ ...img, active: img?.FilePath === currentHeadImg }))
  }, [currentHeadImg, headImgs])

  const onConfirm = () => {
    if (currentHeadImg === props.current) return
    const selectedHeadItem = headItems.find(({ active }) => active)
    if (!selectedHeadItem) return
    props.onChange?.(selectedHeadItem)
  }

  useEffect(() => {
    getAvatar().then((res) => {
      if (res.Code !== 1) return
      setHeadImgs(res.Data)
    })
  }, [])

  return (
    <div className="bg-white p-2">
      <div className="grid grid-cols-4 gap-[16px]">
        {headItems.map(({ active, ...img }) => (
          <div
            onClick={() => {
              setCurrentHeadImg(img.FilePath)
            }}
            className="relative"
            key={img?.ID}
          >
            <AvatarIcon className="w-full rounded" src={img?.FilePath} />
            {active && (
              <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9.00002 0.666992C4.40002 0.666992 0.666687 4.40032 0.666687 9.00032C0.666687 13.6003 4.40002 17.3337 9.00002 17.3337C13.6 17.3337 17.3334 13.6003 17.3334 9.00032C17.3334 4.40032 13.6 0.666992 9.00002 0.666992ZM6.74169 12.5753L3.75002 9.58366C3.42502 9.25866 3.42502 8.73366 3.75002 8.40866C4.07502 8.08366 4.60002 8.08366 4.92502 8.40866L7.33335 10.8087L13.0667 5.07532C13.3917 4.75032 13.9167 4.75032 14.2417 5.07532C14.5667 5.40032 14.5667 5.92532 14.2417 6.25032L7.91669 12.5753C7.60002 12.9003 7.06669 12.9003 6.74169 12.5753Z"
                    fill="#576B95"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        onClick={onConfirm}
        className={`text-[16px] font-[500] bg-[#07C160] text-white w-14 py-1 text-center rounded-[8px] mx-auto mt-2 ${currentHeadImg === props.current ? "opacity-30" : " active:opacity-80"
          }`}
      >
        确定
      </div>
    </div>
  )
}
