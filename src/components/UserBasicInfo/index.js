import React from 'react';
import AvatarImg from "@/components/AvatarImg";
import { Icon } from 'react-onsenui';
import './style.scss';
export default props => {
  return <div className="basic-info">
    <AvatarImg avatarLink={props.image} width={"40px"} height={"40px"} icSize={"40px"} shape={"round"}/>
    <div className={`text ${props.winRate!=null ? 'divider':''}`}>
      <div className="base-name">
        <div className="name">{ props.userName }</div>
        { !!props.time && <div className="time">{ props.time }</div> }
      </div>
    
      {
        props.winRate!=null && <div className="win_rate">
          <Icon icon="ion-trophy" className="title_win_ic"/>
          <span className="txt">胜率 {props.winRate}%</span>
        </div>
      }
    </div>
    { props.children }

    { !!props.featured && props.featured > 0 && <img style={{width: 26, height: 26}} className="emoji-icon elite" src={util.buildAssetsPath("assets/icons/tag_best.svg")}/> }

  </div>
}
