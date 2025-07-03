import React, { useEffect, useState } from 'react';
import './style.scss';
import util from "@/magic/util";
export default props => {

  const commonItems = ['中中', '大神带路', '继续中', '包中', '继续求稳', '百分百中奖', '个人心水', '试试看', '哈喽哈'];

  // const dividalItems = [
  //   '打赏金额5', '打赏金额6', '打赏金额7', '打赏金额8'
  // ]

  const [dividalItems, setDividalItems] = useState([]);

  function applyItem (item) {
    props.applySearchKey(item);
  }

  function refeshDividalItems () {
    const searchs = util.cache.get('searchs') || [];
    setDividalItems(searchs.filter(k => !!k));
  }

  function emptyDividal () {
    util.cache.remove('searchs');
    refeshDividalItems();
  }

  useEffect(() => {
    if(props.show) refeshDividalItems();
  }, [props.show, props.refresh]);

  return <div className={`search-hotkey${props.show ?'':' hide'}`}>
    <div className="session">
      <div className="title">大家都在搜</div>
      <div className="items">
        { commonItems.map((item, index) => (<div key={item + '-' + index} onClick={applyItem.bind(null, item)}>{ item }</div>)) }
      </div>
    </div>
    <div style={{ height: '30px' }} />
    <div className="session">
      <div className="title">
        最近搜寻记录
        { dividalItems.length > 0 && <div className="clear" onClick={emptyDividal}>清除</div> }
      </div>
      <div className="items">
        { dividalItems.map((item, index) => (<div key={item + '-' + index} onClick={applyItem.bind(null, item)}>{ item }</div>)) }
      </div>
    </div>
  </div>
}