import React, { useState, createRef } from "react"

import "./styleTeMa.scss"
import DisplayTeMaModal from "./displayTeMaModal"
// import { debounce } from 'lodash';
import util from "@/magic/util"

/***
 * 僅用於 -特碼- 信用投注
 */
export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      //信用盤-用
      selectedTRUSTList: [],
    }
    this.displayTeamModalQuickRef = createRef()
  }

  getLotteryRate(id) {
    // return this.props.LotteryRate[id] || "";
  }

  showModal(show) {
    this.displayTeamModalQuickRef.current?.showModal(show)
  }

  onModalBetCall() {
    this.props.onModalBetCall()
  }

  onUnitChange(unit) {}

  validate() {
    let config = this.props.config
    let selectedList = this.state.selectedTRUSTList
    //這邊直接判斷，不走配置

    if (selectedList.length < 0) {
      return `${config.list[0].title}至少需要选择1球`
    } else {
      return ""
    }
  }

  isSelected(ball) {
    return this.state.selectedTRUSTList.find((e) => {
      return e.key === ball && e.value > 0
    })
    return false
  }

  onCleanClick() {
    this.setState({
      selectedTRUSTList: [],
    })

    setTimeout(() => {
      this.emitChange()
    }, 500)
  }

  onSelectedDelete(ballTitle) {
    var nList = this.state.selectedTRUSTList.filter((item) => item.key !== ballTitle)
    this.setState({
      selectedTRUSTList: nList,
    })
    setTimeout(() => {
      this.emitChange()
    }, 500)
  }

  onSelectedChange(ballInfo, value) {
    var nList = []

    var text = ""
    var obj = null
    if (ballInfo.hasOwnProperty("text")) {
      text = ballInfo.text
      obj = ballInfo
    } else {
      text = ballInfo.key
      obj = ballInfo.obj
    }

    nList = [...this.state.selectedTRUSTList]
    nList = nList.filter((item) => item.key !== text)
    nList.push({
      key: text,
      value: value,
      obj: obj,
    })

    this.setState({
      selectedTRUSTList: nList,
    })

    setTimeout(() => {
      this.emitChange()
    }, 500)
  }

  render() {
    let config = this.props.config
    var lotteryRate = this.props.LotteryRate
    return (
      <div className={`tema ${this.props.mode}`}>
        <div className="top_bar">
          <div
            className={`mode ${this.props.mode === "normal" ? "active" : ""}`}
            onClick={() => {
              this.clear()
              setTimeout(() => {
                this.props.onModeChange && this.props.onModeChange("normal")
              }, 500)
            }}
          >
            快捷投注
          </div>
          <div
            className={`mode ${this.props.mode === "quick" ? "active" : ""}`}
            onClick={() => {
              this.clear()
              setTimeout(() => {
                this.props.onModeChange && this.props.onModeChange("quick")
              }, 500)
            }}
          >
            信用投注
          </div>
          <div className="block" />
          <img className="img" src={util.buildAssetsPath("images/LotteryPage/num_clean.png")} onClick={this.onCleanClick.bind(this)} />
        </div>

        <div className="filter_area insta" style={{ background: "transparent" }}>
          <div className="layer">
            <span className="title">{config.title}</span>
          </div>
        </div>

        <div className="bet-display pdt0 type-trust">
          <div className="layer">
            <div className="title">
              <span className="first">号码</span>
              <span className="second">赔率</span>
              <span>金额</span>
            </div>
            {config.list.map((item, rowIndex) => {
              let base = Math.ceil(item.list.length / 2)
              var first = item.list.slice(0, base)
              var comList = first.map((ball, ballIndex) => {
                var selectedBall = this.isSelected(ball.text)

                var odds = lotteryRate["Tm_" + ball.text]
                return (
                  <div key={ball.text + (selectedBall ? selectedBall.value : "")} className={`layer_bet_item column-${item.column}`}>
                    <div className={`layer_bet_ball circle with-odds ${ball.color} ${selectedBall ? "active" : ""} `}>{ball.text}</div>
                    <div className="layer_bet_odds">{odds}</div>
                    <TrustBetInput ballInfo={ball} selectedBall={selectedBall} onSelectedChange={this.onSelectedChange.bind(this)} />
                  </div>
                )
              })
              return comList
            })}
          </div>
          <div className="divider_horizon"></div>
          <div className="layer">
            <div className="title">
              <span className="first">号码</span>
              <span className="second">赔率</span>
              <span>金额</span>
            </div>

            {config.list.map((item, rowIndex) => {
              let base = Math.ceil(item.list.length / 2)
              var first = item.list.slice(base, item.list.length)
              var comList = first.map((ball, ballIndex) => {
                var selectedBall = this.isSelected(ball.text)

                var odds = lotteryRate["Tm_" + ball.text]
                return (
                  <div key={ball.text + (selectedBall ? selectedBall.value : "")} className={`layer_bet_item column-${item.column}`}>
                    <div className={`layer_bet_ball circle with-odds ${ball.color} ${selectedBall ? "active" : ""} `}>{ball.text}</div>
                    <div className="layer_bet_odds">{odds}</div>
                    <TrustBetInput ballInfo={ball} selectedBall={selectedBall} onSelectedChange={this.onSelectedChange.bind(this)} />
                  </div>
                )
              })
              return comList
            })}
          </div>
        </div>
        <DisplayTeMaModal
          ref={this.displayTeamModalQuickRef}
          isNormal={false}
          selectList={this.state.selectedTRUSTList}
          onModalBetCall={this.onModalBetCall.bind(this)}
          LotteryRate={this.props.LotteryRate}
          center={this.props.center}
          onSelectedChange={this.onSelectedChange.bind(this)}
          onSelectedDelete={this.onSelectedDelete.bind(this)}
          onListChange={() => {
            setTimeout(() => {
              this.emitChange()
            }, 0)
          }}
        />
      </div>
    )
  }

  clear() {
    this.setState({
      selectedTRUSTList: [],
    })
    setTimeout(() => {
      this.emitChange()
    }, 500)
  }

  getBetText() {
    let selectedList = this.state.selectedTRUSTList

    selectedList = selectedList.filter((e) => {
      return parseInt(e.value) > 0
    })
    var nList = selectedList.map((e) => {
      //注单 金额=号码｜金额=号码
      // 11=01|1=02|11=03|11=04|1=05|11=06
      return e.value + "=" + e.key
    })

    return nList.join("|")
  }

  getBetCount() {
    let selectedList = this.state.selectedTRUSTList
    selectedList = selectedList.filter((e) => {
      return parseInt(e.value) > 0
    })

    return selectedList.length
  }

  getTotalSpend() {
    let selectedList = this.state.selectedTRUSTList
    var totalPrice = 0
    selectedList.forEach((e) => {
      var amt = parseInt(e.value)
      if (amt > 0) {
        totalPrice += amt
      }
    })
    return totalPrice
  }

  //计算特码的最高金额=> 最高选取金额 * 最高赔率
  temaTrustTopWin() {
    var highestPrice = 0
    let selectedList = this.state.selectedTRUSTList
    selectedList.forEach((e) => {
      if (e.value > highestPrice) {
        highestPrice = e.value
      }
    })
    return highestPrice * this.getMaxRate()
  }

  getMaxRate() {
    var maxRate = 0

    let selectedList = this.state.selectedTRUSTList
    var BallList = selectedList.map((e) => e.key)
    BallList.forEach((key) => {
      var odds = this.props.LotteryRate["Tm_" + key]
      if (odds >= maxRate) {
        maxRate = odds
      }
    })
    return maxRate
  }

  emitChange() {
    this.props.onChange &&
      this.props.onChange({
        betCount: this.getBetCount(),
        maxRate: this.getMaxRate(),
        temaTrustCount: this.getTotalSpend(),
        temaTrustTopWin: this.temaTrustTopWin(),
      })
  }
}

const TrustBetInput = ({ onSelectedChange, selectedBall, ballInfo }) => {
  const [value, setValue] = useState(selectedBall ? selectedBall.value : "")
  var searchInput

  const handleChange = (e) => {
    var valu = e.target.value
    setValue(valu.replace(/[^0-9-]+/, ""))
  }

  const onCompleteEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()

    onSelectedChange(ballInfo, value)
  }

  const onEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (
      e.key === "Enter"
      // && e.target.value.length >= 1
    ) {
      //點擊return關閉focus
      searchInput.blur()
    }
  }
  return (
    <span className="layer_bet_amount">
      <input
        className="input"
        name="name"
        type="number"
        value={value}
        onKeyUp={onEnter}
        ref={(el) => (searchInput = el)}
        onBlur={onCompleteEdit}
        onChange={handleChange}
      />
    </span>
  )
}
