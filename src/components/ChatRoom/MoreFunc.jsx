import CustomIcon from "@/components/CustomIcon"
import { useState, useImperativeHandle, forwardRef } from "react"
import { chunk } from "lodash"
import { Carousel, CarouselItem } from "react-onsenui"

export default forwardRef((props, ref) => {
  const size = 8
  const funclist = [
    {
      key: "image",
      text: "照片",
      img: require("./icons/more_1.svg"),
    },
    {
      key: "camera",
      text: "拍摄",
      img: require("./icons/more_2.svg"),
    },
    {
      key: "bet",
      text: "分享注单",
      img: require("./icons/more_3.svg"),
    },
    {
      key: "shareWin",
      text: "分享战绩",
      img: require("./icons/more_4.svg"),
    },
    {
      key: "moreWin",
      text: "更多战绩",
      img: require("./icons/more_5.svg"),
    },
    // {
    //   key: "betEntainment",
    //   text: "投注娱乐",
    //   img: require("./icons/more_6.svg"),
    // },
    // {
    //   key: "red",
    //   text: "红包",
    //   img: require("./icons/more_7.svg"),
    // },
    // {
    //   key: "audio",
    //   text: "语音输入",
    //   img: require("./icons/more_8.svg"),
    // },
    // {
    //   key: "ranks",
    //   text: "盈利排行",
    //   img: require("./icons/more_9.svg"),
    // },
  ]

  const [page, setPage] = useState(1)

  const funcEvent = (key) => {
    if (key === "image" || key === "camera") {
      document.getElementById(key + "Input").click()
      return
    }

    props.onFuncClick(key)
  }

  const ItemsList = (items) => (
    <div className="flex justify-left flex-wrap gap-y-1 ">
      {items.map((item, index) => (
        <div key={item.key} className="flex justify-center items-center flex-col w-1/4" onClick={funcEvent.bind(null, item.key)}>
          <div className="w-[54px] h-[54px] rounded-[12px] bg-white flex justify-center items-center mb-0.5">
            <CustomIcon type={item.img} />
          </div>
          <div className="text-[#6f6f6f]">{item.text}</div>
        </div>
      ))}
    </div>
  )
  // console.log("MoreFunc render")
  const isMoreThenSize = funclist.length > size
  return (
    <div id="moreFunc" className="bg-[#f6f6f6] py-[24.5px] h-[226px]">
      <input className="hidden" type="file" id="imageInput" onChange={props.onUpload} accept=".jpg,.jpeg,.png,.gif" />
      <input className="hidden" type="file" id="cameraInput" accept="image/*" onChange={props.onUpload} capture="environment" />
      <input className="hidden" type="file" id="audioInput" accept="audio/*" />

      {isMoreThenSize ? (
        <>
          <Carousel swipeable overscrollable autoScroll={true} onPostChange={(event) => setPage(event.activeIndex + 1)} index={page - 1}>
            {chunk(funclist, size).map((items, index) => (
              <CarouselItem key={index}>{ItemsList(items)}</CarouselItem>
            ))}
          </Carousel>
          <div className="flex justify-center mt-1">
            {new Array(Math.ceil(funclist.length / size)).fill(0).map((_, index) => (
              <div
                key={index}
                className="p-[7px]"
                onClick={() => {
                  setPage(index + 1)
                }}
              >
                <div className={`w-[10px] h-[10px] rounded-full ${page === index + 1 ? "bg-gray-600" : "bg-gray-300"}`} />
              </div>
            ))}
          </div>
        </>
      ) : (
        ItemsList(funclist)
      )}
    </div>
  )
})
