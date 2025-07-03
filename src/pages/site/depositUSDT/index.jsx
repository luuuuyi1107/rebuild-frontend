import React from "react"

import LayoutPage from "@/components/LayoutPage"
import util from "@/magic/util"
import styles from "./style.module.scss"
import ClipboardJS from "clipboard"
import { Button } from "react-onsenui"
import { useRouter } from "@/magic/withRouter"
import { getPush, getSubBankList, payFunPay } from "@/action/apis"
import { computed, onMounted, onUnmounted, reactive } from "@/magic/hook/vue"
import constants from "@/config/constants"
import classNames from "classnames"
import { generateQRCode } from "@/magic/qrcode"
import { notificationAsync } from "@/magic/notification"
import { apiHandler } from "@/action"
import { withLogin } from "@/magic/withLogin"

export default withLogin(() => {
  const initData = reactive({
    info: {
      banks: [],
      set: {},
    },
    options: {
      protocol: [
        { name: "USDT(TRC-20)", value: "TRC-20" },
        { name: "USDT(ERC-20)", value: "ERC-20" },
      ],
    },
    search: {
      protocol: "TRC-20",
    },
    req: {
      name: "",
      money: "",
      time: util.date.format(new Date(), "yyyy-MM-dd  hh:mm:ss"),
    },
    showPopup: false,
    loading: true,
  })
  const currentBank = computed(() => initData.info.banks.find((x) => x.Payee === initData.search.protocol) || {})
  const currentAddress = computed(() => currentBank.Account)
  const depositMoney = computed(() => (initData.req.money ? (initData.req.money * initData.info.set.Usdt).toFixed(2) : 0))
  const deposit = async () => {
    const { time: PayTime, money: Money, name: Payee } = initData.req
    const res = await apiHandler(() =>
      payFunPay({
        Payee,
        PayTime,
        Money,
        id: currentBank.ID,
      })
    )
    notificationAsync.alert(res.Message)
  }
  let clipboardInstance
  onMounted(async () => {
    const [pushRes, bankRes] = await Promise.all([getPush({ keys: "drawmoneyset" }), getSubBankList({ id: constants.USDT_BANK_ID })])
    initData.info.set = pushRes.Data.DrawMoneySet
    initData.info.banks = bankRes.Data
    initData.loading = false
    initData.showPopup = !!initData.info.banks.find((x) => x.Payee === initData.search.protocol).PopUpMsg
    clipboardInstance = new ClipboardJS(".copy-btn")
    clipboardInstance.on("success", () => {
      notificationAsync.alert("已成功复制到剪贴板")
    })

    clipboardInstance.on("error", () => {
      notificationAsync.alert("请手动选择文字进行复制")
    })
  })
  onUnmounted(() => {
    clipboardInstance?.destroy()
  })
  return (
    <LayoutPage
      className={styles["site-deposit-usdt"]}
      right={null}
      center={initData.showPopup ? "汇款条款" : "USDT货币线下充值"}
      loading={initData.loading}
    >
      {initData.showPopup ? (
        <div className="pop-bg">
          <div className="pop-box">
            <div className="pop-content">
              <div className="title">请仔细阅读条款</div>
              <div dangerouslySetInnerHTML={{ __html: currentBank.PopUpMsg }}></div>
            </div>
            <div className="confirm-btn">
              <Button
                onClick={() => {
                  initData.showPopup = false
                }}
              >
                确认
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="info">
          <div className="px-1.5 font-bold py-1">收款信息</div>
          <div className="px-1.5 bg-white">
            <div className="item h-4">
              <div className="w-6 v-center">选择协议</div>
              <div className="v-center">
                <div className="flex">
                  {initData.options.protocol.map((p) => (
                    <div
                      key={p.value}
                      className={classNames("protocol-switch rounded-sm px-1 py-0.5 border border-solid border-gray-500 mr-1 whitespace-nowrap", {
                        active: initData.search.protocol == p.value,
                      })}
                      onClick={() => {
                        initData.search.protocol = p.value
                      }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="px-1.5 bg-white">
            <div className="item h-4">
              <div className="w-6 v-center">收款地址</div>
              <div className="flex-1 my-auto overflow-hidden">
                <div className="w-[98%] break-all">{currentAddress}</div>
              </div>
              <div className="v-center">
                <div className="copy-btn" data-clipboard-text={currentAddress}>
                  复制
                </div>
              </div>
            </div>
          </div>
          <div className="px-1.5 bg-white">
            <div className="item py-1">
              <div className="w-6 v-center">扫码支付</div>
              <div>
                <span
                  dangerouslySetInnerHTML={{
                    __html: generateQRCode(currentAddress, {
                      cellSize: 6,
                      margin: 4,
                    }),
                  }}
                ></span>
              </div>
            </div>
          </div>
          <div className="px-1.5 font-bold py-1">您的充值信息</div>
          {currentBank.FillName && (
            <div className="px-1.5 bg-white">
              <div className="item h-4">
                <div className="w-6 v-center">汇款姓名</div>
                <div className="flex-1 v-center">
                  <input
                    placeholder="请输入汇款人姓名"
                    type="text"
                    className="border-0 w-full"
                    onChange={(e) => {
                      initData.req.name = e.target.value
                    }}
                    defaultValue={initData.req.name}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="px-1.5 bg-white">
            <div className="item h-4">
              <div className="w-6 v-center">充值个数</div>
              <div className="flex-1 v-center">
                <input
                  placeholder="请输入充值个数"
                  type="number"
                  className="border-0 w-full"
                  onChange={(e) => {
                    if (!isNaN(+e.target.value)) {
                      initData.req.money = e.target.value
                    }
                  }}
                  value={initData.req.money}
                />
              </div>
            </div>
          </div>
          <div className="px-1.5 bg-white">
            <div className="item h-4">
              <div className="w-6 v-center">USDT汇率</div>
              <div className="text-red-500 v-center">{initData.info.set.Usdt}</div>
            </div>
          </div>
          <div className="px-1.5 bg-white">
            <div className="item h-4">
              <div className="w-6 v-center">充值金额</div>
              <div className="text-red-500 v-center">约{depositMoney}人民币</div>
            </div>
          </div>
          <div className="px-1.5 bg-white">
            <div className="item h-4">
              <div className="w-6 v-center">充值时间</div>
              <div className="v-center">{initData.req.time}</div>
            </div>
          </div>

          <div className="submit pb-1">
            <Button
              onClick={() => {
                deposit()
              }}
            >
              立即存款
            </Button>
          </div>
        </div>
      )}
    </LayoutPage>
  )
})
