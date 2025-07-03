import React from "react"

import "./style.scss"
import util from "@/magic/util"

export default class extends React.PureComponent {
  // IsLike: "0:未表态，1:喜欢，-1：不喜欢"
  // IsDonate: 0: 未打賞, 大於0: 已打賞(打賞金額), -1: 不可打賞
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className={`empty_view_layout ${this.props.no_margin ? "no_margin" : ""}`}>
        <img src={util.buildAssetsPath(`images/EmptyView/empty_${this.props.imgId || 1}.png`)} />
        {this.props.desc && this.props.desc.length > 0 && <div> - {this.props.desc} -</div>}
      </div>
    )
  }
}
