import React from "react"

export default class extends React.PureComponent {
  render() {
    let bars = []
    let barLen = 10 + Math.round(Math.random() * 5)
    for (let i = 0; i < barLen; i++) {
      bars.push({
        height: 20,
        width: 30 + Math.floor(Math.random() * 70),
      })
    }

    return (
      <div className="skeleton">
        <div className="head1"></div>
        <div className="head2"></div>
        <div className="row">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="bars">
          {bars.map((item, index) => {
            return <div key={index} style={{ height: item.height, width: item.width + "%" }}></div>
          })}
        </div>
      </div>
    )
  }
}
