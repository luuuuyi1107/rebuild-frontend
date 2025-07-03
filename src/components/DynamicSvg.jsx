/**
 * Created on 2017/10/17.
 */

import React from "react"
import loadable from "@loadable/component"

export default ({ svgPath, className = "", size = "md", ...restProps }) => {
  const Component = loadable(() => import(`../assets/dynamic_svg/${svgPath}.svg`))
  // const Component = {
  //   ["forum/tab_1_sel"]: loadable(() => import(`${baseUri}forum/tab_1_sel.svg`)),
  //   forum__tab_1: loadable(() => import(`${baseUri}forum/tab_1.svg`)),
  //   forum__tab_2_sel: loadable(() => import(`${baseUri}forum/tab_2_sel.svg`)),
  //   forum__tab_2: loadable(() => import(`${baseUri}forum/tab_2.svg`)),
  //   forum__tab_3_sel: loadable(() => import(`${baseUri}forum/tab_3_sel.svg`)),
  //   forum__tab_3: loadable(() => import(`${baseUri}forum/tab_3.svg`)),
  //   lotteryBall__heart0: loadable(() => import(`${baseUri}lotteryBall/heart0.svg`)),
  //   lotteryBall__heart1: loadable(() => import(`${baseUri}lotteryBall/heart1.svg`)),
  //   lotteryBall__heart2: loadable(() => import(`${baseUri}lotteryBall/heart2.svg`)),
  //   lotteryBall__heart3: loadable(() => import(`${baseUri}lotteryBall/heart3.svg`)),
  //   lotteryBall__heart4: loadable(() => import(`${baseUri}lotteryBall/heart4.svg`)),
  //   lotteryBall__heart5: loadable(() => import(`${baseUri}lotteryBall/heart5.svg`)),
  //   lotteryBall__heart6: loadable(() => import(`${baseUri}lotteryBall/heart6.svg`)),
  //   lotteryBall__heart7: loadable(() => import(`${baseUri}lotteryBall/heart7.svg`)),
  //   lotteryBall__heart8: loadable(() => import(`${baseUri}lotteryBall/heart8.svg`)),
  //   lotteryBall__heart9: loadable(() => import(`${baseUri}lotteryBall/heart9.svg`)),
  //   niuniu__heart0: loadable(() => import(`${baseUri}niuniu/heart0.svg`)),
  //   niuniu__heart1: loadable(() => import(`${baseUri}niuniu/heart1.svg`)),
  //   niuniu__heart2: loadable(() => import(`${baseUri}niuniu/heart2.svg`)),
  //   niuniu__heart3: loadable(() => import(`${baseUri}niuniu/heart3.svg`)),
  //   niuniu__heart4: loadable(() => import(`${baseUri}niuniu/heart4.svg`)),
  //   niuniu__heart5: loadable(() => import(`${baseUri}niuniu/heart5.svg`)),
  //   niuniu__heart6: loadable(() => import(`${baseUri}niuniu/heart6.svg`)),
  //   niuniu__heart7: loadable(() => import(`${baseUri}niuniu/heart7.svg`)),
  //   niuniu__heart8: loadable(() => import(`${baseUri}niuniu/heart8.svg`)),
  //   niuniu__heart9: loadable(() => import(`${baseUri}niuniu/heart9.svg`)),
  //   niuniu__bet_5: loadable(() => import(`${baseUri}niuniu/bet_5.svg`)),
  //   niuniu__bet_20: loadable(() => import(`${baseUri}niuniu/bet_20.svg`)),
  //   niuniu__bet_100: loadable(() => import(`${baseUri}niuniu/bet_100.svg`)),
  //   niuniu__bet_c: loadable(() => import(`${baseUri}niuniu/bet_c.svg`)),
  //   niuniu__bet_n: loadable(() => import(`${baseUri}niuniu/bet_n.svg`)),
  //   niuniu__tab1: loadable(() => import(`${baseUri}niuniu/tab1.svg`)),
  //   niuniu__tab2: loadable(() => import(`${baseUri}niuniu/tab2.svg`)),
  // }[pathKey]
  return <Component className={`am-icon am-icon-${size} ${className}`} {...restProps}></Component>
}
