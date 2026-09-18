import type { IUI } from "leafer-ui"

export const setCenter = (canvasW: number, canvasH: number, ui: IUI) => {
    const w = ui.width || 0
    const h = ui.height || 0
    
    ui.x = (canvasW - w) / 2
    ui.y = (canvasH - h) / 2
}