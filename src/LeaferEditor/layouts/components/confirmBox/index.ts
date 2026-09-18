import { h, render } from "vue"
import ConfirmBoxComponent from "./confirmBox.vue"

export interface ConfirmBoxConfig {
  title?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

class ConfirmBoxCtrl {
  container: HTMLElement | null = null

  open(config: ConfirmBoxConfig) {
    if (this.container) return

    this.container = document.createElement("div")
    document.body.appendChild(this.container)

    const vm = h(ConfirmBoxComponent, {
      title: config.title,
      confirmText: config.confirmText,
      cancelText: config.cancelText,
      onConfirm: () => {
        config.onConfirm?.()
        this.close()
      },
      onCancel: () => {
        config.onCancel?.()
        this.close()
      },
    })

    render(vm, this.container)
  }

  close() {
    if (!this.container) return
    render(null, this.container)
    document.body.removeChild(this.container)
    this.container = null
  }
}

const confirmBox = new ConfirmBoxCtrl()

export { ConfirmBoxCtrl, confirmBox }
export default confirmBox
