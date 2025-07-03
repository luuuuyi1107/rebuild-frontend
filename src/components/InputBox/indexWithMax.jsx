import React, { createRef } from "react"
import { Icon } from "react-onsenui"
import "./style.scss"

//解决 INPUTBOX 的长度限制无用 问题
export default class extends React.PureComponent {
  state = {
    showPassword: false,
    focus: false,
    value: this.props.value,
  }

  constructor(props) {
    super(props)
    this.inputRef = createRef()
  }

  render() {
    let type = this.props.type
    if (this.props.type == "password2") {
      type = "text"
    }
    var max = this.props.maxLength === undefined ? 10 : this.props.maxLength

    return (
      <div
        className={`inputBox ${this.props.type == "password2" && !this.state.showPassword ? "password2" : ""} ${this.props.className || ""} ${
          this.state.focus ? "focus" : ""
        }`}
      >
        {this.props.prefix && <Icon icon={this.props.prefix} className="prefix" />}
        <input
          ref={this.inputRef}
          name={this.props.name || ""}
          disabled={this.props.disabled}
          autoComplete={this.props.autoComplete}
          autoCapitalize="off"
          autoCorrect="off"
          type={this.state.showPassword ? "text" : type}
          defaultValue={this.props.value}
          placeholder={this.props.placeholder || "请输入信息"}
          onFocus={() => {
            this.setState({ focus: true })
          }}
          onInput={this.props.onInput}
          maxLength={this.props.maxLength}
          onBlur={() => {
            this.setState({ focus: false })
          }}
          onChange={(e) => {
            if (e.target.value.length < max) {
              this.setState({
                value: e.target.value,
              })
              this.props.onChange && this.props.onChange(e.target.value)
            }
          }}
          onKeyDown={(e) => {
            this.props.onKeyDown && this.props.onKeyDown(e)
          }}
          onKeyPress={this.props.onKeyPress}
          onClick={(event) => event.target.focus()}
          value={this.state.value}
        />
        {this.props.type == "text" && this.props.value && !this.props.disabled && (
          <Icon
            icon="ion-android-close"
            className="subfix"
            onClick={() => {
              if (this.inputRef.current) {
                this.inputRef.current.value = ""
              }
              this.props.onChange && this.props.onChange("")
            }}
          />
        )}
        {(this.props.type == "password" || this.props.type == "password2") && (
          <Icon
            icon={this.state.showPassword ? "ion-eye-disabled" : "ion-eye"}
            className="subfix"
            onClick={() => {
              this.setState({ showPassword: !this.state.showPassword })
            }}
          />
        )}
      </div>
    )
  }
}
