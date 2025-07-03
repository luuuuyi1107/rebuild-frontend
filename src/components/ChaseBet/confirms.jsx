import { useState, useEffect, useMemo, useImperativeHandle, forwardRef, useRef } from "react"
import Dropdown from "@/components/Dropdown"
import classNames from "classnames"
import _ from "lodash"
import { notificationAsync } from "@/magic/notification"

export default forwardRef((props, ref) => {
  const isComputed = _.get(props, "gameConfig.isComputed", false)
  const periodNum = useMemo(() => {
    const _periodText = _.get(props.openLottery, "NewKai.GameID", "0-0")
    return parseInt(_periodText.includes("-") ? _periodText.split("-")[1] : _periodText)
  }, [props.openLottery])
  const betData = props.forceSingle
    ? [
        {
          ball: props.gameConfig.title,
          value: props.betData.map((bet) => bet.value).join("|"),
          unit: props.betData[0].unit,
          rate: props.betData[0].rate,
        },
      ]
    : props.betData

  const [selectedBet, setSelectedBet] = useState(betData[0])
  const TIMES_LIMIT = 99
  const selectKey = useMemo(() => selectedBet.ball + "_" + selectedBet.value, [selectedBet])
  const timeRef = useRef(0)
  const [betValues, setBetValues] = useState(
    betData.reduce(
      (sum, _bet) => ({
        ...sum,
        [_bet.ball + "_" + _bet.value]: new Array(props.betPeriodNum)
          // .fill(_bet.unit * (!isComputed ? _bet.value.split(",").length : 1) * props.baseUnit * (isComputed ? props.betCount : 1)) // * (props.isMultipleLevel ? props.baseUnit : 1)
          .fill(_bet.unit) // * (props.isMultipleLevel ? props.baseUnit : 1)
          .map((value, idx) => value * (props.isDouble ? Math.pow(props.times, idx) : 1)),
      }),
      {}
    )
  )

  const selectBetValues = useMemo(() => {
    const ballLength = selectKey.split("_")[1].split(",").length
    const list = betValues[selectKey] || []
    return list.map((unit) => unit * (!isComputed ? ballLength : 1) * props.baseUnit * (isComputed ? props.betCount : 1))
  }, [betValues, selectKey])

  const betPeriod = new Array(props.betPeriodNum)
    .fill(periodNum)
    .filter((_, i) => selectBetValues[i] > 0)
    .map((v, i) => v + i)

  const total = useMemo(() => {
    const price = Object.values(betValues).reduce((sum, current, index) => {
      const ballLength = betData[index].value.split(",").length

      // current.map((val) => val * ballLength)

      return sum + _.sum(current.map((val) => val * (!isComputed ? ballLength : 1) * props.baseUnit * (isComputed ? props.betCount : 1)))
    }, 0)
    return { bet: props.betCount * betPeriod.length, price }
  }, [betValues])

  function selectChangeEvent(value) {
    const [ball, _value] = value.split("-")
    const _selected = _.find(betData, (_bet) => _bet.ball == ball && _bet.value == _value)
    setSelectedBet(_selected)
  }

  function modifyBetValue(value, key, index) {
    let val = typeof value === "number" ? value : parseInt(value.replace(/[^0-9.]/g, "")) // 只保留数字和小数点
    if (isNaN(val)) {
      val = ""
    }

    const _betValues = _.clone(betValues)
    _.set(_betValues, `${key}[${index}]`, val)
    setBetValues(_betValues)
  }

  function getRate(current, accumulate, betRate) {
    const accumulateMoney = current + accumulate
    const rate = ((current * betRate - accumulateMoney) / accumulateMoney) * 100
    return rate
  }

  function computerNewValue(accumulateMoney, currentMoney, rate) {
    let newMoney = currentMoney + 1
    while (getRate(newMoney, accumulateMoney, rate) < props.profitRate) {
      newMoney += 1
      if (newMoney / props.originBet > TIMES_LIMIT) {
        newMoney = 0
        break
      }
    }
    return Promise.resolve(newMoney)
  }

  async function handleBetValue(key, betValues, start = 0) {
    const [ball, value] = key.split("_")
    const _betOption = betData.find((bet) => bet.ball == ball && bet.value == value)
    if (timeRef.current > 100) return
    timeRef.current += 1
    for (let i = start; i < props.betPeriodNum; i++) {
      const accumulateMoney = _.sum(_.take(betValues, i)) + betValues[i]
      if (((betValues[i] * _betOption.rate - accumulateMoney) / accumulateMoney) * 100 < props.profitRate) {
        const newValue = await computerNewValue(accumulateMoney - betValues[i], betValues[i], _betOption.rate)
        if (newValue === 0) {
          betValues.forEach((_, index) => {
            if (index >= i) modifyBetValue(0, key, index)
          })
          break
        } else {
          modifyBetValue(newValue, key, i)
          await handleBetValue(key, betValues)
        }

        break
      }
    }
  }

  function getProfitRate(current, accumulateMoney) {
    return !!selectedBet.rate ? (((current * selectedBet.rate - accumulateMoney) / accumulateMoney) * 100).toFixed(2) : ""
  }

  useEffect(() => {
    if (props.isDouble) return
    Promise.all(
      Object.entries(betValues).map(async ([key, values]) => {
        timeRef.current = 0
        await handleBetValue(key, values)
      })
    ).then(() => {
      if (_.values(betValues).some((values) => values.filter((value) => value).length < props.betPeriodNum)) {
        notificationAsync.toast(`系统自动过滤超过${TIMES_LIMIT}倍期单`, { timeout: 1000, class: "center-toast", animation: "fade" })
      }
    })
  }, [])

  useImperativeHandle(ref, () => ({ betValues, periodNum }), [])

  return (
    <div className="chase-confirm-body">
      <div className="py-0.5 -mx-1 -mt-1 shadow bg-white">
        <Dropdown
          value={selectedBet.ball + "-" + selectedBet.value}
          onChange={selectChangeEvent}
          options={betData.map((bet) => ({
            label: `【${props.betNameList[bet.ball - 1] || props.gameConfig.title}】${bet.value} @${bet.rate || ""}`,
            value: bet.ball + "-" + bet.value,
            className: selectedBet.ball == bet.ball && selectedBet.value == bet.value ? "active" : null,
          }))}
        />
      </div>

      <div className={classNames("item-list", { double: props.isDouble })}>
        <div className="list-head">
          <div>序号</div>
          <div>期号</div>
          {props.isDouble && <div>倍数</div>}
          <div>投注金额</div>
          {!props.isDouble && (
            <>
              <div>累积投注金额</div>
              <div>利润率</div>
            </>
          )}
        </div>
        <div className="list-body">
          {betPeriod.map((period, i) => {
            const accumulateMoney = _.sum(_.take(selectBetValues, i)) + selectBetValues[i]
            return (
              <div key={period}>
                <div>{i + 1}</div>
                <div>{period}</div>
                {props.isDouble && <div>{props.times}</div>}
                {/* <div>{selectedBet.rate}</div> */}
                <div className="flex justify-center">
                  {selectBetValues[i]}
                  {/* <input
                    value={betValues[selectKey][i]}
                    onChange={(event) => {
                      event.target.value = event.target.value.replace(/[^\d]/g, "")
                      if (event.target.value === "0") return
                      modifyBetValue(event.target.value, selectKey, i)
                    }}
                  /> */}
                  {/* {betValues[selectKey][i] != selectBetValues[i] && <div>({selectBetValues[i]})</div>} */}
                  {/* <div>({selectBetValues[i]})</div> */}
                </div>

                {!props.isDouble && (
                  <>
                    <div>{accumulateMoney}</div>
                    <div>{`${getProfitRate(selectBetValues[i], accumulateMoney)}%`}</div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="text-center text-[14px] py-1">
        共追号 <span className="text-red-600">{betPeriod.length}</span>期 <span className="text-red-600">{total.bet}</span>注，总金额
        <span className="text-theme"> {total.price}</span> 元
      </div>
      <div>{props.children}</div>
    </div>
  )
})
