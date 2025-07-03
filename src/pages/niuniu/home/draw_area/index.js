import React from "react"

import "./style.scss"
import DynamicSvg from "@/components/DynamicSvg"

const hashList = ["65", "66", "70", "71", "67", "72"]
const numPreList = ["70", "71", "72"] // 取號從前面開始取，故取前 16 ，其餘取後 16

export default class extends React.PureComponent {
  // this.props.animation
  constructor(props) {
    super(props)
    this.state = {
      randomKai: null,
    }
  }

  myTimer = null
  componentDidUpdate() {
    if (!!this.myTimer) clearInterval(this.myTimer)
    if (this.props.animation) {
      this.myTimer = setInterval(this.randomKaiArray.bind(this), 500)
    } else {
      if (!!this.myTimer) clearInterval(this.myTimer)
      this.setState({ randomKai: null })
    }
  }

  // componentDidMount () {
  //     console.log('-------------tes--------------');
  // }
  randomKaiArray() {
    this.setState({ randomKai: new Array(5).fill(0).map(() => Math.floor(Math.random() * 10)) })
  }

  render() {
    const lastKai = this.props.lastKai
    const kaiArray = !!this.state.randomKai
      ? this.state.randomKai
      : lastKai && lastKai.KaiText && lastKai.KaiText != ""
      ? lastKai.KaiText.split(",")
      : [0, 0, 0, 0, 0]

    return (
      <div className="LastKaiArea">
        <div className="result">{lastKai != null ? lastKai.GameID : "---"}开奖结果</div>
        <div className="hx-item">
          哈希验证：
          {lastKai && lastKai.HashCode ? (
            <a className="hash-link" href={"https://tronscan.org/#/transaction/" + lastKai.HashCode} target="_blank">
              {numPreList.indexOf(this.props.lottoId) > -1 ? `${lastKai.HashCode.substr(0, 16)}...` : `...${lastKai.HashCode.substr(-16, 16)}`}
            </a>
          ) : (
            "正在获取"
          )}
          {lastKai && lastKai.HashCode ? (
            <a className="hash-btn" href={"https://tronscan.org/#/transaction/" + lastKai.HashCode} target="_blank"></a>
          ) : (
            false
          )}
          {lastKai && lastKai.HashCode ? (
            <a className="hash-link" href={"https://tronscan.org/#/transaction/" + lastKai.HashCode} target="_blank">
              <img src="data:image/png;base64,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" />
            </a>
          ) : (
            "正在获取"
          )}
        </div>
        {/*最新开奖内容-五张卡牌*/}
        <div className="latest_draw">
          {kaiArray.map((item, pos) => {
            return [
              <DynamicSvg key={`latest_draw_${pos}`} style={{ width: 50, height: 68 }} className="card" svgPath={`niuniu/heart${item}`} />,
              <div key={`latest_draw_block_${pos}`} className="block" />,
            ]
          })}
        </div>
      </div>
    )
  }
}
