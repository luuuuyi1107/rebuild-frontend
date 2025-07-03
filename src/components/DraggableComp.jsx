import { useRef } from "react"
import Draggable from "react-draggable"
import _ from "lodash"

export default (props) => {
  const draggingElement = useRef(null)
  const couponDragging = useRef({ x: 0, y: 0 })
  const x = props.position?.x || 0
  const y = props.position?.y || 0
  const bounds = props.bounds ?? ""

  return (
    <Draggable
      bounds={bounds}
      ref={draggingElement}
      allowAnyClick={false}
      onStart={() => {
        couponDragging.current = _.pick(draggingElement.current.state, ["x", "y"])
      }}
      onStop={() => {
        const { x, y } = couponDragging.current
        const deltaX = draggingElement.current.state.x - x
        const deltaY = draggingElement.current.state.y - y
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        if (distance > 10) return
        props.onClick()
      }}
      defaultPosition={{ x, y }}
    >
      <div className="fixed z-50">{props.children}</div>
    </Draggable>
  )
}
