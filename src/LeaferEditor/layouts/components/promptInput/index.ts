import { h, render } from "vue"
import PromptInputComponent from "./promptInput.vue"

export interface PromptInputConfig {
  title?: string
  defaultValue?: string
  placeholder?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: (value: string) => void
  onCancel?: () => void
}

class PromptInputCtrl {
  container: HTMLElement | null = null

  open(config: PromptInputConfig) {
    if (this.container) return

    this.container = document.createElement("div")
    document.body.appendChild(this.container)

    const vm = h(PromptInputComponent, {
      title: config.title,
      defaultValue: config.defaultValue,
      placeholder: config.placeholder,
      confirmText: config.confirmText,
      cancelText: config.cancelText,
      onConfirm: (value: string) => {
        config.onConfirm?.(value)
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

const promptInput = new PromptInputCtrl()

export { PromptInputCtrl, promptInput }
export default promptInput
