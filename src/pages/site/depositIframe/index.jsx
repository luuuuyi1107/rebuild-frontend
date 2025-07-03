import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"

import styles from "./style.module.scss"
import config from "@/config/config"
import { getPush } from "@/action/apis"

export default class extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      serviceLink: util.getUrlParam("serviceLink"),
      depositLink: util.getUrlParam("depositLink"),
    }
  }
  componentDidMount() {
    this.loadServiceLink()
  }

  async loadServiceLink() {
    let serviceLink = util.cache.get("serviceLink")
    if (!serviceLink) {
      let res = await getPush({ keys: ["servicelink"] })
      serviceLink = res.Data.ServiceLink
    }
    this.setState({ serviceLink: serviceLink })
  }

  frameLoaded() {
    this.setState({ loading: false })
  }

  render() {
    return (
      <LayoutPage className="site-service-content" center="充值中心" right={null} loading={this.state.loading}>
        <iframe
          onLoad={this.frameLoaded.bind(this)}
          src={this.state.depositLink || config.serviceLink || this.state.serviceLink}
          className={styles.servicePage}
          id="fullScreenBox"
        ></iframe>
      </LayoutPage>
    )
  }
}
