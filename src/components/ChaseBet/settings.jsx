import { useMemo } from "react"
import { Icon, Switch } from "react-onsenui"
import classNames from "classnames"
import dayjs from "dayjs"
import util from "@/magic/util"
import CountDownText from "@/components/CountdownText"
import _ from "lodash"

export default (props) => {
  const MAX_COUNT = 50
  const MIN_TIMES = 2
  const MAX_TIMES = 99
  const countDown = useMemo(() => {
    if (!props.openLottery?.NewKai?.EndTime) return 0
    const serverTime = util.date.toDate(util.cache.get("serverTime"))
    const kaiTime = util.date.toDate(props.openLottery.NewKai.EndTime)
    return Math.max(0, dayjs(kaiTime).diff(serverTime, "second"))
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

  console.log({ betData })

  function setPeriodEvent(num) {
    if ((props.betPeriodNum === 1 && num < 0) || (props.betPeriodNum >= MAX_COUNT && num > 0)) return
    props.setBetCountEvent(props.betPeriodNum + num)
  }

  function convertValueToNumber(value) {
    const val = parseInt(value.replace(/[^0-9.]/g, "")) // 只保留数字和小数点
    return isNaN(val) ? "" : val
  }

  function changeProfit(event) {
    props.updateProfitRate(convertValueToNumber(event.target.value))
  }

  function changeTimes(event) {
    props.updateTimes(convertValueToNumber(event.target.value))
  }

  function blurProfit(event) {
    if (+event.target.value === 0) {
      props.updateProfitRate(10)
    }
  }

  function blurTimes(event) {
    const _value = +event.target.value
    if (_value === 0) {
      props.updateTimes(MIN_TIMES)
    } else if (_value > MAX_TIMES) {
      props.updateTimes(MAX_TIMES)
    }
  }

  return (
    <div className="chase-body">
      <div className="period-time">
        {/* <div>{JSON.stringify(lotteryData)}</div> */}
        <div className="font-bold">第 {props.openLottery?.NewKai?.GameID} 期</div>
        <div className="flex items-center">
          截止时间
          <CountDownText initialCount={countDown} />
        </div>
      </div>
      <div className="item-list">
        {betData.map((bet, index) => (
          <div className="flex mb-[5px] last:mb-0" key={bet.ball + "-" + index}>
            <div className="bg-white rounded-sm p-0.5 flex-1 mr-[5px] flex items-center">
              <div className="flex flex-1 items-center">
                <div className="min-w-fit pr-0.5">{props.betNameList[bet.ball - 1] || bet.ball}</div>
                <div className="max-w-full break-all">{bet.value.replace(/,/g, ",")} </div>
                <div className="w-fit ml-0.5">@{bet.rate}</div>
              </div>

              <div>
                金额
                <input
                  value={bet.unit}
                  max={MAX_COUNT}
                  // disabled={props.gameConfig.baseUnit ?? 1 === 2}
                  onChange={(e) => {
                    const unit = convertValueToNumber(e.target.value)
                    if (unit === 0) return
                    props.updateBetEvent({ ...bet, unit })
                  }}
                  className="border-gray-100 border-[1px] rounded-sm w-[54px] h-[18px] text-center ml-0.5"
                />
              </div>
            </div>
            <div
              onClick={() => {
                props.removeBetEvent(bet)
              }}
              className="bg-white rounded-sm w-[34px] h-[34px] text-[16px] text-gray-500 flex justify-center items-center"
            >
              <Icon onClick={() => {}} className="px-1" icon="ion-close" />
            </div>
          </div>
        ))}
      </div>
      <div className="settings">
        <div className="set">
          <div className="flex items-center">
            追号期数
            <div
              className="period-control"
              onClick={() => {
                setPeriodEvent(-1)
              }}
            >
              <Icon icon="ion-minus" />
            </div>
            <input
              className="period-input"
              value={props.betPeriodNum}
              onChange={(event) => {
                let val = Math.min(parseInt(event.target.value), MAX_COUNT)
                props.setBetCountEvent(val || "")
              }}
            />
            <div
              className="period-control"
              onClick={() => {
                setPeriodEvent(1)
              }}
            >
              <Icon icon="ion-plus" />
            </div>
          </div>
          <div className="flex items-center relative ">
            <Switch modifier="tet" className="scale-75 pointer-events-none" checked={props.keepChase} />
            <label className="left-0 top-0 bottom-0 right-0 absolute opacity-0 bg-black  cursor-pointer">
              <input
                type="checkbox"
                checked={props.keepChase}
                onChange={(e) => {
                  props.onChangeKeepChase(e.target.checked)
                }}
              />
            </label>
            <font className={classNames("font-bold whitespace-nowrap", { "text-[#e0a367]": props.keepChase, "text-gray-300": !props.keepChase })}>
              中奖后停止追号
            </font>
          </div>
        </div>

        <div className="set">
          <div className="flex items-center">
            <span className="whitespace-nowrap">模式</span>
            <div
              onClick={() => {
                props.onChangeDouble(false)
              }}
              className={classNames("radio-rate", { active: !props.isDouble })}
            >
              <span className="whitespace-nowrap">利润率</span>
            </div>
            <div
              onClick={() => {
                props.onChangeDouble(true)
              }}
              className={classNames("radio-rate", { active: props.isDouble })}
            >
              翻倍
            </div>
          </div>

          <div className="flex items-center">
            {props.isDouble ? (
              <>
                倍数
                <div className="times">
                  <div
                    className="control"
                    onClick={() => {
                      props.updateTimes(Math.max(MIN_TIMES, props.times - 1))
                    }}
                  >
                    <Icon icon="ion-minus" />
                  </div>
                  <input value={props.times} onChange={changeTimes} onBlur={blurTimes} />
                  <div
                    className="control"
                    onClick={() => {
                      props.updateTimes(Math.min(MAX_TIMES, props.times + 1))
                    }}
                  >
                    <Icon icon="ion-plus" />
                  </div>
                </div>
              </>
            ) : (
              <>
                利润率
                <div className="profit">
                  <input value={props.profitRate} onChange={changeProfit} onBlur={blurProfit} />
                  <span>%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {props.children}
      </div>
    </div>
  )
}
