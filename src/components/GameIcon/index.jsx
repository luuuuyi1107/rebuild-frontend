import React from "react"
import "./style.scss"

/**
 * 直接通过 gameid 获取当前的彩票对应ICON
 * */
export default class extends React.PureComponent {
  constructor() {
    super()
  }

  render() {
    return <i className={`game-icon-in-one ${this.props.id}-icon`} />
  }
}
