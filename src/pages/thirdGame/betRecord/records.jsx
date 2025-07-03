import util from "@/magic/util"

export const generatePGSeries = (row) => {
  return (
    <div className="record-item">
      <p className="tl">时间：{util.date.format(util.date.toDate(row.BetTime), "YYYY-MM-DD hh:mm:ss")}</p>
      <p className="dd">
        {row.GameCode && <span>游戏名称：{row.GameName}</span>}
        {row.GameType && <span>游戏类型：{row.GameType}</span>}

        {typeof row.Bets != undefined && (
          <span>
            押注金额：<font color="#333">&yen;&nbsp;{row.Bets}</font>
          </span>
        )}

        {typeof row.Wins != undefined && (
          <span>
            赢取金额：<font color="#5e0ea0">&yen;&nbsp;{row.Wins}</font>
          </span>
        )}
      </p>
    </div>
  )
}

export const generateAgSeries = (row) => {
  return (
    <div className="record-item">
      <p className="tl">时间：{util.date.format(util.date.toDate(row.betTime), "YYYY-MM-DD hh:mm:ss")}</p>
      <p className="dd">
        {row.gameType && <span>名称：{row.gameType}</span>}
        {row.tableCode && <span>台号：{row.tableCode}</span>}
        {typeof row.betAmount != undefined && (
          <span>
            投注：<font color="#333">&yen;&nbsp;{util.formatNumber(row.betAmount)}</font>
          </span>
        )}
        {typeof row.netAmount != undefined && (
          <span>
            盈亏：<font color="#5e0ea0">&yen;&nbsp;{util.formatNumber(row.netAmount)}</font>
          </span>
        )}
      </p>
    </div>
  )
}

export const agNameMap = {
  br: "视讯",
  ebr: "电子",
  hsr: "捕鱼",
}
