
import React from "react";
import util from "@/magic/util";
export default ({ Bonus, BetCount, BetText, BetStatus, ...restProps }) => {
  const PurePrice = Bonus - BetCount;
  return (<div className="forum_count">
      <div className="bet_content">{
        this.state.cur_ticket.BetText.replace(/,/g, ',')
      }</div>
      <div className="bonus">
        {  
          BetStatus == 0 && <span className="waiting">待开奖</span>
        }
        {
          BetStatus == 1
            ? <span className="hit">{ util.numberRoundedFix(PurePrice, 2) }元</span>
            : <span className="amount">{ util.numberRoundedFix(BetCount, 2) }元</span>
        }
      </div>
    </div>)}



// BetCount:10
// BetLx:1
// BetMoney:10
// BetPx:0
// BetStatus:2
// BetText:"01"
// Bonus:0
// Desc:"coffee~!!"
// DisLikeCount:0
// FollowCount:0
// FollowMoney:0
// GameID:"20230317-300"
// ID:89
// KaiTime:"/Date(1679036340000)/"
// LikeCount:0
// LotteryID:31
// NickName:"irene"
// PlayType:"特码投注"
// Title:"继续求稳…"
// UID:1349
// WatchCount:18
// WinRate:0