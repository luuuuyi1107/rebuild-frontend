import React from "react"
import util from "@/magic/util"
import { Carousel, CarouselItem } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"

@withRouter
export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      sliderIndex: 0,
    }
  }

  componentDidMount() {
    const SWIPT_TIME = 3000
    this.timer = setInterval(() => {
      if (this.state.sliderIndex == this.props.sliders.length - 1) {
        this.setState({ sliderIndex: 0 })
      } else {
        this.setState({ sliderIndex: this.state.sliderIndex + 1 })
      }
    }, SWIPT_TIME)
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  render() {
    return (
      <div className="slider">
        <Carousel
          swipeable={util.platform.isWap()}
          // swipeable
          overscrollable
          autoScroll={false}
          fullscreen
          autoScrollRatio={0.2}
          index={this.state.sliderIndex}
          id="carouselSlider"
        >
          {this.props.sliders.map((item, index) => {
            return (
              <CarouselItem
                key={item.id + "-" + index}
                className={`slider-item`}
                onClick={() => {
                  this.props.router.push(`/site/promotionContent?id=${item.ID}`)
                }}
              >
                <div>
                  <img className="banner_title" style={{ width: "100%" }} src={item.Name} alt="" />
                </div>
              </CarouselItem>
            )
          })}
        </Carousel>
      </div>
    )
  }
}
