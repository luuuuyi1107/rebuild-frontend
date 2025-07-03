import React from "react"
// import ReactDOM from 'react-dom';

import "./style.scss"
import { Icon } from "react-onsenui"
import DynamicSvg from "@/components/DynamicSvg"
import { notificationAsync } from "@/magic/notification"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      enter_amount: "",
      cur_bet_btn: -1,
    }
  }

  updateCoin(posit) {
    if (posit === 0 && !this.state.enter_amount) {
      this.setCustomBet()
      return
    }
    this.setState({ cur_bet_btn: posit })
    this.props.updateCoinParent(posit)
  }

  setEnterAmount(enter_amount) {
    this.setState({ enter_amount })
    this.updateCoin(0)
    if (enter_amount === 0) this.setState({ cur_bet_btn: -1 })

    setTimeout(() => {
      this.props.onBetAmountChange(this.state.enter_amount)
    }, 0)
  }

  setCustomBet() {
    notificationAsync.prompt("请设置筹码金额", { title: "自定义筹码", cancelable: false }).then((res) => {
      if (res !== null) {
        if (isNaN(res) || parseInt(res) > 500000 || !/^[0-9]+$/.test(res)) {
          notificationAsync.alert("金额设置错误", { title: "金额设置错误", cancelable: true })
        } else if (this.props.bets.some((bet) => bet == res)) {
          notificationAsync.alert("金额设置重复", { title: "金额设置重复", cancelable: true })
        } else {
          // this.setState({ enter_amount: parseInt(res) });
          // setTimeout(() => {
          //     this.props.onBetAmountChange(this.state.enter_amount)
          // }, 0);
          this.setEnterAmount(res)
          // this.props.generateIcon();
        }
      }
    })
  }
  0
  render() {
    return (
      <div className="niuniu_footer">
        <div className="first_lv">
          <div className="highest">
            最高可中{this.props.maxPrize}元{this.props.isDoubleMode && `，预扣金最高可退${this.props.prepayOfBet}元 `}
          </div>
          <div className="flex_block" />
          <div className="balance">{this.props.user ? this.props.user.Money : 0}元</div>
          <div className="reload">
            <Icon className="ic" icon="ion-refresh" />
          </div>
        </div>
        <div className="sec_lv">
          <div className="clear_all" onClick={() => this.props.clearCoin()}>
            清空
          </div>
          <div className="total_bet">
            共{this.props.numberOfBet}注，{this.props.amountOfBet || 0.0}元{this.props.isDoubleMode && `，预扣${this.props.prepayOfBet}元`}
          </div>
        </div>
        <div className="bet_lv">
          {this.props.bets.map((num, idx) => {
            const key = num === 0 ? 0 : idx + 1
            const isSel = this.state.cur_bet_btn === key
            const enterStyle =
              !this.state.enter_amount || this.state.enter_amount.length < 5 ? "" : this.state.enter_amount.length === 5 ? " max" : " max2"

            return (
              <div id={key === 0 ? "custom-coin" : ""}>
                {num === 0 && (
                  <div className={`enter-amount${isSel ? " sel" : ""}${enterStyle}`}>
                    {!!this.state.enter_amount ? (
                      this.state.enter_amount.split("").map((n, idx) => <div key={idx + "-" + n} className={`num${n}`} />)
                    ) : (
                      <div className="numq" />
                    )}
                  </div>
                )}

                {num > 0 && (
                  <div className={`enter-amount${isSel ? " sel" : ""}`}>
                    {(num + "").split("").map((n, idx) => (
                      <div key={idx + "-" + n} className={`num${n}`} />
                    ))}
                  </div>
                )}

                {num === 0 && !!this.state.enter_amount && (
                  <Icon onClick={this.setEnterAmount.bind(this, 0)} icon="ion-close" className="icon_remove" />
                )}

                <DynamicSvg
                  key={`bet_${num}`}
                  pathKey={`niuniu__bet_${num > 0 ? num : "c"}`}
                  onClick={this.updateCoin.bind(this, key)}
                  className={`bet_amount_btn ${isSel ? "sel" : ""}`}
                />
              </div>
            )
          })}
          {/* <input placeholder="请输入金额"
                    autoComplete="withdraw-money"
                    autoCapitalize="off"
                    autoCorrect="off"
                    className="amount_input"
                    name="amount"
                    type="tel"
                    maxLength={7}
                    onChange={e => {
                        this.setState({enter_amount: e.target.value.replace(/[^\d]/g, '')})
                    }}
                    onBlur={() => this.props.onBetAmountChange(this.state.enter_amount)}
                    value={this.state.enter_amount}/> */}

          <div className="block_right" />
          <div className="bet_now_btn" onClick={this.props.onBetSend}>
            立即投注
          </div>
        </div>
      </div>
    )
  }
}
//
