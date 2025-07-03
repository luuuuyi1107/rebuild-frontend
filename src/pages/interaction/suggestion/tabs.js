import MessageItem from "./messageItem"
import _ from "lodash"

export const useTabs = (isLogin, openMessage) => {
  const renderRow = (row) => {
    return <MessageItem row={row} openMessage={openMessage} />
  }
  const orderRows = (rows) => _.orderBy(rows, "Sort", "desc");
  const tabs = [
    {
      name: "全部留言",
      listApi: "Book/GetList",
      listApiMethod: "get",
      renderRow,
      orderRows
    },
    {
      name: "我的留言",
      listApi: "Book/GetMyList",
      listApiMethod: "get",
      renderRow,
      orderRows
    },
  ].slice(0, isLogin ? 2 : 1)

  return {
    tabs,
  }
}
