// src/utils/toast.js
import { createRoot } from "react-dom/client"
import { onUnmounted } from "./hook/vue"
// 内联 CSS 样式
const toastStyles = `
  .toast-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    z-index: 19999;
  }
  .custom-toast {
    // position: fixed;
    // top: 50%;
    // left: 50%;
    // transform: translate(-50%, -50%) translateY(100%); /* 初始位置：下方偏移自身高度 */
    transform: translateY(100%); /* 初始位置：下方偏移自身高度 */
    color: white;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 20000;
    opacity: 0;
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out; /* 动画包含 transform 和 opacity */
    max-width: 338px;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 16px;
  }
  .custom-toast.show {
    // transform: translate(-50%, -50%) translateY(0%); /* 最终位置：无偏移 */
    transform: translateY(0%); /* 最终位置：无偏移 */
    opacity: 1;
  }
`

// 动态插入样式到 document
const injectStyles = () => {
  const styleSheet = document.createElement("style")
  styleSheet.type = "text/css"
  styleSheet.innerText = toastStyles
  document.head.appendChild(styleSheet)
}

// Toast 组件
const Toast = ({ message, type = "default", onClose }) => {
  const bgColor =
    {
      default: "#333", // 黑色背景作为预设
      info: "#2196F3",
      success: "#4CAF50",
      error: "#F44336",
      warning: "#FF9800",
    }[type] || "#000000"
  onUnmounted(() => {
    onClose?.()
  })

  return (
    <div
      className="custom-toast"
      style={{ backgroundColor: bgColor }}
      onClick={onClose} // 点击 Toast 关闭
    >
      <div dangerouslySetInnerHTML={{ __html: message }}></div>
    </div>
  )
}

// 显示 Toast 的方法
export const toast = (message, { type = "default", duration = 3000 } = {}) => {
  // 确保样式只注入一次
  if (!document.querySelector("style[data-toast]")) {
    injectStyles()
    document.head.querySelector("style").setAttribute("data-toast", "true")
  }

  // 创建临时容器
  const toastContainer = document.createElement("div")
  toastContainer.className = "toast-container"
  document.body.appendChild(toastContainer)
  const root = createRoot(toastContainer)

  // 渲染 Toast
  const toastElement = (
    <Toast
      message={message}
      type={type}
      onClose={() => {
        toastContainer.remove()
      }}
    />
  )
  root.render(toastElement)

  // 添加 show 类以触发动画
  setTimeout(() => {
    toastContainer.querySelector(".custom-toast")?.classList.add("show")
  }, 10)

  // 自动关闭
  setTimeout(() => {
    toastContainer.remove()
  }, duration)
}
