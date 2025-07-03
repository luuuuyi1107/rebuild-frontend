export default ({ shareBet, isMe, overTime, shareStatus, onClick }) => (
  <div className="shareBet">
    <span className="shareBetTitle">
      <span>{shareBet.GameTitle}</span>
      <span>{shareBet.GameID}期</span>
    </span>
    <div className="shareBetContent">
      <div className="info betsub">
        <span>{shareBet.BetName}</span>
        <span>{shareBet.BetText}</span>
        <span>{shareBet.BetMoney}元</span>
      </div>
      <div className="status betsub">
        <div>状态: {shareStatus}</div>
        {shareStatus == "未开奖" && !isMe && overTime && (
          <div
            className="followBet"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.()
            }}
          >
            跟投
          </div>
        )}
      </div>
    </div>
  </div>
)
