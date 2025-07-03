import React from 'react';

{/* 历史投注注单 */}
export default props => <div className="history_record" style={{ display: props.active ? 'block' : 'none'}}>
  <div>
    {
      props.items.map((item, key) => {
        const tState = item.BetStatus;
        const isOpenDraw = tState || tState === 1;
        //输赢的结果，状态已中奖，然后 中奖金额》买彩金额
        const isWin = tState === 1 && (item.Bonus > item.BetCount);
        const isTie = tState === 1 && (item.Bonus == item.BetCount);
        return (
          <div className="row" key={item.ID + '_' + key}>
            <span className="issue">{ item.GameID.slice(4) } 期</span>
            <span className="draw_open_details">[{item.BetText}]</span>
            <div className={`result ${!isOpenDraw ? "not_yet" : isTie ? "tie" : (isWin ? "win" : "lose")}`}>{!isOpenDraw ? "-" : isTie ? "和" : (isWin ? '胜' : "负")}</div>
          </div>);
        }
      )
    }
  </div>
</div>