import type { IGroup, IUI } from "@leafer-ui/interface";
import type { LeaferEditor } from "../editor";
import * as zTree from "../utils/zIndexTree";

export class LayerManager {
    constructor(private editor: LeaferEditor) {}

    /** 获取当前画布的内容根节点，作为 zIndex 树搜索起点 */
    private get root(): IUI {
        return this.editor.page.current.contentFrame;
    }

    /**
     * 整理数组元素的 zIndex，使其从 1 开始连续。
     * 保持相对大小关系不变。
     */
    normalizeZIndexes(array: IUI[]): void {
        zTree.normalizeZIndexes(array);
    }

    /**
     * 递归规范化数组及内部所有 Group 子元素的 zIndex。
     */
    recursiveNormalizeZIndexes(array: IUI[]): void {
        zTree.recursiveNormalizeZIndexes(array);
    }

    /**
     * 打印当前画布的层级结构（调试用途）
     */
    printLayers(): void {
        zTree.printTreeLayers(this.root);
    }

    /**
     * 将元素向上移动一层（zIndex 与相邻上层元素交换）
     */
    moveUp(element: IUI): boolean {
        this.normalizeZIndexes(this.root.children || []);
        const ctx = zTree.findElementContext(this.root, element);
        if (!ctx) return false;

        const adj = zTree.getAdjacentElement(ctx.siblings, ctx.index, ">");
        if (!adj) return false;

        const temp = element.zIndex;
        element.zIndex = ctx.siblings[adj.elementIndex]!.zIndex;
        ctx.siblings[adj.elementIndex]!.zIndex = temp;
        this.editor.history.save();
        return true;
    }

    /**
     * 将元素向下移动一层（zIndex 与相邻下层元素交换）
     */
    moveDown(element: IUI): boolean {
        this.normalizeZIndexes(this.root.children || []);
        const ctx = zTree.findElementContext(this.root, element);
        if (!ctx) return false;

        const adj = zTree.getAdjacentElement(ctx.siblings, ctx.index, "<");
        if (!adj) return false;

        const temp = element.zIndex;
        element.zIndex = ctx.siblings[adj.elementIndex]!.zIndex;
        ctx.siblings[adj.elementIndex]!.zIndex = temp;
        this.editor.history.save();
        return true;
    }

    /**
     * 将元素移动到同级顶层
     */
    moveToTop(element: IUI): boolean {
        const ctx = zTree.findElementContext(this.root, element);
        if (!ctx) return false;

        const range = zTree.getSiblingZIndexRange(ctx.siblings, ctx.index);
        if (range.max <= (element.zIndex as number)) {
            return false;
        }

        element.zIndex = range.max + 1;
        this.editor.history.save();
        return true;
    }

    /**
     * 将元素移动到同级底层
     */
    moveToBottom(element: IUI): boolean {
        const ctx = zTree.findElementContext(this.root, element);
        if (!ctx) return false;

        const range = zTree.getSiblingZIndexRange(ctx.siblings, ctx.index);
        if (range.min >= (element.zIndex || 0)) {
            return false;
        }

        element.zIndex = range.min - 1;
        this.editor.history.save();
        return true;
    }

    /**
     * 将元素移入目标 Group
     */
    moveIntoGroup(element: IUI, targetGroup: IGroup, index?: number): boolean {
        if (targetGroup.tag !== "Group") return false;

        const ctx = zTree.findElementContext(this.root, element);
        if (!ctx) return false;

        if (element === targetGroup) return false;

        if (!targetGroup.children) {
            targetGroup.children = [];
        }

        let newZIndex = 1;
        if (index) {
            newZIndex = index;
        } else if (targetGroup.children.length > 0) {
            const range = zTree.getSiblingZIndexRange(targetGroup.children);
            newZIndex = range.max + 1;
        }

        element.zIndex = newZIndex;
        targetGroup.add(element);
        this.editor.history.save();
        return true;
    }

    /**
     * 将元素移出当前 Group，放回顶级（contentFrame.children）
     */
    moveOutOfGroup(element: IUI, index?: number): boolean {
        const ctx = zTree.findElementContext(this.root, element);
        if (!ctx || !ctx.parent) return false;

        if (!(ctx.parent !== this.root)) return false;

        let newZIndex = 1;
        if (index) {
            newZIndex = index;
        } else if ((this.root.children || []).length > 0) {
            const range = zTree.getSiblingZIndexRange(this.root.children || []);
            newZIndex = range.max + 1;
        }

        element.zIndex = newZIndex;
        this.root.add(element);
        this.editor.history.save();
        return true;
    }

    /**
     * 将元素移动到目标元素前面（zIndex 更大，视觉上层）
     */
    moveBefore(element: IUI, targetElement: IUI): boolean {
        if (!zTree.areInSameContainer(this.root, element, targetElement)) {
            console.warn("Elements are not in the same container");
            return false;
        }
        if (element === targetElement) return false;

        this.normalizeZIndexes(element.parent?.children || []);
        const targetCtx = zTree.findElementContext(this.root, targetElement)!;
        const adj = zTree.getAdjacentElement(targetCtx.siblings, targetCtx.index, ">");

        if (adj) {
            element.zIndex = zTree.getMiddleZIndex(
                adj.zIndex || 0,
                targetElement.zIndex || 0
            );
        } else {
            element.zIndex = (targetElement.zIndex || 0) + 1;
        }

        this.editor.history.save();
        return true;
    }

    /**
     * 将元素移动到目标元素后面（zIndex 更小，视觉下层）
     */
    moveAfter(element: IUI, targetElement: IUI): boolean {
        if (!zTree.areInSameContainer(this.root, element, targetElement)) {
            console.warn("Elements are not in the same container");
            return false;
        }
        if (element === targetElement) return false;

        this.normalizeZIndexes(element.parent?.children || []);
        const targetCtx = zTree.findElementContext(this.root, targetElement)!;
        const adj = zTree.getAdjacentElement(targetCtx.siblings, targetCtx.index, "<");

        if (adj) {
            element.zIndex = zTree.getMiddleZIndex(
                adj.zIndex || 0,
                targetElement.zIndex || 0
            );
        } else {
            element.zIndex = (targetElement.zIndex || 0) - 1;
        }

        this.editor.history.save();
        return true;
    }
}
