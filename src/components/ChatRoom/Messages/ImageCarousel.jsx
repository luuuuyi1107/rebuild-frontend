import { Carousel, CarouselItem } from "react-onsenui"
import { useState } from "react"
import "./style.scss"
import "./style.scss"
export default ({ image, images, onClick }) => {
  if (!image || !images) return null
  const className = "w-full max-w-[98%] max-h-[80vh] h-auto mx-auto object-contain"
  if (images.length === 1) {
    return images.includes(image) ? <img onClick={onClick} src={image} className={className} alt="Image" /> : null
  }

  const [activeIndex, setActiveIndex] = useState(images.findIndex((item) => item === image))
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = () => {
    setIsDragging(false)
  }

  const handleMouseMove = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    if (!isDragging) {
      onClick()
    }
  }

  return (
    <Carousel
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onPostChange={(event) => {
        setActiveIndex(event.activeIndex)
      }}
      swipeable
      overscrollable
      autoScroll={true}
      autoScrollRatio={0.1}
      id="carousel"
      index={activeIndex}
      className="broadcast-image-carousel"
    >
      {images.map((item, index) => (
        <CarouselItem key={index} className="carousel-item">
          <img src={item} className={className} alt={`Image ${index}`} />
        </CarouselItem>
      ))}
    </Carousel>
  )
}
