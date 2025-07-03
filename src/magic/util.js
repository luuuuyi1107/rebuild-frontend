import * as action from "@/action"
import { gameList, gamesById } from "@/config/game"
import pkGames from "@/config/pkGames"
import thirdGames from "@/config/platforms"
import copy from "copy-to-clipboard"
import _ from "lodash"
import lunarCalendar from "lunar-calendar"
import path from "path-browserify"
import { getPush } from "@/action/apis"
import { apiHandler } from "@/action"
import Bus from "@/magic/EventBus"
import { notificationAsync } from "./notification"
import { toast } from "./toast"

let cacheStorage = {}
const util = {
  getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },
  getOnlyNumber(text) {
    const match = text.match(/\d+/)
    if (match) {
      return Number(match[0])
    }
    return null
  },
  shortIssue(GameID) {
    var shortIssue = ""
    if (GameID == null) {
      return ""
    }
    if (GameID.indexOf("-") !== -1) {
      shortIssue = GameID.split("-")[1]
    } else if (GameID.length >= 6) {
      //抓最后三码
      var len = GameID.length
      shortIssue = GameID.substring(len - 3, len)
    } else {
      shortIssue = GameID
    }
    return shortIssue
  },

  convertChineseToNumber(str) {
    const chineseNumbers = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
    const pattern = new RegExp(`[${chineseNumbers.join("")}]`, "g")
    return str.replace(pattern, (match) => {
      return chineseNumbers.indexOf(match) + 1
    })
  },

  compareIssue(lastKai, ticketIssue) {
    if (lastKai === undefined || ticketIssue === undefined) {
      return false
    }

    var isCurrentIssue = lastKai === ticketIssue && lastKai !== ""

    if (!isCurrentIssue) {
      //特殊判定，1分六合彩getPUSH返回的是 20230215-303，
      //但是 投注记录返回的是 303
      //当判定失败后，重复进行判定
      if (lastKai.indexOf("-") !== -1) {
        var issueArr = lastKai.split("-")
        var simIssue = issueArr[1]

        let issueInt = parseInt(simIssue)
        let curIssueInt = parseInt(ticketIssue)

        isCurrentIssue = issueInt === curIssueInt

        if (ticketIssue.indexOf("-") !== -1) {
          var ticketIssue = ticketIssue.split("-")
          var simTicketIssue = ticketIssue[1]

          let curIssueInt = parseInt(simTicketIssue)

          isCurrentIssue = issueInt === curIssueInt
        }
      }
    }
    return isCurrentIssue
  },
  directToOldVersion() {
    const user = this.cache.get("user")
    const query = user?.Token && user.Token !== "NULL" ? `?cid=${user.Token}` : ""
    location.href = `/Default.Aspx${query}`
  },
  open(link, target) {
    if (this.platform.isUCBrowser()) {
      location.href = link
    } else {
      window.open(link, target)
    }
  },
  padStart(val, pos = 2, alt = "0") {
    return (new Array(pos).fill(alt).join("") + val).slice(-pos)
  },
  replaceReg(val, beReplacement, replacement = "") {
    if (!val || !beReplacement) return value
    const regex = new RegExp("\\" + beReplacement, "g")
    return val.replace(regex, replacement)
  },
  buildAssetsPath: function (filtPath) {
    if (typeof filtPath !== "string") {
      return ""
    }
    if (filtPath.startsWith("http://") || filtPath.startsWith("https://")) {
      return filtPath
    }
    return path.join("/web/public", filtPath)
  },
  buildFormData: function (params) {
    let arr = []
    for (var key in params) {
      arr.push(`${key}=${encodeURIComponent(params[key])}`)
    }
    return arr.join("&")
  },
  getUrlParam: function (name, url = window.location.href) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)")
    const r = url.includes("?") ? url.split("?").slice(1).join("&")?.match(reg) : url?.match(reg)
    if (r != null) return decodeURIComponent(r[2])
    return null
  },
  getServerTime() {
    let serverTime = this.cache.get("serverTime")
    if (serverTime) {
      return this.date.toDate(serverTime)
    } else {
      return null
    }
  },
  findGames: function (id, type) {
    return gamesById[id]
  },
  findGameId: function (id) {
    // if(id==0){
    //     return '全部'
    // }
    let thirdGameData = Object.values(thirdGames)
    let pkGameData = Object.values(pkGames)
    let title = "全部"
    gameList.map((item) => {
      if (item.id == id) {
        title = item.name
      }
    })
    thirdGameData.map((item) => {
      if (item.lotteryId == id) {
        title = item.title
      } else if (!!item.games) {
        item.games.some((game) => {
          if (game.params?.lotteryId == id) {
            title = game.name
          }
        })
      }
    })
    pkGameData.map((item) => {
      if (item.lotteryId == id) {
        title = item.title
      }
    })
    return title
  },
  triggerEvent: function (name, data) {
    let e = new CustomEvent(name, { detail: data })
    if (window.dispatchEvent) {
      window.dispatchEvent(e)
    } else if (window.fireEvent) {
      window.fireEvent(e)
    }
  },
  isLogin: function () {
    let user = this.cache.get("user")
    return user && user.Token && user.ID
  },
  isLoginOrNoti({ router, route }) {
    const isLogin = this.isLogin()
    if (!isLogin) {
      notificationAsync
        .confirm("用户未登录,或者token过期", {
          title: "您尚未登陆",
          buttonLabels: ["返回", "登陆"],
        })
        .then(() => {
          router.push(`/site/login`, { redirect: route.pathname + route.search })
        })
    }
    return isLogin
  },
  isTrialAccount() {
    let user = this.cache.get("user")
    return this.isLogin() && user.UserType === 1
  },
  trialCheck({ forGame = false, alertText = "" } = {}) {
    if (this.isTrialAccount()) {
      toast(alertText ? alertText : forGame ? "试玩账号不能进行此游戏" : "试玩账号不允许此操作")
      throw new Error("not allow for trial account")
    }
  },
  getUserId() {
    let user = this.cache.get("user")
    return user?.ID || ""
  },
  getUserData(key) {
    let user = this.cache.get("user")
    if (key) {
      return _.get(user, key, "")
    }
    return user
  },
  hasOrderPostToken() {
    const orderpostData = this.cache.get("orderPostData")
    return !!orderpostData && orderpostData.hasOwnProperty("Token")
  },
  getOrderPostToken() {
    const orderpostData = this.cache.get("orderPostData")
    return !!orderpostData && orderpostData.hasOwnProperty("Token") ? orderpostData.Token : null
  },
  getOrderPostMessage() {
    const orderpostData = this.cache.get("orderPostData")
    return !!orderpostData && orderpostData.hasOwnProperty("Message") ? orderpostData.Message : null
  },
  getUserByKey(key) {
    if (!key) return null

    const user = this.cache.get("user")
    return !user ? null : user[key]
  },
  oauthCodeBuilder(url, code) {
    const decodeUrl = decodeURIComponent(url)
    const parsedUrl = new URL(decodeUrl)
    if (parsedUrl.href.includes("#")) {
      const hashParts = parsedUrl.hash.split("?")
      const searchParams = hashParts.length > 1 ? hashParts[1] : ""
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.append("provider", "76")
      newSearchParams.append("Oauth_Code", code)
      return `${parsedUrl.origin}${parsedUrl.pathname}#/?${newSearchParams.toString()}`
    } else {
      parsedUrl.searchParams.set("Oauth_Code", code)
      return parsedUrl.href
    }
  },
  removeTag(content, tag) {
    return !!content && !!tag ? content.replace(new RegExp(`\\[${tag}=(.*?)\\](.*?)\\[\\/${tag}\\]`, "g"), "$2") : content
  },

  formatUbb(content) {
    if (!content) {
      return ""
    }
    content = content.replace(/\[img\](.*?)\[\/img\]/g, '<img src="$1"/>')
    content = content.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1">$2</a>')
    content = content.replace(/<a href="(.*?)#target=(.*?)">/g, '<a href="$1" target="$2">')
    content = content.replace(/<a href="(.*?)#&amp;f_u_c_k=y_o_u">/g, "<a href=\"$1\" target='_blank'>")
    content = content.replace(/\(strong\)(.*?)\(\/strong\)/g, "<strong>$1</strong>")
    content = content.replace(/\{Copy\}(.*?)\{\/Copy\}/g, "<span class='ubb-copy-btn' onclick='copy(this)' data='$1'>$1<button>复制</button></span>")
    return content
  },
  sleep: function (time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  },
  callService() {
    const serviceLink = this.cache.get("serviceLink")
    const prev = serviceLink.startsWith("http") ? "" : "/"
    this.open(prev + serviceLink, "_self")
  },
  arrayToMap: function (array, key) {
    if (!array) {
      return null
    }
    let map = {}
    for (let i = 0; i < array.length; i++) {
      if (array[i] != null) {
        map[array[i][key]] = array[i]
      }
    }
    return map
  },
  cityToAntPickerView: function (cities) {
    let citiesString = JSON.stringify(cities)
    citiesString = citiesString
      .replace(/id/g, "value")
      .replace(/name/g, "label")
      .replace(/cities/g, "children")
    return JSON.parse(citiesString)
  },
  numberRoundedFix(numb, position) {
    const _times = Math.pow(10, position || 3)
    return Math.round(numb * _times) / _times
  },
  removeRepeatDataFromArray(list) {
    return Array.from(new Set(list))
  },
  pickRandamUpWithArray(arr, num) {
    const randomNumber = num || 2
    const randomIndexes = []
    while (randomIndexes.length < randomNumber) {
      const randomIndex = Math.floor(Math.random() * arr.length)
      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex)
      }
    }
    return randomIndexes.map((index) => arr[index])
  },
  formatMoney(num, minimumFractionDigits = 2, maximumFractionDigits) {
    if (isNaN(num) || num === 0 || !num) return "0." + "0".repeat(minimumFractionDigits)
    if (num < 1) {
      const minThreshold = 1 / 10 ** minimumFractionDigits
      if (num < minThreshold) return minThreshold
    }
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits, // 小数点后最少保留位数
      maximumFractionDigits: Math.max(maximumFractionDigits || minimumFractionDigits, minimumFractionDigits), // 小数点后最多保留位数
    }).format(num)
  },

  scrollToBottom(myDiv, bottom = true) {
    const start = myDiv.scrollTop
    const end = bottom ? myDiv.scrollHeight - myDiv.clientHeight : 0
    const duration = 200 // duration of the animation in milliseconds
    let startTime = null
    function animation(currentTime) {
      if (startTime === null) startTime = currentTime
      const elapsedTime = currentTime - startTime
      const scrollValue = easeInOutCubic(elapsedTime, start, end - start, duration)
      myDiv.scrollTop = scrollValue
      if (elapsedTime < duration) {
        requestAnimationFrame(animation)
      }
    }
    function easeInOutCubic(t, b, c, d) {
      t /= d / 2
      if (t < 1) return (c / 2) * t * t * t + b
      t -= 2
      return (c / 2) * (t * t * t + 2) + b
    }
    requestAnimationFrame(animation)
  },

  copyToClipBoard(text) {
    copy(text)
  },
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },
  validatePhone(phoneNumber) {
    return /^1[345789]\d{9}$/.test(phoneNumber)
  },
  mapBetCount(config) {
    return _.mapValues(config, (value) => value.betCount)
  },
  ipv6ToIpv4Format(ipv6) {
    // 判断是否为 IPv6 格式
    const ipv6Regex =
      /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/

    // 如果不是 IPv6 格式，直接返回原始输入
    if (!ipv6 || !ipv6Regex.test(ipv6)) {
      return ipv6
    }

    try {
      // 分割 IPv6 地址为各部分
      const parts = ipv6.split(":")

      // 取最后两组十六进制值
      const last1 = parseInt(parts[parts.length - 2], 16)
      const last2 = parseInt(parts[parts.length - 1], 16)

      // 如果解析失败，返回原始输入
      if (isNaN(last1) || isNaN(last2)) {
        return ipv6
      }

      // 转换为 4 个 0-255 的数字（类似 IPv4 的格式）
      const byte1 = (last1 >> 8) & 0xff // 取高 8 位
      const byte2 = last1 & 0xff // 取低 8 位
      const byte3 = (last2 >> 8) & 0xff // 取高 8 位
      const byte4 = last2 & 0xff // 取低 8 位

      // 返回类似 IPv4 的格式
      return `${byte1}.${byte2}.${byte3}.${byte4}`
    } catch (error) {
      // 发生任何错误，返回原始输入
      console.error("IPv6 转换失败:", error)
      return ipv6
    }
  },
  date: {
    toDate(str) {
      return !str ? "" : new Date(parseInt(str.substr(6)))
    },
    //格式化日期 yyyy-MM-dd h:m:s.S 星期W
    format: function (date, fmt, timeZone) {
      if (!date) return ""
      if (typeof timeZone != "undefined") {
        date = new Date(date.getTime() + date.getTimezoneOffset() * 60000 + timeZone * 60 * 60000)
      }
      var cn_week = ["日", "一", "二", "三", "四", "五", "六"]
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "D+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        w: date.getDay(),
        W: cn_week[date.getDay()],
        S: date.getMilliseconds(), //毫秒
      }
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
      }
      if (/(Y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
        }
      }
      return fmt
    },

    formatRemaintingTime: function (millSecond, withDateHours = true) {
      if (millSecond <= 0) {
        return ""
      }
      let allSecond = Math.floor(millSecond / 1000)

      let hour = Math.floor(allSecond / 3600)
      let day = Math.floor(hour / 24)
      let hourSecond = hour * 3600
      // let hourLen = hour >= 100 ? 3:2;

      let minute = Math.floor((allSecond - hourSecond) / 60)
      let minuteSecond = minute * 60

      let second = allSecond - hourSecond - minuteSecond

      if (withDateHours) {
        return [
          hour > 23 ? day + "天  " : "",
          hour > 0 ? (Array(2).join(0) + (hour % 24)).slice(-2) + ":" : "00:",
          hour > 0 || minute > 0 ? (Array(2).join(0) + minute).slice(-2) + ":" : "00:",
          hour > 0 || minute > 0 || second >= 0 ? (Array(2).join(0) + second).slice(-2) : "00",
        ].join("")
      } else {
        return [
          // hour > 23 ? day + "天  " : "",
          // hour > 0 ? (Array(2).join(0) + (hour % 24)).slice(-2) + ":" : "00:",
          hour > 0 || minute > 0 ? (Array(2).join(0) + minute).slice(-2) + ":" : "00:",
          hour > 0 || minute > 0 || second >= 0 ? (Array(2).join(0) + second).slice(-2) : "00",
        ].join("")
      }
    },
  },

  getPushData: async () => {
    const res = await apiHandler(() => getPush({ keys: ["fristlatestmsg", "broadcast"] }), { errorHandler: () => {} })
    Bus.emit("getPush.trigger", res.Data)
    util.triggerEvent("globalMessage", res.Data)
  },

  jumpToThirdGame: _.throttle(
    async (game, _config) => {
      await util.getPushData() // 离开前再更新一次推送数据 为了更新使用者的资料

      const config = _config || thirdGames[game.params.platform] || null
      if (!config) throw "未找到游戏配置"
      const enterGameApi = config.enterGameApi
      let params = { ...config.enterGameApi.params } || {}
      if (game.gameType) {
        params.gameType = game.gameType
      }
      if (game.KindID) {
        params.KindID = game.KindID
      }

      if (game.gameCode) {
        params.gameCode = game.gameCode
      }

      if (game.id) {
        params.gameid = game.id
      }
      if (game.params) {
        params = Object.assign(params, game.params)
      }

      params.backUrl = ["PG", "SPB"].some((stitle) => config.shortTitle === stitle)
        ? encodeURIComponent(window.location.href)
        : window.location.origin

      let urlParts = enterGameApi.url
      let res = await action[enterGameApi.method](urlParts, params)
      if (res.Code != 1) {
        throw res.Message
      } else {
        let _url = typeof res.Data === "string" ? res.Data : res.Data.URL ? res.Data.URL : res.Data.LaunchUrl
        if (game.id === "FFANIMAL" || game.id === "SFANIMAL") {
          const [baseUrl, query] = _url.split("?")
          _url = `${baseUrl}lottery/animal/animate/${game.id === "FFANIMAL" ? "1" : "3"}m?lx=1&id=${game.params.lotteryid}&${query}`
        }
        window.location.href = _url
      }
    },
    1500,
    { leading: true, trailing: false }
  ),

  formatNumber(value, decimalPlaces = 2) {
    // 检查是否为文字类型
    if (typeof value === "string" && isNaN(Number(value))) {
      return value // 是纯文字，直接返回
    }
    // 将值转换为数字
    const _number = Number(value)
    // 检查是否为有效数字
    if (isNaN(_number)) {
      return value // 无效数字，返回原始值
    }

    // 限制小数位数并返回
    return _number.toFixed(decimalPlaces)
  },

  cache: {
    setCookie: function (cname, cvalue, exdays) {
      var d = new Date()

      if (exdays == "tomorrow") {
        var nowTime = 86400 - (d.getHours() * 60 * 60 + d.getMinutes() * 60 + d.getSeconds())
        d.setTime(d.getTime() + nowTime * 1000)
      } else if (exdays == "moment") {
        d.setTime(d.getTime() + 1000 * 60)
      } else {
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
      }
      // d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toGMTString()
      document.cookie = cname + "=" + cvalue + "; " + expires
    },
    getCookie: function (cname) {
      var name = cname + "="
      var ca = document.cookie.split(";")
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim()
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
      }
      return ""
    },
    _get: function (key, type) {
      try {
        let ret = ""
        if (type != "session" && window.localStorage) {
          ret = window.localStorage.getItem(key)
        } else if (type == "session" && window.sessionStorage) {
          ret = window.sessionStorage.getItem(key)
        } else {
          ret = this.getCookie(key)
        }
        if (!ret) {
          return null
        }
        return JSON.parse(ret)
      } catch (err) {
        alert(err)
        return null
      }
    },
    get: function (key, type) {
      return key !== "user" && !!cacheStorage[key] ? cacheStorage[key] : this._get(key, type)
      // var ret = cacheStorage[key];
      // if (ret) {
      //     return ret;
      // }
      // return this._get(key, type);
    },
    set: function (key, value, type) {
      try {
        // if(key == "user"){
        //     alert("set-user:"+ JSON.stringify(value));
        // }
        cacheStorage[key] = value
        if (typeof value == "undefined") {
          value = ""
        } else {
          value = JSON.stringify(value)
        }
        if (type != "session" && window.localStorage) {
          window.localStorage.setItem(key, value)
        } else if (type == "session" && window.sessionStorage) {
          window.sessionStorage.setItem(key, value)
        } else {
          this.setCookie(key, value, 1)
        }
      } catch (err) {
        alert(err)
      }
    },
    remove(key, type) {
      const _storage = window[type === "session" ? "sessionStorage" : "localStorage"]

      if (cacheStorage.hasOwnProperty(key)) {
        delete cacheStorage[key]
      }

      if (!!_storage.getItem(key)) _storage.removeItem(key)
    },
    removeStartsWith(prefix, type) {
      if (type === "cookie" || type === "all") {
        document.cookie.split("; ").forEach((cookie) => {
          if (cookie.startsWith(prefix)) {
            const name = cookie.split("=")[0]
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          }
        })
        if (type !== "all") return
      }

      const removeStorage = (_storage) => {
        Object.keys(_storage).forEach((key) => {
          if (key.startsWith(prefix)) {
            delete cacheStorage[key]
            const item = JSON.parse(_storage.getItem(key))
            item.ttl = 0
            _storage.setItem(key, JSON.stringify(item))
          }
        })
      }

      if (type === "local" || type === "all" || !type) {
        removeStorage(localStorage)
      }

      if (type === "session" || type === "all") {
        removeStorage(sessionStorage)
      }
    },
  },

  platform: {
    getPlatform() {
      if (!/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) {
        return "pc"
      } else if (navigator.userAgent.indexOf("iphone") != -1) {
        return "ios"
      } else if (navigator.userAgent.indexOf("android") != -1) {
        return "android"
      } else if (navigator.userAgent.indexOf(" qq") > -1 && navigator.userAgent.indexOf("mqqbrowser") < 0) {
        //QQ 内置浏览器
        return "wechat"
      } else {
        return "wap"
      }
    },
    isIOS() {
      return navigator.userAgent.toLowerCase().indexOf("iphone") != -1
    },
    isAndroid() {
      return navigator.userAgent.toLowerCase().indexOf("android") != -1
    },
    isWap() {
      return this.getPlatform() == "wap"
    },
    isUCBrowser() {
      return navigator.userAgent.toLowerCase().indexOf("ucbrowser") != -1
    },
  },
  math: {
    factorial: function (n) {
      // 计算n阶乘
      return n > 1 ? n * this.factorial(n - 1) : 1
    },
    combination: function (n, m) {
      // 计算组合数 C(n, m)
      return n >= m ? this.factorial(n) / this.factorial(n - m) / this.factorial(m) : 0
    },
  },
  getZodiacnimals() {
    return ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]
  },
  getLunarYear(date = new Date()) {
    const lunarToday = lunarCalendar.solarToLunar(date.getFullYear(), date.getMonth() + 1, date.getDate())
    return lunarToday.lunarYear
  },
  getZodiacnimalObj(date = new Date()) {
    const zodiacAnimals = this.getZodiacnimals()
    return new Array(12).fill(this.getLunarYear(date)).reduce((sum, year, index) => ({ ...sum, [zodiacAnimals[(year - index - 4) % 12]]: index }), {})
  },
  getZodiacnimalList(activeKey, normalKey, key, date = new Date(), maxBallNumber) {
    const _zodiacAnimalIndexObj = this.getZodiacnimalObj(date)
    return [
      {
        key,
        title: "",
        column: "4",
        maxBallNumber,
        list: util
          .getZodiacnimals()
          .map((text) => ({ text, shape: "rect", odds: _zodiacAnimalIndexObj[text] === 0 ? activeKey : normalKey, color: "", dx: "", ds: "" })),
      },
    ]
  },
  makeCancelable(promise) {
    let hasCanceled = false

    const wrappedPromise = new Promise((resolve, reject) => {
      promise
        .then((val) => (hasCanceled ? reject({ isCanceled: true }) : resolve(val)))
        .catch((error) => (hasCanceled ? reject({ isCanceled: true }) : reject(error)))
    })

    return {
      promise: wrappedPromise,
      cancel() {
        hasCanceled = true
      },
    }
  },
}
window.util = util
export default util
