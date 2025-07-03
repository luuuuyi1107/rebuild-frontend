import React, { createRef } from "react"
import { Icon } from "react-onsenui"
import "./style.scss"
import classNames from "classnames"

export default class extends React.PureComponent {
  state = {
    showPassword: false,
    focus: false,
    isComposing: false,
  }

  constructor(props) {
    super(props)
    this.inputRef = createRef()
  }

  render() {
    // let type = this.props.type;
    // if(this.props.type=='password2'){
    //     type = 'password'
    // }
    const type =
      this.props.type === "password2" && !this.state.showPassword
        ? "password"
        : this.props.type === "password2" && this.state.showPassword
        ? "text"
        : this.props.type
    return (
      <div
        className={`inputBox flex ${this.props.type == "password2" && !this.state.showPassword ? "password2" : ""} ${this.props.className || ""} ${
          this.state.focus ? "focus" : ""
        }`}
        onClick={this.props.onClick}
      >
        {this.props.prefix && <Icon icon={this.props.prefix} className={classNames("prefix", this.props.iconClass)} />}
        {this.props.icon && (
          <div className={classNames("icon-box flex items-center justify-center h-full absolute top-0 left-0", this.props.iconClass ?? "w-2")}>
            {this.props.icon}
          </div>
        )}
        <input
          ref={this.inputRef}
          name={this.props.name || ""}
          disabled={this.props.disabled}
          readOnly={this.props.readOnly}
          autoComplete={this.props.autoComplete}
          autoCapitalize="off"
          autoCorrect="off"
          type={this.state.showPassword ? "text" : type}
          defaultValue={this.props.defaultValue}
          value={this.props.value}
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
            this.props.onChange?.(e.target.value)
          }}
          onKeyDown={(e) => {
            this.props.onKeyDown && this.props.onKeyDown(e)
          }}
          onKeyPress={this.props.onKeyPress}
          onClick={(event) => event.target.focus()}
        />
        {this.props.type == "text" && this.props.value && !this.props.disabled && this.props.haveDel && (
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
            icon={this.state.showPassword ? "ion-eye" : "ion-eye-disabled"}
            className="subfix"
            onClick={() => {
              this.setState({ showPassword: !this.state.showPassword })
            }}
          />
        )}
        {this.props.subfix && <div className="absolute top-0 right-1 h-full flex justify-center items-center ">{this.props.subfix}</div>}
      </div>
    )
  }
}
