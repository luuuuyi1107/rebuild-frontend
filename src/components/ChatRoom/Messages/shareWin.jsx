export default ({ shareWin, StartDay, EndDay, today }) => (
  <span className="shareWin">
    <span className="shareWinTitle">
      <span>{util.findGameId(shareWin.LotteryID)}</span>
      <span>{today ? "今日" : StartDay == EndDay ? StartDay : StartDay + "-" + EndDay}</span>
    </span>
    <span className="shareWinContent flex flex-col">
      <span className="shareWinItem">
        <span>投注</span>
        <span className="number">{shareWin.BetMoney}</span>
      </span>
      <span className="shareWinItem">
        <span>奖金</span>
        <span className="number">{shareWin.WinMoney}</span>
      </span>
      <span className="shareWinItem">
        <span>盈亏</span>
        <span className={shareWin.ProfitLoss > 0 ? "text-[#07C160]" : "text-[#E10004]"}>{shareWin.ProfitLoss}</span>
      </span>
    </span>
  </span>
)
