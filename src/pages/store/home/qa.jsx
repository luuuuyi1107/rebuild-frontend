import React from "react"
import LayoutPage from "@/components/LayoutPage"
import "./style.scss"
import config from "@/config/storeQA"

export default class extends React.PureComponent {
  render() {
    let qa = config.qa
    return (
      <LayoutPage className={"store-qa-modal "} title="商城公告" right={null}>
        <div className="qa">
          {qa.map((item) => {
            return (
              <div className="box" key={item.Q}>
                <div className="hd">
                  <span>{item.Q}</span>
                </div>
                <div className="bd" dangerouslySetInnerHTML={{ __html: item.A }}></div>
                {/*<div className="bd"> {item.A} </div>*/}
              </div>
            )
          })}
        </div>
      </LayoutPage>
    )
  }
}
