import { h, render, type VNode } from "vue"
import LoadingComponent from "./loading.vue"


class Loading {
  tip: string; // 加载提示信息
  root: HTMLElement | null; // 加载根元素
  container: HTMLElement | null; // 加载容器元素

  constructor(tip?: string, root?: HTMLElement) {
    this.tip = tip || "Loading..."
    this.root = root || document.body
    this.container = null
  }

  show(tip?: string) {
    if (this.container) return

    if (!this.root) {
      console.error("Loading root element not found")
      return
    }
    if (!this.container) {
      this.container = document.createElement("div")
      this.container.className = "loading-overlay"
      this.root.appendChild(this.container) // 将加载容器添加到根元素中
    }

    if (!tip) {
      tip = this.tip
    }
    render(h(LoadingComponent, { tip: tip }), this.container)
  }

  close() {
    if (!this.container) return
    if (!this.root) {
      console.error("Loading root element not found")
      return
    }
    render(null, this.container)
    this.root.removeChild(this.container)
    this.container = null
  }
}


export { Loading }
export default Loading