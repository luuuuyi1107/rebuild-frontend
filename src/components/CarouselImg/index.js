import React from "react"
import { Carousel, CarouselItem } from "react-onsenui"
import "./style.scss"
import config from "@/config/config"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      activeIndex: 0,
    }
  }

  componentDidMount() {
    this.animate()
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  animate() {
    if (!this.timer) {
      let _this = this
      this.timer = setInterval(function() {
        _this.setState({ activeIndex: _this.state.activeIndex + 1 })
      }, 3000)
    }
  }

  resetTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = ""
    }

    this.animate()
  }

  render() {
    let CarouselData = config.homeCarousel || []
    return (
      <div className="carousel-image-module">
        <Carousel
          onPostChange={(event) => {
            let carousel = document.getElementById("carousel")
            let activeIndex = event.activeIndex
            if (event.activeIndex >= carousel.itemCount - 1) {
              carousel.first({ animation: "none" })
              activeIndex = 0
            }
            this.setState({ activeIndex: activeIndex })
          }}
          swipeable
          overscrollable
          autoScroll={true}
          fullscreen
          autoScrollRatio={0.1}
          index={this.state.activeIndex}
          id="carousel"
          onSwipe={(event) => {
            this.resetTimer()
          }}
        >
          {CarouselData.map((item, index) => {
            return (
              <CarouselItem key={"CarouselItem" + index}>
                <img
                  className="carousel-image"
                  src={util.buildAssetsPath(item.img)}
                  onClick={() => {
                    if (item.link) window.location = item.link
                  }}
                />
              </CarouselItem>
            )
          })}
          {CarouselData[0] && (
            <CarouselItem key={"CarouselItem" + CarouselData.length}>
              <img
                className="carousel-image"
                src={util.buildAssetsPath(CarouselData[0].img)}
                onClick={() => {
                  if (CarouselData[0].link) window.location = CarouselData[0].link
                }}
              />
            </CarouselItem>
          )}
        </Carousel>
        <ul className="nav-dot">
          {CarouselData.map((item, index) => {
            return <li key={index} className={index == this.state.activeIndex % CarouselData.length ? "on" : ""}></li>
          })}
        </ul>
      </div>
    )
  }
}
