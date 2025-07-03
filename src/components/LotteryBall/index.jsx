import React from "react"
import SSC from "./SSC"
import PKS from "./PKS"
import SYXW from "./SYXW"
import PCDD from "./PCDD"
import LHC from "./LHC"
import KS from "./KS"
import KLSF from "./KLSF"
import KLB from "./KLB"
import QXC from "./QXC"
import FC3 from "./FC3"
import Poker from "./Poker"
import NiuNiu from "./NiuNiu"

import "./style.scss"

export default class extends React.PureComponent {
  render() {
    let type = this.props.type

    if (type == "ssc") {
      return <SSC {...this.props} />
    }
    if (type == "pks") {
      return <PKS {...this.props} />
    }
    if (type == "syxw") {
      return <SYXW {...this.props} />
    }
    if (type == "pcdd") {
      return <PCDD {...this.props} />
    }
    if (type == "lhc") {
      return <LHC {...this.props} />
    }
    if (type == "ks") {
      return <KS {...this.props} />
    }
    if (type == "klsf") {
      return <KLSF {...this.props} />
    }
    if (type == "klb") {
      return <KLB {...this.props} />
    }
    if (type == "qxc") {
      return <QXC {...this.props} />
    }
    if (type == "fc3") {
      return <FC3 {...this.props} />
    }
    if (type == "baccarat") {
      return <Poker {...this.props} />
    }
    if (type == "hxcow") {
      return <NiuNiu {...this.props} />
    }
    return null
  }
}
