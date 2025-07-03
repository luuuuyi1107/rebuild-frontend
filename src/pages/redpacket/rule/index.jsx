import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"

import ModalPage from "@/components/ModalPage"

import "./style.scss"

export default class extends React.PureComponent {
  state = {
    showDetail: false,
    showQA: false,
  }

  render() {
    return (
      <LayoutPage center="玩法规则" className="redpacket-rule" right={null}>
        <div className="content">
          <img src={util.buildAssetsPath("/file/reds/rules.png")} />
          <p
            className="p1"
            onClick={() => {
              this.setState({ showDetail: true })
            }}
          ></p>
          <p
            className="p2"
            onClick={() => {
              this.setState({ showQA: true })
            }}
          ></p>
        </div>
        <ModalPage
          isOpen={this.state.showDetail || this.state.showQA}
          animation="lift"
          className="rule-model"
          onClose={() => {
            this.setState({ showDetail: false, showQA: false })
          }}
        >
          {this.state.showDetail && (
            <LayoutPage className="intro" center={"玩法介绍"} right={null}>
              <div className="content">
                <img src={util.buildAssetsPath("/file/reds/intro.png")} style={{ width: "100%" }} />
              </div>
            </LayoutPage>
          )}

          {this.state.showQA && (
            <LayoutPage center={"常见问题"} right={null}>
              <div className="qa">
                <div className="box">
                  <div className="hd">
                    <span>①扫雷红包的优势！</span>
                  </div>
                  <div className="bd">
                    {" "}
                    扫雷红包为一款大众娱乐性极强的即时对战性游戏，相比较日常的微信红包风控严格的情况，扫雷红包具有更强的隐蔽性和安全性！它采用了德国四维空间加密以及国密20+1算法相结合，为您的娱乐保驾护航！{" "}
                  </div>
                </div>
                <div className="box">
                  <div className="hd">
                    <span>②扫雷玩法</span>
                  </div>
                  <div className="bd">
                    {" "}
                    红包金额：30-10000元 红包数量：7-10包，可发可抢，发包者指定雷数0-9，抢包者抢到指定雷数，则需赔付发包者1.6倍发包金额！
                  </div>
                </div>
                <div className="box">
                  <div className="hd">
                    <span>③无法抢红包！</span>
                  </div>
                  <div className="bd">
                    为防止恶意跑包，抢包者余额需要达到发包金额的1.6倍，如发包金额为30元，则您的余额需要达到48元才可以参与抢包！
                  </div>
                </div>
                <div className="box">
                  <div className="hd">
                    <span>④如何查看自己发包和抢包的流水明细</span>
                  </div>
                  <div className="bd">点击【扫雷报表】即可查阅您的历史发包和抢包流水明细，盈亏尽在您的掌握！</div>
                </div>
                <div className="box">
                  <div className="hd">
                    <span>⑤游戏卡顿问题！</span>
                  </div>
                  <div className="bd">
                    扫雷红包采用的是空间四维运行模式，对网络的要求较高，因此当您遇到游戏卡顿的情况，建议您关闭手机其他运行软件，并且打开飞行模式再关闭，亦或者清除下浏览器记录与缓存，重新登入游戏试试，以上方式您都尝试后卡顿问题还未解决的话，建议您联系一下在线客服，提供一下您卡顿的相关截图，我们将派专员为您进一步解决处理，谢谢！
                  </div>
                </div>
              </div>
            </LayoutPage>
          )}
        </ModalPage>
      </LayoutPage>
    )
  }
}
