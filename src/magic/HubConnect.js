import $ from "@/components/jQuery"
import "@/components/jQuery/jquery.signalR.js"
import config from "@/config/config"

export const useConnect = (hubName, listens) => {
  const user = util.cache.get("user")
  const connection = $.hubConnection(`${config.wsUrl}signalr`, { useDefaultPath: false, qs: { pageIndex: "1", Authorization: user?.Token } })
  const chatHub = connection.createHubProxy(hubName)
  Object.entries(listens).forEach(([key, callback]) => {
    if (key !== "onConnect") {
      chatHub.on(key, callback)
    }
  })

  function disconnect() {
    connection.stop()
    listens.onDisconnect(connection)
  }

  function connect() {
    connection
      .start()
      .done(function () {
        console.log("Now connected, connection ID=" + connection.id)
        listens.onConnect(connection)
      })
      .fail(function () {
        console.log("Could not connect")
      })
  }

  connect()

  return { chatHub, disconnect }
}
