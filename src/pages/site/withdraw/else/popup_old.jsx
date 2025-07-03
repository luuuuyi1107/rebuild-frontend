import ModalPage from "@/components/ModalPage"
import { useEffect } from "react"
import { Button } from "react-onsenui"
import classNames from "classnames"
import { reactive } from "@/magic/hook/vue"

export default function Popup(props) {
  const { buttonLabels = ["取消"], title, closable = true } = props

  const buttonClickEvent = (index) => {
    props.buttonClickEvent(index)
    props.close?.(false)
  }

  return (
    <ModalPage isOpen={props.show} className={classNames("pop-notice-modal", props.className)} animation="easeOutBounce">
      <div className="w-5/6 max-w-[334px] mx-auto bg-white rounded-sm p-1 pt-0">
        <div
          className={classNames("relative h-3 ", {
            "bg-theme text-[16px] -mx-1 rounded-t-sm flex justify-center items-center": title,
          })}
        >
          {closable && (
            <div onClick={() => props.close?.(false)} className="absolute right-0.5 top-1/2 -translate-y-1/2">
              <img className="w-1" src={util.buildAssetsPath("assets/icons/ic_cross.svg")} />
            </div>
          )}
          {title}
        </div>
        <div className="text-gray-900 text-[14px] min-h-[102px] py-[14px] flex items-center justify-center whitespace-break-spaces">
          <div>{props.children}</div>
        </div>

        <div className={classNames({ "grid grid-cols-2 gap-1": buttonLabels.length > 1 })}>
          {buttonLabels.map((label, index) => (
            <Button
              key={index}
              className={classNames("w-full text-[16px]", { "border bg-white text-theme border-theme": index === 0 && buttonLabels.length > 1 })}
              onClick={() => buttonClickEvent(index)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </ModalPage>
  )
}

// export const useAlert = () => {
//   const data = reactive({
//     show: false,
//     onResolve: null,
//     content: "",
//     options: {},
//   })
//   return {
//     data,
//     alertAsync(content, { title = "提示", className = "", buttonLabels = ["确定"], ...otherProps } = {}) {
//       return new Promise((resolve) => {
//         data.show = true
//         data.onResolve = resolve
//         data.content = content
//         data.options = { title, className, buttonLabels, ...otherProps }
//       })
//     },
//     Component: () => {
//       const { title, className, buttonLabels, ...otherProps } = data.options
//       return (
//         <Popup
//           title={title}
//           className={className}
//           closable={false}
//           buttonLabels={buttonLabels}
//           show={data.show}
//           close={() => (data.show = false)}
//           buttonClickEvent={() => {
//             return data.onResolve()
//           }}
//           {...otherProps}
//         >
//           {data.content}
//         </Popup>
//       )
//     },
//   }
// }
// export const useConfirm = () => {
//   const data = reactive({
//     show: false,
//     onResolve: null,
//     onReject: null,
//     content: "",
//     options: {},
//   })
//   return {
//     data,
//     confirmAsync(
//       content,
//       { title = "提示", className = "", buttonLabels = ["取消", "确定"], onConfirm = () => {}, onCancel = () => {}, ...otherProps } = {}
//     ) {
//       return new Promise((resolve, reject) => {
//         data.show = true
//         data.onResolve = resolve
//         data.onReject = reject
//         data.content = content
//         data.options = { title, className, buttonLabels, onConfirm, onCancel, ...otherProps }
//       })
//     },
//     Component: () => {
//       const { title, className, buttonLabels, onConfirm, onCancel, ...otherProps } = data.options
//       return (
//         <Popup
//           title={title}
//           className={className}
//           closable={false}
//           buttonLabels={buttonLabels}
//           show={data.show}
//           close={() => (data.show = false)}
//           buttonClickEvent={async (index) => {
//             if (index === 0) {
//               await onCancel()
//               return data.onReject()
//             } else {
//               await onConfirm()
//               return data.onResolve()
//             }
//           }}
//           {...otherProps}
//         >
//           {data.content}
//         </Popup>
//       )
//     },
//   }
// }
