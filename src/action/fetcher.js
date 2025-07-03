import util from "@/magic/util"
import { getToken } from "./index"
import _ from "lodash"
import config from "@/config/config"
import axios from "axios"
import { getOrderPostUserAuth } from "./apis"
import dayjs from "dayjs"
import { toast } from "@/magic/toast"

const REQUEST_ERROR_CODE = 10001

class BaseFetcher {
  static request({ url, method, data }) {
    return axios({
      url,
      method,
      data: method === "POST" ? this.objectToFormData(data) : undefined,
      params: method === "GET" ? data : undefined,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.data
      })
      .catch((e) => {
        let response
        if (e.response) {
          response = JSON.stringify({
            status: e.response.status,
            statusText: e.response.statusText,
            data: e.response.data,
          })
          toast(e.response.statusText)
          throw e
        }
        toast("网络异常，请稍后再试")
        throw {
          status: -1,
          response,
          Code: REQUEST_ERROR_CODE,
          Message:
            "Axios Network error!\n" +
            Object.entries(data)
              .map(([k, v]) => `${k}: ${v}`.substring(0, 100))
              .join("\n") +
            `\n` +
            `url: ${url} \n` +
            `response: ${response} \n` +
            `code: ${e.code} \n` +
            `error: ${e.toJSON?.() || e.toString()}\n`,
        }
      })
  }
  static objectToFormData(object, formData = new FormData(), parentKey) {
    Object.keys(object).forEach((key) => {
      const currentKey = parentKey ? `${parentKey}[${key}]` : key
      if ([Array, Object].includes(object[key].constructor)) {
        this.objectToFormData(object[key], formData, currentKey)
      } else {
        formData.append(currentKey, object[key])
      }
    })
    return formData
  }
}

export class OrderPostFetcher extends BaseFetcher {
  static passOrigins = []
  static currentIndex = 0
  static currentOrigin
  static sendRequest = false
  static async getOrderPostOrigin() {
    // const cacheIpData = util.cache.get("ipData")
    // if (cacheIpData && dayjs().isBefore(cacheIpData.time)) {
    //   this.currentOrigin = cacheIpData.currentOrigin
    //   this.passOrigins = JSON.parse(cacheIpData.passOrigins || "[]")
    // }
    // if (this.currentOrigin) return this.currentOrigin
    // if (this.sendRequest) {
    //   return new Promise((resolve) => {
    //     Bus.on("ip.check.done", resolve)
    //   })
    // }
    // this.sendRequest = true

    // let origins = await getPush({ keys: ["drawmoneyset"] })
    //   .then((res) => {
    //     return res.Data.DrawMoneySet.WebPostAPI || ""
    //   })
    //   // fetch("/public/order_post_urls.txt")
    //   //   .then((res) => res.text())
    //   .then((text) => text.split(/\r\n|\r|\n/))
    //   .then((urls) =>
    //     _(urls)
    //       .filter((x) => x)
    //       .map((x) => x.trim())
    //       .uniq()
    //       .value()
    //   )
    // this.passOrigins = await Promise.all(
    //   [config.apiNewUrl, ...origins].map(async (url) => {
    //     try {
    //       if (url === config.apiNewUrl) return url
    //       await axios.get(new URL("Home/InternetSpeed", url).href, { timeout: 4000 })
    //       return url
    //     } catch (e) {}
    //   })
    // ).then((urls) => {
    //   return urls.filter((x) => x)
    // })

    // Bus.emit("ip.check.done", this.currentOrigin)
    // this.cacheIpData()
    this.currentOrigin = config.apiNewUrl
    return this.currentOrigin
  }

  static cacheIpData() {
    util.cache.set("ipData", {
      currentOrigin: this.currentOrigin,
      passOrigins: JSON.stringify(this.passOrigins),
      time: dayjs().add(15, "minute").format("YYYY/MM/DD HH:mm:ss"),
    })
  }

  static async urlBuilder(uri) {
    return new URL(uri, await this.getOrderPostOrigin()).href
  }

  static async post(uri, data) {
    return this.errorHandler(async () =>
      this.request(
        await this.bodyProccess({
          uri,
          method: "POST",
          data,
        })
      )
    )
  }

  static get(uri, data) {
    return this.errorHandler(async () =>
      this.request(
        await this.bodyProccess({
          uri,
          method: "GET",
          data,
        })
      )
    )
  }

  static async bodyProccess({ uri, data = {}, method }) {
    return {
      url: await this.urlBuilder(uri),
      method,
      data: Object.assign(data, { Authorization: getToken(), OrderUserToken: util.cache.get("orderPostData")?.Token }),
    }
  }

  static async errorHandler(fn, reTry = 1) {
    if (!util.cache.get("orderPostData")) {
      await getOrderPostUserAuth()
    }
    const res = await fn()
    if (res.Code == -1) {
      await getOrderPostUserAuth()
      return fn()
    }

    if (res.Code == REQUEST_ERROR_CODE && !res.response) {
      if (this.passOrigins.length <= reTry) return this.errorAssignResMessage(fn)
      this.currentIndex = (this.currentIndex + 1) % this.passOrigins.length
      this.currentOrigin = this.passOrigins[this.currentIndex]
      this.cacheIpData()
      return this.errorHandler(fn, reTry + 1)
    }
    return res
  }

  static async errorAssignResMessage(fn) {
    const res = await fn()
    if (res.Code == REQUEST_ERROR_CODE && !res.response) {
      res.Message += `passOrigins: ${JSON.stringify(this.passOrigins)} \n` + `index: ${this.currentIndex} \n`
    }
    return res
  }
}
