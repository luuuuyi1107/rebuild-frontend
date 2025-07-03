import React, { createRef } from "react"

import "./style.scss"
import TemaBetDisplay from "./displayTeMa"
import TemaBetTrustDisplay from "./displayTeMaTrust"
import { notificationAsync } from "@/magic/notification"

function deleteFromObject(obj, tobeDeleteObj) {
  if (!obj || !tobeDeleteObj) {
    return false
  }
  let keys = Object.keys(tobeDeleteObj)
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    delete obj[key]
  }
  return obj
}

function isContainObject(mainObj, subObj) {
  if (!subObj || !mainObj) {
    return false
  }

  let keys = Object.keys(subObj)
  if (keys.length == 0) {
    return false
  }
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    if (mainObj[key] != subObj[key]) {
      return false
    }
  }
  return true
}

function isHasObject(obj, subObj) {
  if (!subObj || !obj) {
    return false
  }
  let keys = Object.keys(subObj)
  if (keys.length == 0) {
    return false
  }
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    if (obj[key] == subObj[key]) {
      return true
    }
  }
  return false
}

function isEmptyObject(obj) {
  if (!obj) {
    return true
  }
  let keys = Object.keys(obj)
  if (keys.length == 0) {
    return true
  }
  return false
}

export default class Display extends React.PureComponent {
  state = { mode: "normal" }

  constructor(props) {
    super(props)
    this.normalBetDisplayRef = createRef()
    this.quickBetDisplayRef = createRef()
  }
  onModeChange() {
    if (this.state.mode == "normal") {
      this.setState({ mode: "quick" })
    } else {
      this.setState({ mode: "normal" })
    }
  }

  onModeClick(mode) {
    this.setState({ mode: mode })
    this.props.onModeChange(mode)
  }

  onModalBetCall() {
    this.props.onModalBetCall()
  }

  onUnitChange(unit) {
    try {
      this.state.mode == "normal" ? this.normalBetDisplayRef.current?.onUnitChange(unit) : this.quickBetDisplayRef.current?.onUnitChange(unit)
    } catch (e) {}
  }

  /**
   * 是否从 footer中调用开启 在 display特码中的modal
   * @param isOpen
   * @returns {*}
   */
  showModal(isOpen) {
    return this.state.mode == "normal" ? this.normalBetDisplayRef.current?.showModal(isOpen) : this.quickBetDisplayRef.current?.showModal(isOpen)
  }

  getBetText() {
    return this.state.mode == "normal" ? this.normalBetDisplayRef.current?.getBetText() : this.quickBetDisplayRef.current?.getBetText()
  }

  clear() {
    return this.state.mode == "normal" ? this.normalBetDisplayRef.current?.clear() : this.quickBetDisplayRef.current?.clear()
  }

  fillUnit(unit) {
    if (this.state.mode !== "normal") return
    return this.normalBetDisplayRef.current?.fillUnit(unit)
  }

  getMaxRate() {
    try {
      return this.state.mode == "normal" ? this.normalBetDisplayRef.current?.getMaxRate() : this.quickBetDisplayRef.current?.getMaxRate()
    } catch (e) {
      return 0
    }
  }

  validate() {
    return this.state.mode == "normal" ? this.normalBetDisplayRef.current?.validate() : this.quickBetDisplayRef.current?.validate()
  }

  getBetTrustData() {
    return this.quickBetDisplayRef.current.state.selectedTRUSTList.map(({ key, value }) => ({
      key,
      value,
      rate: this.props.LotteryRate[this.props.config.odds + "_" + key],
    }))
    // console.log(this.props.config.odds)
  }

  render() {
    let config = this.props.config
    if (config.specialType != null && config.specialType === "tema_area") {
      return this.state.mode == "normal" ? (
        <TemaBetDisplay
          {...this.props}
          ref={this.normalBetDisplayRef}
          center={this.props.center}
          config={config}
          mode={this.state.mode}
          onModalBetCall={this.onModalBetCall.bind(this)}
          onModeChange={this.onModeClick.bind(this)}
        />
      ) : (
        <TemaBetTrustDisplay
          {...this.props}
          ref={this.quickBetDisplayRef}
          center={this.props.center}
          config={config}
          mode={this.state.mode}
          onModalBetCall={this.onModalBetCall.bind(this)}
          onModeChange={this.onModeClick.bind(this)}
        />
      )
    } else {
      return this.state.mode == "normal" ? (
        <NormalBetDisplay
          {...this.props}
          ref={this.normalBetDisplayRef}
          config={config}
          mode={this.state.mode}
          onModeChange={this.onModeChange.bind(this)}
        />
      ) : (
        <QuickBetDisplay
          {...this.props}
          ref={this.quickBetDisplayRef}
          config={config.quickMode}
          mode={this.state.mode}
          onModeChange={this.onModeChange.bind(this)}
        />
      )
    }
  }
}

class NormalBetDisplay extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      selectedList: [],
      globalFilter: {},
      filterList: [],
      subFilterIndex: 0,
    }
  }

  getLotteryRate(id) {
    return this.props.LotteryRate[id] || ""
  }

  fillUnit(unit) {
    return this.getBetCount()
  }

  validate() {
    let config = this.props.config
    let selectedList = this.state.selectedList
    for (let i = 0, len = config.list.length; i < len; i++) {
      if (typeof config.list[i].minBallNumber !== "undefined") {
        if (!selectedList[i] || selectedList[i].length < config.list[i].minBallNumber) {
          return `${config.list[i].title}至少需要选择${config.list[i].minBallNumber}球`
        }
      }
      if (typeof config.list[i].maxBallNumber !== "undefined") {
        if (selectedList[i] && selectedList[i].length > config.list[i].maxBallNumber) {
          return `${config.list[i].title}最多选择${config.list[i].minBallNumber}球`
        }
      }
    }

    return ""
  }

  isSelected(ball, rowIndex) {
    let selectList = this.state.selectedList[rowIndex] || []
    for (let i = 0; i < selectList.length; i++) {
      if (selectList[i].text == ball.text) {
        return true
      }
    }
    return false
  }

  isGlobalFilterSelect(currentFilter) {
    return isContainObject(this.state.globalFilter, currentFilter)
  }

  isGroupFilterSelect(currentFilter, rowIndex) {
    return isContainObject(this.state.filterList[rowIndex], currentFilter)
  }

  filterGlobal() {
    let config = this.props.config
    let filter = this.state.globalFilter
    let selectedList = []
    if (!isEmptyObject(filter)) {
      for (let i = 0, len = config.list.length; i < len; i++) {
        for (let j = 0, groupLen = config.list[i].list.length; j < groupLen; j++) {
          let ball = config.list[i].list[j]
          if (!selectedList[i]) {
            selectedList[i] = []
          }

          if (config.filterLogic && config.filterLogic == "or") {
            //过滤逻辑是 "或"
            if (isHasObject(ball, filter)) {
              selectedList[i].push(ball)
            }
          } else {
            //过滤逻辑是 "且"
            if (isContainObject(ball, filter)) {
              selectedList[i].push(ball)
            }
          }
        }
      }
      this.setState({ filterList: [] })
    }
    this.setState({ selectedList: selectedList })
    setTimeout(() => {
      this.emitChange()
    }, 0)
  }

  filterGroup(index) {
    let config = this.props.config
    let filter = this.state.filterList[index] || {}
    let selectedList = Object.assign([], this.state.selectedList)
    selectedList[index] = []
    if (!isEmptyObject(filter)) {
      for (let i = 0, len = config.list[index].list.length; i < len; i++) {
        let ball = config.list[index].list[i]
        if (config.filterLogic && config.filterLogic == "or") {
          //过滤逻辑是 "或"
          if (isHasObject(ball, filter)) {
            selectedList[index].push(ball)
          }
        } else {
          if (isContainObject(ball, filter)) {
            selectedList[index].push(ball)
          }
        }
      }
    }
    this.setState({ selectedList: selectedList })
    setTimeout(() => {
      this.emitChange()
    }, 0)
  }

  onFilter(filterInstance, index) {
    //debugger;
    if (index == null) {
      //清空
      if (typeof filterInstance.subFilterIndex != undefined) {
        this.setState({ subFilterIndex: filterInstance.subFilterIndex || 0 })
      }
      if (filterInstance.filter == null) {
        this.setState({ globalFilter: {}, filterList: [] })
      } else {
        //全局过滤
        let globalFilter = Object.assign({}, this.state.globalFilter)
        if (this.isGlobalFilterSelect(filterInstance.filter)) {
          deleteFromObject(globalFilter, filterInstance.filter)
        } else {
          globalFilter = Object.assign(globalFilter, filterInstance.filter)
        }
        this.setState({ globalFilter: globalFilter })
      }

      setTimeout(() => {
        this.filterGlobal()
      }, 0)
    } else {
      //组过滤
      let filterList = Object.assign({}, this.state.filterList)
      //清空
      if (filterInstance.filter == null) {
        filterList[index] = {}
        this.setState({ filterList: filterList })
      } else {
        // let currentFilter = Object.assign({}, this.state.filterList[index])
        // if (this.isGroupFilterSelect(filterInstance.filter, index)) {
        //   deleteFromObject(currentFilter, filterInstance.filter)
        // } else {
        //   currentFilter = Object.assign(currentFilter, filterInstance.filter)
        // }
        filterList[index] = filterInstance.filter

        console.log({ filterList, index, instance: filterInstance.filter })
        this.setState({ filterList: filterList })
      }

      setTimeout(() => {
        this.filterGroup(index)
      }, 0)
    }
  }

  selectBall(ball, rowIndex) {
    let selectedList = Object.assign([], this.state.selectedList)
    if (this.isSelected(ball, rowIndex)) {
      let row = selectedList[rowIndex]
      let tempList = row.filter((b) => b.text != ball.text)
      selectedList[rowIndex] = tempList
    } else {
      let config = this.props.config
      if (!selectedList[rowIndex]) {
        selectedList[rowIndex] = []
      }

      //判断最大球数限制
      let maxBallNumber = config.list[rowIndex].maxBallNumber
      if (maxBallNumber && selectedList[rowIndex].length >= maxBallNumber) {
        return notificationAsync.alert(`最多可选择${maxBallNumber}球`, {
          title: `操作提示`,
        })
      }

      //判断互斥球 组内互斥
      if (ball.mutex) {
        selectedList[rowIndex] = selectedList[rowIndex].filter((item) => item.mutex != ball.mutex)
      }
      if (ball.mutex2) {
        selectedList[rowIndex] = selectedList[rowIndex].filter((item) => item.mutex2 != ball.mutex2)
      }

      //全局互斥
      if (ball.globalMutex) {
        for (let i = 0; i < selectedList.length; i++) {
          selectedList[i] = selectedList[i].filter((item) => item.globalMutex != ball.globalMutex)
        }
      }

      selectedList[rowIndex].push(ball)
    }
    this.setState({ selectedList: selectedList })

    setTimeout(() => {
      this.emitChange()
    }, 0)
  }

  render() {
    let config = this.props.config
    const getMaxLabelSize = (list) => {
      let len = 0
      for (let i = 0; i < list.length; i++) {
        if (list[i].title && list[i].title.length > len) {
          len = list[i].title.length
        }
      }
      return len
    }
    const getMoreBtnRightDistanse = () => {
      let filter = config.filter
      if (!filter && config.list[0] && config.list[0].filter) {
        filter = config.list[0].filter
      }
      if (!filter) {
        return 0.2
      }
      let textNumber = 0
      for (let i = 0; i < filter.length; i++) {
        textNumber += filter[i].text.length
      }

      return filter.length * 0.3 + textNumber * 0.26 + 0.4 + "rem"
    }

    let titleLen = getMaxLabelSize(config.list)

    return (
      <div className={`bet-display ${this.props.mode}`}>
        {config.listName && (
          <div
            className="mode-btn"
            style={{ right: getMoreBtnRightDistanse() }}
            onClick={() => {
              this.props.onModeChange && this.props.onModeChange()
            }}
          >
            {config.listName}
          </div>
        )}
        {(config.title || config.filter) && (
          <div className="m-hd">
            <span className="title">{config.title}</span>
            {config.filter && (
              <div className="filter">
                {config.filter.map((item) => {
                  return (
                    <span
                      key={item.text}
                      className={`${this.isGlobalFilterSelect(item.filter) ? "on" : ""}`}
                      onClick={this.onFilter.bind(this, item, null)}
                    >
                      {item.text}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="m-bd">
          {config.list.map((item, rowIndex) => {
            let subFilter = item.filter || []
            if (subFilter[0] instanceof Array) {
              subFilter = subFilter[this.state.subFilterIndex] || []
            }

            return (
              <div className={`box ${item.layout || ""} ${config.name}`} key={item.key || rowIndex}>
                {(subFilter.length > 0 || item.title) && (
                  <div className="hd">
                    <span className={`title len-${titleLen}`}>{item.title}</span>
                    {subFilter.length > 0 && item.layout != "row" && (
                      <div className="filter">
                        {subFilter.map((f) => {
                          return (
                            <span
                              key={f.text}
                              className={`${this.isGroupFilterSelect(f.filter, rowIndex) ? "on" : ""}`}
                              onClick={this.onFilter.bind(this, f, rowIndex)}
                            >
                              {f.text}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="bd">
                  {item.list.map((ball, ballIndex) => {
                    return (
                      <div key={ball.key || ballIndex} className={`item column-${item.column}`} onClick={this.selectBall.bind(this, ball, rowIndex)}>
                        <div
                          className={`ball ${ball.shape ? ball.shape : "circle"} ${ball.color} ${this.isSelected(ball, rowIndex) ? "active" : ""} ${
                            ball.odds ? "with-odds" : ""
                          } ${ball.refund ? "refund" : ""}`}
                        >
                          <p className="p1">{ball.text}</p>
                          {ball.odds && (
                            <p className="p2">
                              赔{window.innerWidth > 360 ? "率" : ""}:{this.getLotteryRate(ball.odds)}
                            </p>
                          )}
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
    )
  }

  clear() {
    this.setState({
      selectedList: [],
      globalFilter: {},
      filterList: [],
    })
  }

  getBetText() {
    let config = this.props.config
    let selectedList = this.state.selectedList
    if (config.betText) {
      return config.betText(selectedList, this.props.LotteryRate, config, this.props.unit)
    } else {
      let listRes = []
      for (let i = 0; i < config.list.length; i++) {
        listRes.push("")
      }
      for (let i = 0; i < selectedList.length; i++) {
        if (selectedList[i]) {
          let tmp = selectedList[i].map((item) => item.value || item.text)
          listRes[i] = tmp.join(",")
        }
      }
      return listRes.join("|")
    }
  }

  getBetCount() {
    let config = this.props.config
    if (config.betCount) {
      return config.betCount(this.state.selectedList, this.props.LotteryRate, config, this.props.unit)
    } else {
      //基础算法，计算球数量
      let count = 0
      let selectedList = this.state.selectedList
      for (let i = 0; i < selectedList.length; i++) {
        if (selectedList[i]) {
          count += selectedList[i].length
        }
      }
      return count
    }
  }

  getMaxRate() {
    let config = this.props.config
    let lottoryRate = this.props.LotteryRate
    if (config.maxRate) {
      return config.maxRate(this.state.selectedList, this.props.LotteryRate, config, this.props.unit)
    } else {
      let maxRate = lottoryRate[config.odds] || 0
      let selectedList = this.state.selectedList
      let lotteryRate = this.props.LotteryRate
      for (let i = 0; i < selectedList.length; i++) {
        let odds = selectedList[i].odds
        if (odds && lotteryRate[odds] && lotteryRate[odds] > maxRate) {
          maxRate = lotteryRate[odds]
        }
      }
      return maxRate
    }
  }

  emitChange() {
    this.props.onChange &&
      this.props.onChange({
        betCount: this.getBetCount(),
        maxRate: this.getMaxRate(),
        temaTrustCount: 0,
        temaTrustTopWin: 0,
      })
  }
}

class QuickBetDisplay extends NormalBetDisplay {
  getBetText() {
    let config = this.props.config
    if (config.betText) {
      return config.betText(this.state.selectedList, this.props.LotteryRate, config, this.props.unit)
    } else {
      let position = this.state.selectedList[0] || []
      let balls = this.state.selectedList[1] || []
      let tmp = balls.map((item) => item.text)
      tmp = tmp.join(",")
      let result = []
      for (let i = 0; i < config.list[0].list.length; i++) {
        result.push("")
      }
      for (let i = 0; i < position.length; i++) {
        result[position[i].index] = tmp
      }
      return result.join("|")
    }
  }

  getBetCount() {
    let config = this.props.config
    if (config.betCount) {
      return config.betCount(this.state.selectedList, this.props.LotteryRate, config, this.props.unit)
    } else {
      //基础算法，计算球数量
      let count = 0
      let selectedList = this.state.selectedList
      count = selectedList[0].length * selectedList[1].length
      return count
    }
  }
}
