import React, { createRef } from "react"

import "./styleTeMa.scss"
// import {notification} from 'onsenui';
import DisplayTeMaModal from "./displayTeMaModal"
import util from "@/magic/util"

/***
 * 僅用於 -特碼 - 快捷投注
 */
export default class extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      selectedTRUSTList: [],
      currentFilterList: [],
    }
    this.displayTeMaModalRef = createRef()
  }

  getLotteryRate(id) {
    return this.props.LotteryRate[id] || ""
  }

  showModal(show) {
    this.displayTeMaModalRef.current?.showModal(show)
  }

  onModalBetCall() {
    this.props.onModalBetCall()
  }

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
    return this.state.selectedTRUSTList.find((e, index) => {
      return e.key === ball //  && e.value > 0
    })
    return false
  }

  //变更 UNIT
  onUnitChange(unit) {
    var nList = [...this.state.selectedTRUSTList]
    nList = nList.map((item) => {
      item.value = parseInt(unit)
      return item
    })

    this.setState({
      selectedTRUSTList: nList,
    })

    setTimeout(() => {
      this.emitChange()
    }, 500)
  }

  onCleanClick() {
    this.setState({
      selectedTRUSTList: [],
      currentFilterList: [],
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

    nList = [...this.state.selectedTRUSTList.filter((item) => `${item.key}` != `${text}`)]

    nList.push({
      key: text,
      value: parseInt(value),
      obj: obj,
    })
    this.setState({
      selectedTRUSTList: nList,
    })

    setTimeout(() => {
      this.emitChange()
    }, 500)
  }

  calWithFilter(filterList) {
    var zodicList = {
      SHU: [4, 16, 28, 40],
      NIU: [3, 15, 27, 39],
      HU: [2, 14, 26, 38],
      TU: [1, 13, 25, 37, 49],
      LONG: [12, 24, 36, 48],
      SE: [11, 23, 35, 47],
      MA: [10, 22, 34, 46],
      YANG: [9, 21, 33, 45],
      HOU: [8, 20, 32, 44],
      JI: [7, 19, 31, 43],
      GOU: [6, 18, 30, 42],
      ZHU: [5, 17, 29, 41],
    }

    // (year - 4) % 12

    var zodicNumList = [
      [1, 13, 25, 37, 49],
      [2, 14, 26, 38],
      [3, 15, 27, 39],
      [4, 16, 28, 40],
      [5, 17, 29, 41],
      [6, 18, 30, 42],
      [7, 19, 31, 43],
      [8, 20, 32, 44],
      [9, 21, 33, 45],
      [10, 22, 34, 46],
      [11, 23, 35, 47],
      [12, 24, 36, 48],
    ]

    const currentLunarYear = util.getLunarYear(this.props.nextDate)
    const zodiacAnimals = Object.keys(zodicList)
    const twAnimalsObj = new Array(12).fill(currentLunarYear).reduce((sum, year, index) => {
      return { ...sum, [zodiacAnimals[(year - index - 4) % 12]]: zodicNumList[index] }
    }, {})

    let red = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
      blue = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
      green = [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]
    let arr = []
    var filter = 0

    if (filterList.indexOf("DA") !== -1) filter += 0x2
    else if (filterList.indexOf("XIAO") !== -1) filter += 0x1

    if (filterList.indexOf("DAN") !== -1) filter += 0x4
    else if (filterList.indexOf("SHUANG") !== -1) filter += 0x8

    if (filterList.indexOf("HONG") !== -1) filter += 0x10
    else if (filterList.indexOf("LAN") !== -1) filter += 0x20
    else if (filterList.indexOf("LV") !== -1) filter += 0x40

    //从接口中 解析出 哪些 生肖的 内容
    var zodiacNumbers = []
    filterList.forEach((key, i) => {
      if (twAnimalsObj[key] != null) {
        zodiacNumbers.push(...twAnimalsObj[key])
      }
    })

    let config = this.props.config
    var ii = [...config.list]

    var nList = ii[0].list.map(function (item, i) {
      var num = parseInt(item.text)
      var f = (num < 25 ? 0x1 : 0x2) + (num % 2 == 0 ? 0x8 : 0x4)
      if (red.includes(num)) {
        f += 0x10
      } else if (blue.includes(num)) {
        f += 0x20
      } else if (green.includes(num)) {
        f += 0x40
      }

      item.flag = (f & filter) == filter && (zodiacNumbers.length > 0 ? zodiacNumbers.includes(num) : true)

      if (item.flag) {
        arr.push({
          key: item.text,
          value: isNaN(config.unit) ? 1 : config.unit,
          obj: item,
        })
      }
    })

    return {
      conf_list: nList,
      selectedTRUSTList: [...arr],
    }
  }

  checkActive(shengxiao) {
    return this.state.currentFilterList.indexOf(shengxiao) === -1 ? "" : "active"
  }

  onFilterClick(shengxiao) {
    var filterList = [...this.state.currentFilterList]
    var indexContains = filterList.indexOf(shengxiao)
    if (shengxiao === "ALL") {
      if (indexContains === -1) {
        filterList = ["ALL"]
      } else {
        filterList = []
      }
    } else {
      if (indexContains === -1) {
        if (shengxiao === "DA" || shengxiao === "XIAO") {
          filterList = filterList.filter((e) => {
            return e !== "DA" && e !== "XIAO"
          })
        } else if (shengxiao === "DAN" || shengxiao === "SHUANG") {
          filterList = filterList.filter((e) => {
            return e !== "DAN" && e !== "SHUANG"
          })
        } else if (shengxiao === "HONG" || shengxiao === "LAN" || shengxiao === "LV") {
          filterList = filterList.filter((e) => {
            return e !== "HONG" && e !== "LAN" && e !== "LV"
          })
        }
        filterList = filterList.filter((e) => {
          return e !== "ALL"
        })
        filterList.push(shengxiao)
      } else {
        filterList.splice(indexContains, 1)
      }
    }

    if (filterList.length === 0) {
      this.setState({
        currentFilterList: [],
        selectedTRUSTList: [],
      })
    } else {
      var calResult = this.calWithFilter(filterList)
      this.setState({
        currentFilterList: filterList,
        selectedTRUSTList: calResult["selectedTRUSTList"],
      })
    }

    setTimeout(() => {
      this.emitChange()
    }, 0)
  }

  getSpanButton(key, title) {
    const position =
      key === "All"
        ? ""
        : key === "DA" || key === "DAN" || key === "HONG"
        ? "left"
        : key === "XIAO" || key === "SHUANG" || key === "LV"
        ? "right"
        : key === "LAN"
        ? "middle"
        : "second"

    const className = `btn ${position} ${this.checkActive(key)}`
    return (
      <span className={className} onClick={this.onFilterClick.bind(this, key)}>
        {title}
      </span>
    )
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
        <div className="filter_area insta">
          <div className="layer">
            <span className="title">{config.title}</span>
            {/* TEST1234545
                        { this.getSpanButton('ALL', '全11') } */}
            <span className={`btn ${this.checkActive("ALL")}`} onClick={this.onFilterClick.bind(this, "ALL")}>
              全
            </span>

            <div className="group">
              <span className={`btn left ${this.checkActive("DA")}`} onClick={this.onFilterClick.bind(this, "DA")}>
                大
              </span>
              <span className={`btn right ${this.checkActive("XIAO")}`} onClick={this.onFilterClick.bind(this, "XIAO")}>
                小
              </span>
            </div>
            <div className="group">
              <span className={`btn left ${this.checkActive("DAN")}`} onClick={this.onFilterClick.bind(this, "DAN")}>
                单
              </span>
              <span className={`btn right ${this.checkActive("SHUANG")}`} onClick={this.onFilterClick.bind(this, "SHUANG")}>
                双
              </span>
            </div>
            <div className="group">
              <span className={`btn left ${this.checkActive("HONG")}`} onClick={this.onFilterClick.bind(this, "HONG")}>
                红
              </span>
              <span className={`btn mid ${this.checkActive("LAN")}`} onClick={this.onFilterClick.bind(this, "LAN")}>
                蓝
              </span>
              <span className={`btn right ${this.checkActive("LV")}`} onClick={this.onFilterClick.bind(this, "LV")}>
                绿
              </span>
            </div>
          </div>

          <div className="layer second">
            <span className={`btn second ${this.checkActive("SHU")}`} onClick={this.onFilterClick.bind(this, "SHU")}>
              鼠
            </span>
            <span className={`btn second ${this.checkActive("NIU")}`} onClick={this.onFilterClick.bind(this, "NIU")}>
              牛
            </span>
            <span className={`btn second ${this.checkActive("HU")}`} onClick={this.onFilterClick.bind(this, "HU")}>
              虎
            </span>
            <span className={`btn second ${this.checkActive("TU")}`} onClick={this.onFilterClick.bind(this, "TU")}>
              兔
            </span>
            <span className={`btn second ${this.checkActive("LONG")}`} onClick={this.onFilterClick.bind(this, "LONG")}>
              龙
            </span>
            <span className={`btn second ${this.checkActive("SE")}`} onClick={this.onFilterClick.bind(this, "SE")}>
              蛇
            </span>
            <span className={`btn second ${this.checkActive("MA")}`} onClick={this.onFilterClick.bind(this, "MA")}>
              马
            </span>
            <span className={`btn second ${this.checkActive("YANG")}`} onClick={this.onFilterClick.bind(this, "YANG")}>
              羊
            </span>
            <span className={`btn second ${this.checkActive("HOU")}`} onClick={this.onFilterClick.bind(this, "HOU")}>
              猴
            </span>
            <span className={`btn second ${this.checkActive("JI")}`} onClick={this.onFilterClick.bind(this, "JI")}>
              鸡
            </span>
            <span className={`btn second ${this.checkActive("GOU")}`} onClick={this.onFilterClick.bind(this, "GOU")}>
              狗
            </span>
            <span className={`btn second ${this.checkActive("ZHU")}`} onClick={this.onFilterClick.bind(this, "ZHU")}>
              猪
            </span>
          </div>
        </div>
        <div className="bet-display pdt0 type-insta">
          <div className="m-bd">
            {config.list.map((item, rowIndex) => {
              let subFilter = item.filter || []
              if (subFilter[0] instanceof Array) {
                subFilter = subFilter[this.state.subFilterIndex] || []
              }
              return (
                <div className={`box ${item.layout || ""} ${config.name}`} key={item.key || rowIndex}>
                  <div className="bd">
                    {item.list.map((ball, ballIndex) => {
                      var selectedBall = this.isSelected(ball.text)
                      var unit = isNaN(this.props.unit) ? 1 : this.props.unit
                      if (selectedBall) {
                        unit = -1
                      }
                      // console.log(lotteryRate['Tm_'+ball.key])
                      return (
                        <div
                          key={ball.text}
                          className={`item column-${item.column}`}
                          onClick={selectedBall ? this.onSelectedDelete.bind(this, ball.text) : this.onSelectedChange.bind(this, ball, unit)}
                        >
                          <div
                            className={`ball with-odds circle ${ball.color} ${selectedBall ? "active" : ""} ${
                              lotteryRate["Tm_Refunds"]?.[ballIndex] ? "refund" : ""
                            }`}
                          >
                            <p className="p1">{ball.text}</p>
                            <p className="p2">{lotteryRate["Tm_" + ball.text]}</p>
                          </div>
                        </div>
                      )
                    })}
                    <div></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <DisplayTeMaModal
          ref={this.displayTeMaModalRef}
          isNormal={true}
          unit={this.props.unit}
          center={this.props.center}
          selectList={this.state.selectedTRUSTList}
          onModalBetCall={this.onModalBetCall.bind(this)}
          onSelectedChange={this.onSelectedChange.bind(this)}
          onSelectedDelete={this.onSelectedDelete.bind(this)}
          LotteryRate={this.props.LotteryRate}
          onListChange={() => {
            setTimeout(() => {
              this.emitChange()
            }, 0)
          }}
        />
      </div>
    )
  }

  fillUnit(unit) {
    if (this.state.selectedTRUSTList.some((selected) => selected.value !== unit)) {
      const selectedTRUSTList = this.state.selectedTRUSTList.map((slted) => (slted.value !== unit ? { ...slted, value: unit } : slted))
      this.setState({ selectedTRUSTList })
      return selectedTRUSTList.length
    }
    return null
  }

  clear() {
    this.setState({
      selectedTRUSTList: [],
      currentFilterList: [],
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
    let selectedTRUSTList = this.state.selectedTRUSTList
    var totalPrice = 0
    selectedTRUSTList.forEach((e) => {
      totalPrice += parseInt(e.value)
    })
    return totalPrice
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
    this.props.onChange?.({
      betCount: this.getBetCount(),
      maxRate: this.getMaxRate(),
      temaTrustCount: this.getTotalSpend(),
      temaTrustTopWin: 0,
    })
  }
}
