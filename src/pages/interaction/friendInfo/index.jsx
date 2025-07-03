import React from "react"

import FriendInfo from "./Info"
import util from "@/magic/util"

export default class extends React.PureComponent {
  render() {
    return <FriendInfo userId={util.getUrlParam("id")} />
  }
}
