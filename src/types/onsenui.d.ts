import * as React from "react"

// 扩充 react-onsenui 模组
declare module "@types/react-onsenui" {
  interface Button {
    // 这里的 props 是基于现有定义加上 children
    props: {
      modifier?: string | undefined
      disabled?: boolean | undefined
      ripple?: boolean | undefined
      name?: string | undefined
      icon?: string | undefined
      onClick?(e?: React.MouseEvent<HTMLElement>): void
      children?: React.ReactNode // 新增 children 属性
    } & HTMLAttributes<"id" | "className" | "style"> // 保留原始 HTMLAttributes
  }
  interface AlertDialog {
    props: {
      onCancel?(): void
      isOpen?: boolean | undefined
      isCancelable?: boolean | undefined
      isDisabled?: boolean | undefined
      animation?: "none" | "default" | undefined
      modifier?: string | undefined
      maskColor?: string | undefined
      animationOptions?: AnimationOptions | undefined
      onPreShow?(): void
      onPostShow?(): void
      onPreHide?(): void
      onPostHide?(): void
      children?: React.ReactNode // 新增 children 属性
      className?: string // 新增 children 属性
    }
  }
}

declare namespace ons {
  namespace notification {
    interface NotificationOptions {
      message?: string
      messageHTML?: string
      title?: string
      buttonLabels?: string | string[]
      primaryButtonIndex?: number
      cancelable?: boolean
      callback?: ((index: number) => void) | ((value: string) => void) | (() => void)
      modifier?: string
      animation?: string
      timeout?: number
      class?: string // Added class attribute for custom CSS classes
    }

    /**
     * @description Show an alert dialog.
     * @param message The message to display, or options object.
     * @param options Optional settings for the alert dialog.
     * @return A promise that resolves when the dialog is closed.
     */
    function alert(message: string | NotificationOptions, options?: NotificationOptions): Promise<void>

    /**
     * @description Show a confirmation dialog.
     * @param message The message to display, or options object.
     * @param options Optional settings for the confirm dialog.
     * @return A promise that resolves to the index of the button clicked.
     */
    function confirm(message: string | NotificationOptions, options?: NotificationOptions): Promise<number>

    /**
     * @description Show a prompt dialog.
     * @param message The message to display, or options object.
     * @param options Optional settings for the prompt dialog.
     * @return A promise that resolves to the input value or null if canceled.
     */
    function prompt(message: string | NotificationOptions, options?: NotificationOptions): Promise<string | null>

    /**
     * @description Show a toast notification.
     * @param message The message to display, or options object.
     * @param options Optional settings for the toast.
     * @return A promise that resolves when the toast is closed.
     */
    function toast(message: string | NotificationOptions, options?: NotificationOptions): Promise<void>
  }
}

declare module "onsenui" {
  export = ons
}
