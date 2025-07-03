import React from "react"
import util from "@/magic/util"

export default class extends React.PureComponent {
  render() {
    return (
      <div className="skeleton2">
        <img src={util.buildAssetsPath("assets/logo_black.png")} />
      </div>
    )
  }
}
