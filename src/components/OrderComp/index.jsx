import React, { useEffect, useState } from "react"
import "./style.scss"
import { Select } from "react-onsenui"
import provinces from "@/config/cities"
import { notificationAsync } from "@/magic/notification"

export default (props) => {
  const [cities, setCities] = useState([])
  const [userData, setUserData] = useState({})

  function confirmEvent() {
    if (checking()) return

    const { username, name, mobile, province, city, addr } = userData
    const address = (province === city ? [city, addr] : [province, city, addr]).join("")
    const data = { username, name, mobile, address }
    props.confirmEvent(data)
  }

  function validatePhoneNumber(phoneNumber) {
    var regex = /^1[3456789]\d{9}$/ // 以1开头，第二位为3、4、5、6、7、8、9之一，后面跟着9位数字
    return regex.test(phoneNumber)
  }

  function checking() {
    let message = ""
    if (!validatePhoneNumber(userData.mobile)) message = "电话格式错误"
    if (!!message) {
      notificationAsync.alert(message, {
        buttonLabels: ["返回"],
      })
    }
    return !!message
  }

  function inputChange(evt) {
    if (!evt.target || !evt.target.name) return
    const { name, value } = evt.target
    if (evt.target.name === "province") {
      const _province = provinces.find((province) => province.name === evt.target.value)
      if (!_province) {
        setCities([])
        return
      }
      setCities(_province.cities.map((city) => city.name))
      setUserData((old) => ({ ...old, [name]: value, city: null }))
      setInputValueDefault("city")
    } else {
      setUserData((old) => ({ ...old, [name]: value }))
    }
  }

  function setInputValueDefault(key) {
    Array.from(document.getElementById("orderComp").querySelectorAll("input, select"))
      .filter((el) => !key || el.name === key)
      .forEach((el) => {
        el.value = null
      })
  }

  function setDefaultInput() {
    const _defaultUserData = Array.from(document.getElementById("orderComp").querySelectorAll("input, select")).reduce(
      (sum, input) => ({ ...sum, [input.name]: null }),
      {}
    )
    setInputValueDefault()
    setUserData(_defaultUserData)
  }

  useEffect(() => {
    setDefaultInput()
  }, [])

  const buttonDisable = Object.keys(userData).some((key) => !userData[key] && ["name", "mobile", "addr"].some((val) => key === val))

  return (
    <div className="order-comp" id="orderComp">
      <div style={{ height: "15px" }} />
      <div className="order-title">订购资料</div>
      <div className="fill-area">
        <div>
          会员帐号：
          <input type="text" name="username" onChange={inputChange} />
        </div>
        <div>
          <font className="red">*</font>姓名：
          <input type="text" name="name" onChange={inputChange} />
        </div>
        <div>
          <font className="red">*</font>电话号码：
          <input type="text" name="mobile" onChange={inputChange} />
        </div>
        {props.needAddress && (
          <div className="city-field">
            <div>
              省：
              <Select name="province" onChange={inputChange}>
                <option />
                {provinces.map((province) => (
                  <option key={province.name}>{province.name}</option>
                ))}
              </Select>
            </div>
            <div>
              市：
              <Select name="city" disabled={cities.length === 0} onChange={inputChange}>
                {cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {props.needAddress && (
          <div>
            <font className="red">*</font>详细地址：
            <input type="text" placeholder="请输入详细地址" name="addr" onChange={inputChange} />
          </div>
        )}
      </div>
      <div style={{ height: "15px" }} />
      <button onClick={confirmEvent} disabled={buttonDisable} className="confirm-btn">
        确认
      </button>
    </div>
  )
}
