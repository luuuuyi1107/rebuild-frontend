import React, { useState } from "react"
import { Icon } from "react-onsenui"
import "./style.scss"

export default (props) => {
  const [focus, setFocus] = useState(false)
  const [show, setShow] = useState(false)
  const type = props.type === "password2" && !show ? "password" : props.type === "password2" && show ? "text" : props.type

  return (
    <div className={`inputBox ${props.type == "password2" && !show ? "password2" : ""} ${props.className || ""} ${focus ? "focus" : ""}`}>
      {props.prefix && <Icon icon={props.prefix} className="prefix" />}
      <input
        name={props.name || ""}
        disabled={props.disabled}
        autoComplete={props.autoComplete}
        autoCapitalize="off"
        autoCorrect="off"
        type={type}
        defaultValue={props.value}
        placeholder={props.placeholder || "请输入信息"}
        onFocus={() => {
          setFocus(true)
        }}
        onInput={props.onInput}
        maxLength={props.maxLength}
        onBlur={() => {
          setFocus(false)
        }}
        onChange={(e) => {
          props.onChange && props.onChange(e.target.value)
        }}
        onKeyDown={(e) => {
          props.onKeyDown && props.onKeyDown(e)
        }}
        onKeyPress={props.onKeyPress}
        onClick={(event) => event.target.focus()}
      />
      {props.type == "text" && props.value && !props.disabled && props.haveDel && (
        <Icon icon="ion-android-close" className="subfix" onClick={() => {}} />
      )}
      {(props.type == "password" || props.type == "password2") && (
        <Icon
          icon={show ? "ion-eye-disabled" : "ion-eye"}
          className="subfix"
          onClick={() => {
            setShow(!show)
          }}
        />
      )}
    </div>
  )
}
