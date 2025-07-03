import React from "react"
import util from "@/magic/util"
import CustomIcon from "@/components/CustomIcon"
import { Icon } from "react-onsenui"
import { withRouter } from "@/magic/withRouter"

export default withRouter((props) => {
  return (
    <div className="menu top-menu">
      <div
        className="btn deposit"
        onClick={() => {
          util.trialCheck()
          props.router.push("/site/depositCenter")
        }}
      >
        <div className="icon instance">
          <Icon icon="ion-android-exit" />
        </div>
        <p>充值</p>
      </div>

      <div
        className="btn withdraw"
        onClick={() => {
          if (!util.isLogin()) {
            props.router.push("/site/login")
          } else {
            props.loadBankCard()
          }
        }}
      >
        <div className="icon instance">
          <Icon icon="ion-android-checkbox-outline" />
        </div>
        <p>提款</p>
      </div>

      <div
        className="btn service"
        onClick={() => {
          props.router.push("/site/adminService")
        }}
      >
        <div className="icon">
          <CustomIcon style={{ height: 38, width: 38 }} type={require("./icons/service.svg")} />
        </div>
        <p>客服</p>
      </div>

      <div
        className="btn sign"
        onClick={() => {
          props.router.isLoginToOrRedirect("/site/signin")
        }}
      >
        <div className="icon">
          <Icon icon="ion-android-calendar" />
        </div>
        <p>签到</p>
      </div>

      <div
        className="btn activity"
        onClick={() => {
          props.router.push("/site/promotionCenter")
        }}
      >
        <div className="icon">
          <Icon icon="ion-heart" />
        </div>
        <p>优惠</p>
      </div>
    </div>
  )
})
