import { appOpen, isSafari } from "@/magic/os"
import util from "@/magic/util"
import _ from "lodash"

export class ORDER_PAYMENT {
  // TYPE is for OrderPost // 挂单 // 后端设定
  // C_TYPE is for BankList Category // 后台设定 //目前协议与挂单一样，但难保哪天不一样所以切开
  static get ALIPAY() {
    return {
      NAME: "支付宝扫码",
      NAME2: "支付宝",
      NAME3: "转支付宝",
      ICON: "assets/icons/ic_alipay.png",
      TYPE: 2,
      C_TYPE: 2,
      PREFIX: ["https://qr.alipay.com/"],
      QRCODE: true,
      ORDER_SORT: 1,
      WITHDRAW_ORDER: true,
      APP_NAME: "支付宝",
      MULTIPLE: true,
      onAppOpen(info: { account: string }) {
        // https://ds.alipay.com/?from=pc&appId=09999988&actionType=toAccount&sourceId=bill&amount=100.00&account=17398721734
        // appOpen(`alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(info.account)}`)
        const url = isSafari() ? info.account.replace("https://ds.alipay.com/", "alipays://platformapi/startapp?appId=20000067&url=") : info.account
        appOpen(url)
      },
      MAXIMUM_CARD_LIMIT: 3,
    }
  }
  static get WECHAT() {
    return {
      NAME: "微信扫码",
      NAME2: "微信",
      NAME3: "转微信",
      ICON: "assets/icons/ic_wxp.png",
      TYPE: 1,
      C_TYPE: 1,
      PREFIX: ["wxp://", "https://payapp"],
      QRCODE: true,
      ORDER_SORT: 2,
      WITHDRAW_ORDER: true,
      APP_NAME: "微信",
      MULTIPLE: true,
      onAppOpen(_info: { account: string }) {
        appOpen("weixin://")
      },
      checkIsNAME3(account: string) {
        if (!account.startsWith(this.PREFIX[0])) return false
        const cleanedAccount = account.replace("wxp://", "")
        return cleanedAccount.length === 11 && cleanedAccount.replace(/\D/g, "").length == 11
      },
      MAXIMUM_CARD_LIMIT: 3,
    }
  }
  static get BANK() {
    return {
      NAME: "默认渠道",
      NAME2: "银行卡",
      NAME3: "",
      ICON: "assets/icons/ic_bank.png",
      TYPE: 3,
      C_TYPE: 3,
      PREFIX: [],
      QRCODE: false,
      ORDER_SORT: 3,
      WITHDRAW_ORDER: false,
      APP_LINK: "",
      APP_NAME: "支付宝",
      MULTIPLE: true,
      onAppOpen(info: { account: string; userName: string; bank: string }) {
        // const url = `https://ds.alipay.com/?from=pc&appId=09999988&actionType=toCard&sourceId=bill&cardNo=${info.account}&bankAccount=${info.userName}`
        // appOpen(`alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(url)}`)

        const url = `alipays://platformapi/startapp?appId=09999988&actionType=toCard&sourceId=bill&cardNo=${info.account}&bankAccount=${info.userName}&money=1&amount=1&bankName=${info.bank}&cardIndex=CARDID&cardNoHidden=false&orderSource=from`

        appOpen(url)
      },
      MAXIMUM_CARD_LIMIT: 3,
    }
  }
  static get CNY() {
    return {
      NAME: "数字人民币",
      NAME2: "数字人民币",
      NAME3: "",
      ICON: "assets/icons/ic_cny.png",
      TYPE: 4,
      C_TYPE: 4,
      PREFIX: [],
      QRCODE: false,
      ORDER_SORT: 4,
      WITHDRAW_ORDER: false,
      APP_NAME: "数字人民币",
      MULTIPLE: true,
      onAppOpen(info: { account: string }) {
        util.copyToClipBoard(info.account)
        appOpen("dcep://uniwallet/user/faq")
      },
      MAXIMUM_CARD_LIMIT: 3,
    }
  }
  static get QQ() {
    return {
      NAME: "QQ钱包",
      NAME2: "QQ钱包",
      NAME3: "",
      ICON: "assets/icons/ic_qq.png",
      TYPE: 5,
      C_TYPE: 5,
      PREFIX: ["https://i.qianbao.qq.com/"],
      QRCODE: true,
      ORDER_SORT: 5,
      WITHDRAW_ORDER: true,
      APP_NAME: "QQ钱包",
      MULTIPLE: false,
      onAppOpen(_info: { account: string }) {
        appOpen("https://i.qianbao.qq.com/wallet/sqrcode.htm?")
      },
      MAXIMUM_CARD_LIMIT: 1,
    }
  }
  static get UNION_PAY() {
    return {
      NAME: "云闪付",
      NAME2: "云闪付",
      NAME3: "",
      ICON: "assets/icons/ic_union_pay.png",
      TYPE: 6,
      C_TYPE: 6,
      PREFIX: [],
      QRCODE: false,
      ORDER_SORT: 6,
      WITHDRAW_ORDER: false,
      MULTIPLE: true,
      accountValidate(account: string) {
        return !/[^\d]/.test(account) && account.length <= 11
      },
      MAXIMUM_CARD_LIMIT: 1,
    }
  }

  static get ALL() {
    return [this.ALIPAY, this.WECHAT, this.BANK, this.CNY, this.QQ, this.UNION_PAY]
  }
  static get ALL_NAMES() {
    return this.ALL.map((x) => x.NAME)
  }
  static get ALL_NAMES2() {
    return this.ALL.map((x) => x.NAME2)
  }
  static findPaymenByCType = (cType: string) => _.mapKeys(this.ALL, "C_TYPE")[cType]
  static findPaymenByType = (type: string) => _.mapKeys(this.ALL, "TYPE")[type]
}

export class VIRTUAL_PAYMENT {
  static get C_TYPE() {
    return 0
  }
  static get NAME() {
    return "虚拟钱包"
  }
  static get NAME2() {
    return this.NAME
  }
  static get QRCODE() {
    return false
  }
  static get WITHDRAW_ORDER() {
    return false
  }
  static get ICON() {
    return "assets/icons/ic_virtual_pay.png"
  }
}
export class MOBILE_PAYMENT {
  static get TYPE() {
    return 7
  }
  static get C_TYPE() {
    return 7
  }
  static get NAME() {
    return "手机充值"
  }
  static get NAME2() {
    return this.NAME
  }
  static get QRCODE() {
    return false
  }
  static get WITHDRAW_ORDER() {
    return false
  }
  static get ICON() {
    return "assets/icons/ic_phone.png"
  }
  static get ORDER_SORT() {
    return 7
  }
  static toJSON() {
    const staticPropNames = Object.getOwnPropertyNames(this).filter((prop) => prop !== "prototype" && prop !== "length" && prop !== "name")
    const staticProps = {} as Record<keyof typeof MOBILE_PAYMENT, any>
    staticPropNames.forEach((prop) => {
      staticProps[prop as keyof typeof MOBILE_PAYMENT] = this[prop as keyof typeof MOBILE_PAYMENT]
    })
    return staticProps
  }
}

export const USDT_NAME = "USDT"

export const findPaymentIconByType = (type: string | number) => {
  const payment = ORDER_PAYMENT.findPaymenByType(type + "")
  return payment?.ICON || (type == MOBILE_PAYMENT.TYPE ? MOBILE_PAYMENT.ICON : "")
}

export const findTelecomIconByName = (name: string) => {
  const image = {
    中国移动: "china_mobile",
    中国联通: "china_unicom",
    中国电信: "china_telecom",
  }[name]
  return util.buildAssetsPath(`assets/icons/telecom/${image}.png`)
}
