import config from "@/config/config"
import _ from "lodash"
import { OrderPostFetcher } from "./fetcher"
import { get, post, upload } from "./index"
import Bus from "@/magic/EventBus"
import util from "@/magic/util"

export const getRedsDataById = (id) => post("User/GetRedsData", { id })

export const getUserRecReds = (id, pass, NECaptchaValidate) => post("User/RecReds", _.pickBy({ id, pass, NECaptchaValidate }))

export const getUserRecRedsByJson = (data) => post("User/RecReds", data)

export const getUserRedsList = (data) => get("User/GetRedsList", data) // Captcha字段 值为1需要进行验证

export const getUserRedType = () => get("User/GetRedTypeList")

// common

export const getPush = async (data) => {
  const res = await get("User/GetPush", data)
  if (res.Data?.ServiceLink) {
    util.cache.set("serviceLink", res.Data.ServiceLink)
  }
  if (res.Data?.ServerTime) {
    util.cache.set("serverTime", res.Data.ServerTime)
  }

  if (res.Data?.MonthWater) {
    util.cache.set("MonthWater", res.Data.MonthWater)
  }

  if (util.getUrlParam("token") || util.getUrlParam("CID") || util.cache.get("user")?.Token) {
    util.cache.set("user", res.Data.UserData)
  }
  return res
}

export const userLogin = async (data, loginType: "fast" | "normal" = "normal") => {
  const res = await post(loginType == "normal" ? "User/Login" : "User/FastLogin", data)
  if (res.Code == 1) {
    util.cache.remove("orderPostData")
    util.cache.set("user", res.Data)
  }
  return res
}

export const getOauthCode = async () => {
  const res = await post("User/GetOauthCode")
  return res
}

export const userLogout = async () => {
  const res = await post("User/Exit")
  if (res.Code == 1) {
    util.cache.setCookie("token", "")
    util.cache.remove("user")
    util.cache.remove("MonthWater")
    util.cache.remove("orderPostData")
    util.cache.set("GoldenPKPass", {})
    util.cache.remove("security")
    util.cache.removeStartsWith("User/GetPush", "session")
    util.cache.removeStartsWith("lottery-cache-", "local")
    Bus.emit("broadcast.disconnect")
  }
  return res
}

export const getArticleList = (data) => post("Article/GetList", data)

// 提现api

export const getBank = () => post("User/GetBank")

export const getBankList = () => post("User/GetBank_List")

export const userDrawMoney = (data) => post("User/DrawMoney", data)

export const lockBank = (data) => post("User/LockBank", data)

// 个人中心
export const getAvatar = () => post("User/GetAvatarList", null, null, 1000 * 60 * 60)

export const setAvatar = (data) => post("User/SetAvatar", data)

export const getUserCredit = (credit) => post("User/GetCredit", { credit })

export const convertCredit = (monthInt, credit) => post("User/ConvertCredit", { monthInt, credit })

// site/download

export const getArticleData = (id) => post("Article/GetData", { id })

// store

export const getStoreDataById = (id) => post("Shop/GetStoreData", { id })

export const getShopStore = (sort, PageIndex, PageSize) => post("Shop/GetStore", { sort, PageIndex, PageSize })

export const getOpenStore = () => post("Shop/OpenStore")

export const getCancelOrderById = (id) => post("Shop/CancelOrder", { id })

export const setPayPass = (pass) => post("Shop/SetPayPass", { pass })

export const setShopConfirm = (id, pass) => post("Shop/Confirm", { id, pass })

// lottery bet

export const getLotterBetHistoryData = (lotteryid, PageIndex, PageSize) => {
  if (!PageIndex) PageIndex = 1
  if (!PageSize) PageSize = 5
  return post("Lottery/Bets", { lotteryid, PageIndex, PageSize })
}

export const getLotterBetRecrodsData = (data) => post("Lottery/Bets", data)

export const getLottersData = (lotteryid, PageIndex, PageSize) => {
  if (!PageIndex) PageIndex = 1
  if (!PageSize) PageSize = 3
  return post("Lottery/Lotterys", { lotteryid, date: 0, PageIndex, PageSize })
}

// formum

export const getBetPostList = ({ lotteryID, sortType, cur_page, page_size, ...params }) =>
  post("betpost/postlist", { lotteryID, type: 0, sort: sortType || 0, PageIndex: cur_page || 1, PageSize: page_size || 6, ...params })
// sort: SORT 预设 0, 查看数 1, 最新帖 2

// 关注

export const getMyFollow = () => post("betpost/MyFollow")

export const addFollowById = (id) => post("betpost/FollowUser", { id })

export const removeFollowById = (id) => post("betpost/RemoveFollow", { id })

export const getMyFansList = () => post("BetPost/MyFans")

export const getMyFansPostList = (lotteryID) => post("BetPost/PostList", { lotteryID, type: 0, sort: 2, pageIndex: 1, PageSize: 99, follow: 1 })

export const getTopPostList = (lotteryID) => post("BetPost/PostList", { lotteryID, type: 0, sort: 0, pageIndex: 1, PageSize: 2 })

export const getMySet = () => get("User/GetMySet")

// export const getMySet = () => post("User/MySet")

// 积分商城

export const getShopClass = () => get("Shop/GetClass", { PageSize: 99 }, null) // , 1000 * 60 * 60 * 24

export const getShopItemList = (id) => get("Shop/GetList", { id })

export const getShopItemDetail = (id) => get("Shop/GetData", { id })

export const postBuyingItem = (data) => post("Shop/BuyShop", data)

export const getShopSet = () => get(`${config.apiPointsUrl}Shop/ShopSet`)

export const sendingEmailVerifyCode = (data) => post("Shop/SendMailVerifyCode")

// 网投API接口

export const getDrawMoneyList = (page, size) => get("User/GetDrawMoneyList", { index: 3, PageIndex: page || 1, PageSize: size || 20 })

export const getOrderPostUserAuth = async () => {
  const res = await post("Pay/OrderPostUserAuth")
  if (res.Code == 1) {
    util.cache.set("orderPostData", res.Data.hasOwnProperty("Data") ? res.Data.Data : res.Data)
  } else {
    util.cache.set("orderPostData", { Message: res.Message })
  }
}

// 通过网投API获取挂单平台的会员身份：
// /Pay/OrderPostUserAuth
// 返回token以及token过期时间，请求挂单平台需将该token写入headers的标头，标头名OrderUserToken
// /User/DrawMoney	（申请提款接口的type传2，表示这笔提款为挂单，orderSplit参数，0不拆分，1拆分）
// /User/GetDrawMoneyList（提款记录接口新增返回值：挂单ID：OrderID，已成交金额OrderMoney，Type=2挂单提款）
// /User/GetBank_List（新增返回OrderPost字段，此提款渠道是否支持挂单，提款渠道新增返回Review字段，指示该渠道新增的银行卡是否需要客服审核）
// /User/GetBank	新增返回Status字段，指示该银行卡状态（-1待审核，0正常，1冻结）
export const setUserBank = (data) => post("User/SetBank", data)

// { id: [id] } 删除银行卡
export const delUserBank = (data) => post("User/DelBank", data)

// { bankID: [id] } 设为默认卡号
export const setUserDefaultBank = (data) => post("User/SetDefaultBank", data)

// 【提款挂单API接口】

// 获取订单列表（可以匿名访问）：

export const getOrderPostList = async (data) => OrderPostFetcher.get(`OrderPost/OrderList`, data)

// /OrderPost/OrderList(int status = 0, int type = 0, int sort = 0, int sid = 0, int uid = 0)
// 【API参数】status订单状态，type卖家收款类型(1微信,2支付宝,3银行,0全部)，sort排序(0时间,1总金额,2余额[从大到小],3余额[从小到大])，sid站点id，uid会员id
// 【返回值】Money：总金额，OrderTime：挂单时间，DealMoney：成交金额，LockMoney：锁定金额，Type：卖家收款类型，Status：订单状态（0交易中，1锁定，2完结）

// 买家下单
// Buyer places an order
export const userPlacesOrder = async (data) => OrderPostFetcher.post(`OrderPost/Order`, data)
// /OrderPost/Order(decimal money = 0, string id = "")

// 买家撤单
export const userCancelOrderById = async (data) => OrderPostFetcher.post(`OrderPost/CancelOrder`, data)
// /OrderPost/CancelOrder(int id = 0)

// 提交付款
export const submitOrderPostPay = async (data) => OrderPostFetcher.post(`OrderPost/PostPay`, data)
// /OrderPost/PostPay(int id = 0, string name = "", string bank = "", string account = "", string imageContent = "")
// imageContent上传图片的base64字符串，可以多次上传多张图片，name=付款姓名，bank=付款银行，account=付款帐号

// 卖家确认订单
export const userConfirmOrder = async (data) => OrderPostFetcher.post(`OrderPost/ConfirmOrder`, data)
// /OrderPost/ConfirmOrder(int id = 0)

// 获取订单列表
export const getSelfOrderList = async (data) => OrderPostFetcher.get(`OrderPost/Order_List`, data)
// /OrderPost/Order_List(int status = 0 type = 0 pid = "")<param name="status">1交易中,2已撤销,3已完结</param>，type=0获取购买的订单，type=1获取出售的订单，pid是按商品ID获取订单
// 【返回值】PID挂单ID，Money购买金额，OrderTime下单时间，PayTime支付时间，Service是否已申请客服介入，Content备注信息，ImageFile图片文件
// Status -2客服撤销，-1买家撤销/超时撤销，0等待付款，1已付款，2卖家已确认，3订单已完结
// 这个接口我新增返回UID和BuyUID字段，分别是卖家UID和买家UID，你可以通过这个判断是不是自己的

export const getOrderDataById = async (id) => {
  const res = await OrderPostFetcher.post(`OrderPost/Order_Data`, { id })
  if (res.Data?.Content) res.Data.Content = res.Data.Content?.replace(/\] ?[a-zA-Z0-9]+ /g, "] ") // remove customer service name
  return res
}
// Order_Data(int id = 0)  这个接口获取订单详情和付款信息

export const applyService = async (id, content) => OrderPostFetcher.post(`OrderPost/ApplyService`, { id, content })

export const getOrderUserData = () => OrderPostFetcher.get("OrderPost/GetUserData")
export const getOrderUserCreaditLogs = () => OrderPostFetcher.get("OrderPost/Credit_Logs")

export const getUserDataById = (id) => get("User/GetUserData", { id })

// 安全
export const setEmail = (mail) => post("User/SetMail", { mail })
// 发送邮箱验证码
export const sendMailVerify = (mail) => post("User/SendMailVerify", { mail })
// 验证邮箱验证码
export const verifyMailCode = (code) => get("User/MailVerify", { code })

// 取得service message 客服消息
export const getServiceMessages = () => get("User/GetService_Msgs", { id: 0, read: 1 })

export const setServiceMessageAsRead = () => get("User/Service_MsgsRead")

export const getNotifyList = () => get("User/GetNotifyList", { PageIndex: 1, PageSize: 100, status: 0, type: 1 })

export const setNotifyMessageAsRead = (id) => get("User/SetNotifyRead", { id })

// find password
// type=0 登录密码，1提款密码
// /User/SendCode(string mail = "", int type = 0)
export const sendCodeToMail = (data) => post("User/SendCode", data)
// code：验证码，type：同上，重置密码类型，pass：新的密码
// /User/ResetPass(int code = 0, int type = 0, string pass = "")
export const setNewPassword = (data) => post("User/ResetPass", data)
// 追号
export const setBetTask = (lotteryID, lx, moneys, betText, autoStop) => post("Lottery/AddBetTask", { lotteryID, lx, moneys, betText, autoStop })

export const getBetTask = () => post("Lottery/GetBetTask")
// 添加追号任务：/Lottery/AddBetTask(int lotteryID = 0, int lx = 0, decimal money = 0, string betText = "")
// 获取追号任务：/Lottery/GetBetTask

// type // ref src/config/deposit的id
export const getDepositList = (data) => get("Pay/GetPayApiList", data)
// id
export const cancelDeposit = (data) => post("Pay/CancelPayOrder", data)
//
export const depositCny = (data) => post("Pay/RmbPay", data)
export const depositGTPay = (data) => post("Pay/GTPay", { payType: "origin", ...data })
export const depositGTHuiPay = (data) => post("Pay/GTPay", { payType: "uhuei", ...data })
export const depositGTAliPayChannel = (data) => post("Pay/GTPay", { payType: "alipay", ...data })
export const getSubBankList = (data) => post("Pay/GetSubBankList", data)
export const payFunPay = (data) => post("Pay/FunPay", data)

// register
export const checkNickName = (data) => post("User/CheckNickName", data)
export const register = (data) => post("User/Reg", data)
export const tryBetPost = () => post("betpost/try")
export const getMobileVerifyCode = (data: { mobile: string }) => post("User/SendSmsCode", data) // (string mobile = "")
export const getMailVerifyCode = (data: { mail: string; NECaptchaValidate: string }) => post("User/SendMailVerifyCode", data)
export const sendRegisterMailVerify = (data: { mail: string; NECaptchaValidate: string }) => post("User/SendRegisterMailVerify", data)

// bind mobile
export const bindMobile = (data: { mobile: string; code: string }) => post("User/MobileVerify", data)

// CouponCode
export const redeemCoupon = (code) => post("User/RedeemCoupon", { code }) // 兑换优惠券

export const getCouponLogs = (PageIndex, PageSize) => get("User/CouponLogs", { PageIndex, PageSize }) // 兑换优惠记录

export const getCouponList = () => get("User/Coupon_List") // 优惠清单

// ElseBank

export const getWithDrawValidateCode = (name, account, money) => post("API/SendDrawCode", { name, account, money })

// Book

export const getVoteList = () => get("Book/Vote_List") // 获取投票 // 用不到

export const getVoteData = (id) => get("Book/Vote_Data", { id }) // 投票详情

export const addVote = (id, nid) => post("Book/Vote", { id, nid }) // 发起投票（id=投票id，nid=选项ID）

export const getUserBindData = () => get("User/GetUser_Bind") // RecMoney充值金额，EndMoney约束金额，BetMoney当前下注

export const shareBroadcast = (LotteryID, GameID) => post("User/SendBroadcast", { type: 1, text: LotteryID + "|" + GameID })

// new Broadcast
export const getFetchBroadcastfileKey = (data) => post("API/GetFileKey", data)

export const uploadFiletoServer = async (file) => {
  const { FileKey, ServerAPI } = await getFetchBroadcastfileKey({ fileKey: new Date().getTime() + "" })

  const formData = new FormData()
  formData.append("file", file)
  formData.append("FileKey", FileKey)
  return upload(ServerAPI, formData, file.type)
}

export const getBroadcastGroups = (id) => get("User/GetBroadcast_Groups", id !== null && id !== undefined ? { id } : null, null) // 获取广播分组

export const getReceiveLogs = (id = 0) => get("Chat/Broadcast_ReceiveLogs", { id })

export const getEmojiGroups = () => get("Chat/Emoji_Groups", null, null, 1000 * 60 * 5) // 获取表情分组

export const getEmjiList = (id = 0) => get("Chat/Emoji_List", { id, PageSize: 100 }, null, 1000 * 60 * 5) //(int id = 0)   //获取表情（id=分组id，0查询所有）

export const getDialogueList = () => get("User/GetDialogueList", { PageIndex: 1, PageSize: 100 })

export const getRecentChats = () => get("Chat/RecentChats", null, null)

export const getFriendList = () => get("User/GetFriendList", { PageIndex: 1, PageSize: 100 }, null, 1000 * 60 * 1)

export const getRequestFriendList = (id = 1) => get("User/GetFriendRequestList", { PageIndex: 1, PageSize: 100, id }, null, 1000 * 60 * 5)

export const getRequestFriendList2 = (id = 1) => get("User/GetFriendRequestListV2", { PageIndex: 1, PageSize: 100, id })

export const acceptFriendRequest = (rid) => get("User/ModifyFriendRequest", { rid })

export const refuseFriendRequest = (rid) => get("User/ModifyFriendRequest/Refuse", { rid })

export const ignoreFriendRequest = (rid) => get("User/ModifyFriendRequest/Ignore", { rid })

export const getForumUrl = () => get("api/GetInternetForumUrl", null, null, 1000 * 60 * 30)

export const getPinnedChats = () => get("Chat/PinnedChat", null, null)

export const postPinnedChats = (pinned) => post("Chat/PinnedChat", { pinned })

export const getManagerList = (GroupIds) => get("Chat/ManagerList", GroupIds ? { GroupIds } : null, null) // 获取管理员列表

export const setMessageAsRead = (groupId, toId) => post("Chat/MarkAsRead", { groupId, toId })

export const removeChat = (groupId, toId, index = 0) => post("Chat/RemoveChat", { groupId, toId, index })

export const deleteFriend = (Uid = 0) => post("User/DeleteFriend", { Uid })

export const leaveGroup = (groupId, isRemove = 0, index = 0) => post("Chat/LeaveGroup", { groupId, isRemove, index })

export const changeNickName = async (nickname) => {
  if (!nickname) {
    throw new Error("昵称不能为空")
  }
  const checkRes = await post("User/CheckNickName", { nickname })
  if (checkRes.Data) {
    return post("User/ModifyNickName", { nickname })
  } else {
    throw new Error("昵称已被使用")
  }
}

export const getInteractiveSet = () => get("Config/InteractiveSet")

export const getBroadcastList = (data) => get("User/GetBroadcastListV2", data)
export const createTrialAccount = () => post("User/CreateTrialAccount")

// 月月返利

export const getRealMonthWater = (): ApiPromise<RealMonthWater> => get("User/GetRealMonthWater")

export const postRealMonthWaterApply = (applyMoney: number): ApiResponse<void> => post("User/UserMonthWaterApply", { applyMoney })

export const getRealMonthRecords = (PageIndex: number, PageSize: number): ApiPromise<UserMonthWaterApplyDetail[]> =>
  get("User/GetUserMonthWaterApplyDetail", { PageIndex, PageSize })
