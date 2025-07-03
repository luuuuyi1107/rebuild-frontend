import { useState, useMemo, useEffect } from "react"
import { Button } from "react-onsenui"
import { gameList } from "@/config/game"
import { withRouter } from "@/magic/withRouter"

import util from "@/magic/util"
import thirdGames from "@/config/platforms"
import pkGames from "@/config/pkGames"
import * as action from "@/action"
import * as apiNotification from "@/magic/ApiNotification"
import _ from "lodash"
import "./moreshare.scss"

export default withRouter((props) => {
  const GAME_TYPE = {
    ALL: "all",
    LOTTERY: "lottery",
    CASINO: "casino",
    SLOT: "slot",
    CARD: "card",
  }
  const GAME_NAME = {
    ALL: "全部",
    LOTTERY: "彩票",
    CASINO: "视讯",
    SLOT: "电子",
    CARD: "棋牌",
  }
  const [gameType, setGameType] = useState(GAME_TYPE.ALL)
  const [loading, setLoading] = useState(false)
  const [beginTime, setBeginTime] = useState(util.date.format(new Date(), "YYYY-MM-DD"))
  const [endTime, setEndTime] = useState(util.date.format(new Date(), "YYYY-MM-DD"))
  const [LotteryName, setLotteryName] = useState(GAME_NAME.ALL)
  const [gamesPopBox, setGamesPopBox] = useState(false)
  const [shareData, setShareData] = useState(null)
  const [lotteryId, setLotteryId] = useState(0)

  function onFilterChange(opt) {
    if (opt.beginTime) {
      setBeginTime(util.date.format(new Date(opt.beginTime), "YYYY-MM-DD"))
    }
    if (opt.endTime) {
      setEndTime(util.date.format(new Date(opt.endTime), "YYYY-MM-DD"))
    }
  }

  async function search() {
    let res = await action.post("Lottery/GetCount", {
      lotteryID: lotteryId,
      startTime: beginTime.replace(/\-/g, ""),
      endTime: endTime.replace(/\-/g, ""),
    })

    if (res.Code != 1) {
      apiNotification.alert(res, { title: "提示" }, props)
    }

    setShareData(res.Data)
  }
  async function share() {
    let text = [lotteryId, beginTime.replace(/\-/g, ""), endTime.replace(/\-/g, "")].join("|")
    props.onShare(text)
  }

  function gameChoose(e, id, name) {
    setLotteryId(id)
    setLotteryName(name)
    setGamesPopBox(false)
    e.stopPropagation()
    e.preventDefault()
  }

  const collectionGameList = useMemo(() => {
    const thirdGameData = Object.values(thirdGames)
    thirdGameData.forEach((item) => {
      if (item.games?.some((game) => !!game.params?.tags)) {
        item.games
          .filter((game) => !!game.params?.tags)
          .forEach((game) => {
            const _platform = _.cloneDeep(item)
            _platform.title = game.name
            if (_platform.altTitle) delete _platform.altTitle
            if (!!game.params.lotteryId) _platform.lotteryId = game.params.lotteryId
            _platform.tags = game.params.tags
            Object.values(_platform).forEach((param) => {
              _.has(param, "params.lotteryId") && (param.params.lotteryId = game.params.lotteryId)
            })
            thirdGameData.push(_platform)
          })
      }
    })

    const gameComponent = (ikey, item) => (
      <div className="p-0.5" key={ikey + item.lotteryId} onClick={(e) => gameChoose(e, item.lotteryId, item.title)}>
        {item.title}
      </div>
    )

    const lottery = gameList.map((lotto) => (
      <div key={"lotto" + lotto.id} className="p-0.5" onClick={(e) => gameChoose(e, lotto.id, lotto.name)}>
        {lotto.name}
      </div>
    ))

    const card = thirdGameData.filter((game) => game.tags.includes("棋牌")).map(gameComponent.bind(null, "card"))

    Object.values(pkGames).map((pkGame) => {
      if (pkGame.lotteryId) {
        card.push(
          <div key={"pkGame" + pkGame.lotteryId} className="p-0.5" onClick={(e) => gameChoose(e, pkGame.lotteryId, pkGame.title)}>
            {pkGame.title}
          </div>
        )
      }
    })

    return {
      card,
      casino: thirdGameData.filter((game) => game.tags.includes("真人") || game.tags.includes("体育")).map(gameComponent.bind(null, "casino")),
      slot: thirdGameData.filter((game) => game.tags.includes("电子")).map(gameComponent.bind(null, "slot")),
      lottery,
    }
  }, [])

  const renderGameItem = useMemo(() => {
    let ret = []
    switch (gameType) {
      case GAME_TYPE.ALL:
        ret = Object.values(collectionGameList).flat()
        break
      case GAME_TYPE.LOTTERY:
        ret = collectionGameList.lottery
        break
      case GAME_TYPE.CASINO:
        ret = collectionGameList.casino
        break
      case GAME_TYPE.SLOT:
        ret = collectionGameList.slot
        break
      case GAME_TYPE.CARD:
        ret = collectionGameList.card
        break
    }

    return ret
  }, [gameType])

  useEffect(() => {
    search()
  }, [])

  return (
    <div className="p-[16px] text-[14px] font-[400] more-share">
      <div className="text-left">
        <div className="flex items-center py-1 border-bottom ">
          <span className="mr-1">时间</span>
          <div className="bg-gray-100 pl-1 pr-0.5 py-[9px] rounded-[3px] relative flex-1 flex justify-between text-[14px]">
            <div>{beginTime}</div>
            <img className="ml-auto rotate-90" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
            <input
              className="absolute inset-0 opacity-0 w-[33.5vw] md:w-full bg-black"
              type="date"
              onChange={(e) => onFilterChange({ beginTime: e.target.value })}
            />
          </div>
          <span className="mx-0.5">至</span>
          <div className="bg-gray-100 px-1 py-[9px] rounded-[3px] relative flex-1 flex justify-between text-[14px]">
            <div>{endTime}</div>
            <img className="ml-auto rotate-90" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
            <input
              className="absolute inset-0 opacity-0 w-[33.5vw] md:w-full"
              type="date"
              onChange={(e) => onFilterChange({ endTime: e.target.value })}
            />
          </div>
        </div>

        <div
          className="py-1 border-bottom flex items-center"
          onClick={() => {
            setGamesPopBox(true)
          }}
        >
          <span className="mr-1">彩种</span>
          <div className="bg-gray-100 py-0.5 px-[11px] rounded-[3px] flex items-center">
            <span>{LotteryName}</span>
            <img className="ml-0.5 h-[12px] rotate-90" src={util.buildAssetsPath("assets/icons/ic_arrow.svg")} />
          </div>
        </div>
        <div className="shareData ">
          <div className="py-1.5 border-bottom">
            <span className="mr-1">投注</span>
            <span className="right">{shareData?.BetMoney || 0}</span>
          </div>
          <div className=" py-1.5 border-bottom">
            <span className="mr-1">派彩</span>
            <span className="right">{shareData?.WinMoney || 0}</span>
          </div>
          <div className=" py-1.5 border-bottom">
            <span className="mr-1">盈亏</span>
            <span className="right">{(shareData?.WinMoney || 0 - (shareData?.BetMoney || 0)).toFixed(2)}</span>
          </div>
        </div>
        <div className="flex mt-2">
          <Button
            className="flex-1 text-center bg-[#576B95] rounded-[8px] py-[7px]"
            onClick={async () => {
              props.setIsLoading(true)
              await search()
              props.setIsLoading(false)
            }}
          >
            查询
          </Button>
          <div className="w-[7px]" />
          <Button
            className="flex-1 text-center bg-[#07C160] rounded-[8px] py-[7px]"
            onClick={() => {
              share()
            }}
          >
            分享
          </Button>
        </div>
      </div>
      {gamesPopBox && (
        <div
          id="gamePopFrame"
          onClick={(e) => {
            if (e.target.id !== "gamePopFrame") return
            e.stopPropagation()
            e.preventDefault()
            setGamesPopBox(false)
          }}
          className="bg-black/80 fixed left-0 top-0 right-0 bottom-0 flex items-center justify-center"
        >
          <div className="rounded-b-[6px] rounded-t-[8px] bg-white w-10/12 max-w-[360px]">
            <div className="grid grid-cols-5 p-0.5 border-t-0 border-x-0 border-b border-solid border-gray-300 bg-[#ededed] rounded-t-[6px]">
              <div
                className={`p-0.5 leading-tight ${gameType == GAME_TYPE.ALL ? "bg-[#576B95] text-white rounded-[6px]" : ""}`}
                onClick={() => {
                  setGameType(GAME_TYPE.ALL)
                  setLotteryId(0)
                  setLotteryName(GAME_NAME.ALL)
                  setGamesPopBox(false)
                }}
              >
                全部
              </div>
              <div
                className={`p-0.5 leading-tight ${gameType == GAME_TYPE.LOTTERY ? "bg-[#576B95] text-white rounded-[6px]" : ""}`}
                onClick={(e) => {
                  setGameType(GAME_TYPE.LOTTERY)
                }}
              >
                彩票
              </div>
              <div
                className={`p-0.5 leading-tight ${gameType == GAME_TYPE.CASINO ? "bg-[#576B95] text-white rounded-[6px]" : ""}`}
                onClick={(e) => {
                  setGameType(GAME_TYPE.CASINO)
                }}
              >
                视讯
              </div>
              <div
                className={`p-0.5 leading-tight ${gameType == GAME_TYPE.SLOT ? "bg-[#576B95] text-white rounded-[6px]" : ""}`}
                onClick={(e) => {
                  setGameType(GAME_TYPE.SLOT)
                }}
              >
                电子
              </div>
              <div
                className={`p-0.5 leading-tight ${gameType == GAME_TYPE.CARD ? "bg-[#576B95] text-white rounded-[6px]" : ""}`}
                onClick={(e) => {
                  setGameType(GAME_TYPE.CARD)
                }}
              >
                棋牌
              </div>
            </div>

            <div key={gameType} className="grid grid-cols-3 place-content-start text-left h-[60vh] overflow-y-auto text-center">
              {renderGameItem}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
