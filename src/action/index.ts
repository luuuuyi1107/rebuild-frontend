import config from "@/config/config"
import { notificationAsync } from "@/magic/notification"
import { toast } from "@/magic/toast"
import util from "@/magic/util"
import axios from "axios"

function _request(path, params, callback, method, type = "application/x-www-form-urlencoded") {
  let url = path.indexOf("http") > -1 ? path : config.apiUrl + path

  let obj: any = {
    method: method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": type,
    },
  }
  if (method == "POST" && type == "multipart/form-data") {
    obj.body = params
  } else if (method == "POST") {
    obj.body = util.buildFormData(params)
  } else if (method == "GET") {
    url = `${url}?${util.buildFormData(params)}`
  }

  fetch(url, obj)
    .then((res) => {
      if (res.status != 200) {
        return { status: res.status, Code: -2, Message: "Server error:" + res.status }
      }
      return res.json()
    })
    .then((resJson) => {
      try {
        callback(resJson)
      } catch (e) {
        console.error(e)
      }
    })
    .catch((err) => {
      toast("网络异常，请稍后再试")
      throw err
      // console.log(err)
      // try {
      //   callback({
      //     status: -1,
      //     Code: -2,
      //     Message: "网络异常，请稍后再试",
      //   })
      // } catch (e) {
      //   console.error(e)
      // }
    })
}
function buildApiAction(path, method: "POST" | "GET", params: Record<string, any>, callback?: (res) => void, ttl?: number) {
  return new Promise((resolve, reject) => {
    if (params == null || typeof params != "object") {
      params = {}
    }
    params.Authorization = getToken()
    if (ttl) {
      let key = `${path}-${JSON.stringify(params)}-${method}`
      let resp = util.cache.get(key, "session")
      if (resp && resp.ttl > new Date().getTime()) {
        if (callback) {
          callback(resp)
        }
        resolve(resp)
        return
      }
    }
    _request(
      path,
      params,
      (resp) => {
        if (resp.Code == 1) {
          if (ttl) {
            let key = `${path}-${JSON.stringify(params)}-${method}`
            resp.ttl = new Date().getTime() + ttl
            util.cache.set(key, resp, "session")
          }
        }
        if (callback) {
          callback(resp)
        }
        resolve(resp)
      },
      method
    )
  })
}

export function post(path: string, params: Record<string, any> = {}, callback?: (res) => void, ttl?: number): any {
  return buildApiAction(path, "POST", params, callback, ttl)
}
export function get(path: string, params: Record<string, any> = {}, callback?: (res) => void, ttl?: number): any {
  return buildApiAction(path, "GET", params, callback, ttl)
}

export function upload(url, data, contentType = "multipart/form-data") {
  return axios({
    method: "POST",
    url,
    data,
    headers: {
      "Content-Type": contentType,
    },
  })
}

export const apiHandler = async (callApi, { errorHandler, useToast = false }: { errorHandler?: (res: any) => void; useToast?: boolean } = {}) => {
  const res = await callApi()
  if (res.Code === 1) {
    return res
  }
  if (errorHandler) {
    await errorHandler(res)
  } else {
    if (res.Message.includes("Network request failed") && util.platform.isUCBrowser()) return
    if (res.Code === -5) {
      window.location.href = "/web/#/site/maintain"
      return
    }
    if (useToast) {
      toast(res.Message || "Network Error!")
    } else {
      await notificationAsync.alert(res.Message || "Network Error!")
    }
  }
  throw res
}

export const getToken = () => {
  let user = util.cache.get("user") || {}
  let urlToken = util.getUrlParam("token") || util.getUrlParam("CID") || ""
  let requestToken = urlToken || user.Token || null
  return `Bearer ${requestToken}`
}
