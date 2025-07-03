import { useRef, useState } from "react"
export const useWebSocketManager = (props) => {
  const paths = ["newBroadcast", "chatchannel"]
  const closeRef = useRef(null)
  const hubRef = useRef(null)
  const cacheTimes = useRef({
    connection: 0,
    groups: 0,
    chats: 0,
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  return {
    paths,
    closeRef,
    hubRef,
    isConnected,
    setIsConnected,
    isConnecting,
    setIsConnecting,
    cacheTimes,
  }
}
