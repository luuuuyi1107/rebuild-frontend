import React from "react"
import { Icon } from "react-onsenui"

export default class extends React.PureComponent {
  render() {
    return (
      <div className="api-loading">
        <p>
          <Icon icon="ion-load-d" />
        </p>
        <p>请稍后</p>
      </div>
    )
  }
}
