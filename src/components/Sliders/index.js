import React, { useRef, useState, useEffect } from "react"
import { Carousel, CarouselItem, Icon } from "react-onsenui"
import "./style.scss"
export default (props) => {
  const downX = useRef(null)
  const [page, setPage] = useState(1)

  function onDownEvent(e) {
    downX.current = e.clientX
  }

  function onUpEvent(e) {
    if (!!downX.current && Math.abs(downX.current - e.clientX) < 50) {
      props.clickEvent()
    }
    downX.current = null
  }

  function sliderChange(e) {
    setPage(e.activeIndex + 1)
    // console.log(page.current)
  }

  useEffect(() => {
    setPage(props.index + 1)
  }, [props.index])

  return (
    <div className="component-slider" onMouseDown={onDownEvent} onMouseUp={onUpEvent}>
      <div
        className="close"
        onClick={() => {
          props.clickEvent()
          downX.current = null
        }}
      >
        <Icon icon="ion-close" />
      </div>
      <div className="page-status">
        {page} / {props.sliders.length}
      </div>
      <Carousel
        key={props.sliders.length}
        swipeable={props.swipe || true}
        overscrollable
        autoScroll={true}
        autoScrollRatio={0.1}
        index={page - 1}
        animationOptions={{ duration: 2 }}
        // onClick={props.clickEvent}
        // fullscreen
        // id="carouselSlider"
        onPostChange={sliderChange}
      >
        {props.sliders.map((item, index) => (
          <CarouselItem key={item.id + "-" + index}>
            <div className="item">
              <img src={item.Name} />
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  )
}
