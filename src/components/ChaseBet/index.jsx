import { useState, useMemo, useEffect, useRef } from "react"
import "./style.scss"
import { Icon } from "react-onsenui"
import Settings from "./settings"
import Confirms from "./confirms"
import Bus from "@/magic/EventsBus"
import util from "@/magic/util"
import _ from "lodash"
import { setBetTask } from "@/action/apis"
import { gameList } from "@/config/game"
import { notificationAsync } from "@/magic/notification"

const gameTypeIds = _(gameList)
  .groupBy((item) => item.type)
  .mapValues((val) => _.map(val, "id"))
  .value()

export default (props) => {
  const [isSetting, setIsSetting] = useState(true)
  const [isDouble, setIsDouble] = useState(false)
  const [keepChase, setKeepChase] = useState(true)
  const [openLottery, setOpenLottery] = useState(props.OpenLottery)
  const title = useMemo(() => (isSetting ? "追号" : "确认追号") + "计划", [isSetting])
  const confirmRef = useRef(null)
  const [profitRate, setProfitRate] = useState(10)
  const [times, setTimes] = useState(2)
  const lx = util.getUrlParam("lx")
  const id = util.getUrlParam("id")
  const [betData, setBetData] = useState(
    _.chain(props.betText)
      .split("|")
      // .map((values, index) => values.split(",").map((value) => ({ ball: index + 1, value, unit: props.unit, rate: rateData[index][value] })))
      .map((value, index) => {
        const rateValueKey = generateValueKey(value)
        const rate = !value ? "" : props.rate[index][rateValueKey]
        return {
          ball: index + 1,
          value,
          unit: props.unit,
          rate,
        }
      })
      .flatten()
      .remove((bet) => !!bet.value)
      .value()
  )
  const [betPeriodNum, setBetPeriodNum] = useState(10)

  const forceSingle = useMemo(() => props.gameConfig.list.length > 1 && props.gameConfig.isComputed, [props.gameConfig])

  function generateValueKey(betValue) {
    const useSingleValue = [{ idlist: gameTypeIds.ks, lxlist: ["6"] }]
    return useSingleValue.some((singleVal) => singleVal.idlist.includes(id) && singleVal.lxlist.includes(lx)) ? betValue : betValue.split(",")[0]
  }

  function removeBetEvent(bet) {
    setBetData(_.pullAllWith(betData.slice(), [bet], (b1, b2) => b1.ball === b2.ball && b1.value === b2.value))
  }

  function updateBetEvent(bet) {
    setBetData(
      betData.slice().map((_bet) => {
        return _bet.ball === bet.ball || forceSingle ? { ..._bet, unit: bet.unit } : _bet
      })
    )
  }

  function updateLotteryData(openLottery) {
    setOpenLottery((prev) => {
      return _.isEqual(prev, openLottery) ? prev : openLottery
    })
  }

  function createChaseTask() {
    if (_.values(confirmRef.current.betValues).some((betValues) => betValues.some((val) => val === ""))) {
      notificationAsync.toast("投注金额不得空白", { timeout: 1000, class: "center-toast", animation: "fade" })
      return
    }
    let moneys = ""

    if (props.gameConfig.isComputed) {
      moneys = _.values(confirmRef.current.betValues)[0]
        // .map((value) => {
        //   const isTimes = (props.gameConfig.baseUnit ?? 1) > 1
        //   return isTimes ? props.unit : value //
        // })
        .filter((value) => value > 0)
        .join("#")
    } else {
      moneys = _.zipWith(..._.values(confirmRef.current.betValues), (...values) => {
        return values.filter((val) => val > 0).join("|")
      })
        .filter((vals) => {
          return vals.length > 0 && vals != "0"
        })
        .join("#")
    }

    setBetTask(id, lx, moneys, props.betText, keepChase).then((response) => {
      if (response.Code !== 1) {
        notificationAsync.alert(response.Message).then(props.onBack)
      } else {
        notificationAsync.alert(response.Message, { title: "成功" }).then(props.onBack)
      }
    })
  }

  useEffect(() => {
    Bus.on("lottery.openLottery", updateLotteryData)
    // getBetTask().then((res) => { // 目前还用不到
    //   console.log(res)
    // })
    // console.log({ isTimes, isMult: props.gameConfig.list.length > 1 })

    return () => {
      Bus.off("lottery.openLottery", updateLotteryData)
    }
  }, [])

  return (
    <>
      <div className="fixed top-0 bottom-0 w-full max-w-[600px] bg-black/80 z-[10001]" />
      <div className="chase-module">
        <div className="title">
          <div>
            {!isSetting && (
              <Icon
                onClick={() => {
                  setIsSetting(true)
                }}
                className="px-1"
                icon="ion-ios-arrow-left"
              />
            )}
          </div>
          <div className="text">{title}</div>
          <div>
            <Icon
              onClick={() => {
                props.onBack()
              }}
              className="px-1"
              icon="ion-close"
            />
          </div>
        </div>
        {isSetting ? (
          <Settings
            setBetCountEvent={setBetPeriodNum}
            isDouble={isDouble}
            onChangeDouble={(v) => setIsDouble(v)}
            keepChase={keepChase}
            onChangeKeepChase={setKeepChase}
            openLottery={openLottery}
            betPeriodNum={betPeriodNum}
            betData={betData}
            removeBetEvent={removeBetEvent}
            updateBetEvent={updateBetEvent}
            updateProfitRate={setProfitRate}
            updateTimes={setTimes}
            profitRate={profitRate}
            times={times}
            betNameList={props.betNameList}
            gameConfig={props.gameConfig}
            forceSingle={forceSingle}
          >
            <div
              onClick={() => {
                if (betData.length === 0) {
                  notificationAsync.toast("选号有误", { timeout: 1000, class: "center-toast", animation: "fade" })
                  return
                }
                if (betPeriodNum <= 0) {
                  notificationAsync.toast("追号至少1期", { timeout: 1000, class: "center-toast", animation: "fade" })
                  return
                }

                if (betData.some((bet) => !bet.unit)) {
                  notificationAsync.toast("投注金额不得空白", { timeout: 1000, class: "center-toast", animation: "fade" })
                  return
                }
                if (_(betData).groupBy("unit").keys().value().length > 1) {
                  // 金额不一致 props.gameConfig.isComputed &&
                  return notificationAsync.alert("请输入相同金额", { title: "金额错误" })
                }

                setIsSetting(false)
              }}
              className="confirm-btn"
            >
              生成追号
            </div>
          </Settings>
        ) : (
          <Confirms
            ref={confirmRef}
            originBet={props.unit}
            isDouble={isDouble}
            betCount={props.betCount}
            betPeriodNum={betPeriodNum}
            baseUnit={props.gameConfig.baseUnit || 1}
            betData={betData}
            openLottery={openLottery}
            profitRate={profitRate}
            times={times}
            betNameList={props.betNameList}
            isMultipleLevel={props.isMultipleLevel}
            gameConfig={props.gameConfig}
            forceSingle={forceSingle}
          >
            <div onClick={createChaseTask} className="confirm-btn">
              确定追号({props.betCount})
            </div>
          </Confirms>
        )}
      </div>
    </>
  )
}
