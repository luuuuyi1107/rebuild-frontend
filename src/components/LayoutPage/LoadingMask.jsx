import React from "react"
import util from "@/magic/util"

export default class extends React.PureComponent {
  render() {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <img src={util.buildAssetsPath("assets/logo_black.png")} />
      </div>
    )
  }
}
