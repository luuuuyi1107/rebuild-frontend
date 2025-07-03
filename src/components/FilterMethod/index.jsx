import React, { useEffect, useState } from 'react';
import './style.scss';
import util from "@/magic/util";
import games from '@/config/lhc';
import filters from '@/config/filters'
export default props => {
  
  const filtered = matchFilterWithLhc();
  const options = Object.keys(filters);
  const [chosen, setChosen] = useState(getDefaultChosen());
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!show) {
      confirmEvent(false);
    }
  }, [chosen]);


  function getDefaultChosen () {
    const _data = util.cache.get('forum_home');
    if (!_data || !_data.filterData.hasOwnProperty('betlx')) return [];
    return Object.keys(filtered).reduce((result, key) => {
      if (filtered[key].betlx.some(k => _data.filterData.betlx.includes(k))) result.push(key);
        return result;
      }, []);
  }


  function matchFilterWithLhc () {
    const keys = games.flatMap(game => game.list).reduce((gameObj, game)=> ({ ...gameObj, [game.name]: { 'betpx': game.type, 'betlx': game.lx } }), {});
    return Object.entries(filters).reduce((result, [key, filter]) => {
      filter.items.forEach(item => {
        if (keys.hasOwnProperty(item)) {
          if (!!keys[item].betpx && keys[item].betpx != undefined) result[key].betpx.push(keys[item].betpx);
          if (!!keys[item].betlx && keys[item].betlx != undefined) result[key].betlx.push(keys[item].betlx);
        }
      })
      result[key].betpx = util.removeRepeatDataFromArray(result[key].betpx);
      result[key].betlx = util.removeRepeatDataFromArray(result[key].betlx);
      return result;
    }, Object.keys(filters).reduce((res, key) => ({ ...res, [key]: { betpx: [], betlx: [] } }) , {}))
  }

  function choseItem (name) {
    if (chosen.includes(name)) {
      setChosen(chosen.filter(item => item !== name));
    } else {
      const newChosen = chosen.concat(name)
      setChosen(newChosen)
    }
  }

  function applyOther (name) {
    choseItem(name);
  }

  function toggleShow () {
    setShow(!show);
    props.setFilter(!show);
  }

  function resetEvent () {
    setChosen([]);
  }

  function cancelEvent () {
    // resetEvent();
    toggleShow();
  }

  function clickOnWhileList (e) {
    if (e.target.className !== 'whole-list') return;
    toggleShow();
  }

  function confirmEvent (shouldToggle) {
    const doToggle = shouldToggle!==null ? shouldToggle : true;
    if (doToggle) toggleShow();

    const _passData = chosen.reduce((result, key) => {
      result.betlx = util.removeRepeatDataFromArray(result.betlx.concat(filtered[key].betlx));
      result.betpx = util.removeRepeatDataFromArray(result.betpx.concat(filtered[key].betpx));
      return result
    },{ betlx: [], betpx: [] })
    props.passFilterList(_passData);
  }

  return <div className="filter-method">
    
    { !show && <div className={`all${chosen.length === 0 ? ' active':''}`} onClick={setChosen.bind(null, [])}>全部玩法</div> }
    { !show && <div className="options">
      <div className="inner">
        {
          options.map((option, idx) => (<div className={chosen.includes(option) ?'active':''} onClick={applyOther.bind(null, option)} key={option + '-' + idx}>{option}</div>))
        }
      </div>
    </div> }
    { show && <div className="instruct">筛选玩法</div> }
    
    <div className={`drop-down${show ? ' active':''}`} onClick={toggleShow}>
      <img style={{width: 15, height: 15}} className="emoji-icon" src={util.buildAssetsPath("assets/icons/caret-down.svg")}/>
    </div>
    
    {
      show && <div className="whole-list" onClick={clickOnWhileList}>
        <div className="inner">
          <div className="games-list">
            <div>
              <div className="game-title">全部玩法</div>
              <div className="game-items">
                {
                  options.map((item, idx) => (<div key={item + '-' + idx} onClick={choseItem.bind(null, item)} className={`${chosen.includes(item) ? 'active':''}`}>{ item }</div>))
                }
              </div>
            </div>
          </div>
          <div className="games-pad">
            <div className="confirm" onClick={confirmEvent}>确认</div>
            <div className="reset" onClick={resetEvent}>重置</div>
            <div className="cancel" onClick={cancelEvent}>取消</div>
          </div>
        </div>
      </div>
    }
  </div>
}