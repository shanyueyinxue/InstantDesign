import type { IUI } from "@leafer-ui/interface";
import { Tag } from "../interfaces";

/**
 * 整理数组中对象的 z-index 属性，使其从 1 开始连续。
 * 按原 zIndex 值的相对大小排序后重新分配，保持层级关系不变。
 *
 * @param array 需要整理的 IUI 数组
 */
export function normalizeZIndexes(array: IUI[]): void {
    if (array.length === 0) return;

    let alreadyNormalized = true;
    const currentZIndices = array.map((item) => item.zIndex || 0);
    const sortedZIndices = currentZIndices.slice().sort((a, b) => a - b);
    for (let i = 0; i < array.length; i++) {
        if (sortedZIndices[i] !== i + 1) {
            alreadyNormalized = false;
            break;
        }
    }
    if (alreadyNormalized) return;

    const itemsWithIndex = array.map((item, idx) => ({
        item,
        originalIndex: item.zIndex || 0,
        arrayIndex: idx,
    }));

    itemsWithIndex.sort((a, b) => {
        if (a.originalIndex !== b.originalIndex) {
            return a.originalIndex - b.originalIndex;
        }
        return a.arrayIndex - b.arrayIndex;
    });

    itemsWithIndex.forEach((entry, sortedIndex) => {
        entry.item.zIndex = sortedIndex + 1;
    });
}

/**
 * 递归规范化数组中所有 Group 子元素的 zIndex。
 *
 * @param array 根级元素数组
 */
export function recursiveNormalizeZIndexes(array: IUI[]): void {
    normalizeZIndexes(array);
    for (const child of array) {
        if (child.tag === Tag.Group) {
            recursiveNormalizeZIndexes(child.children || []);
        }
    }
}

/**
 * 获取兄弟元素中的最大/最小 zIndex 值。
 *
 * @param siblings 兄弟元素数组
 * @param excludeIndex 要排除的元素索引（可选）
 * @returns zIndex 最小值和最大值，默认返回 { min: 0, max: 0 }
 */
export function getSiblingZIndexRange(
    siblings: IUI[],
    excludeIndex?: number
): { min: number; max: number } {
    let min = Infinity;
    let max = -Infinity;

    siblings.forEach((sibling, index) => {
        if (excludeIndex !== undefined && index === excludeIndex) return;
        min = Math.min(min, sibling.zIndex || 0);
        max = Math.max(max, sibling.zIndex || 0);
    });

    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 0;

    return { min, max };
}

/**
 * 计算两个 zIndex 之间的中间值。
 * 当 z1 === z2 时，返回 z1 - 0.5（确保较前元素保持在前面）。
 */
export function getMiddleZIndex(z1: number, z2: number): number {
    if (z1 === z2) {
        return z1 - 0.5;
    }
    return (z1 + z2) / 2;
}

/**
 * 元素上下文信息
 */
export interface ElementContext {
    parent: IUI;
    siblings: IUI[];
    index: number;
}

/**
 * 在 IUI 树中查找目标元素的父容器和兄弟数组。
 * 从 root 开始深度优先搜索，纯函数，无副作用。
 *
 * @param root 搜索的根节点
 * @param element 要查找的目标元素
 * @returns 元素上下文，未找到返回 null
 */
export function findElementContext(
    root: IUI,
    element: IUI
): ElementContext | null {
    const stack: Array<{ parent: IUI; children: IUI[] }> = [
        { parent: root, children: root.children || [] },
    ];

    while (stack.length > 0) {
        const current = stack.pop()!;
        const index = current.children.indexOf(element);

        if (index !== -1) {
            return {
                parent: current.parent,
                siblings: current.children,
                index,
            };
        }

        for (const child of current.children) {
            if (child.tag === Tag.Group && child.children) {
                stack.push({ parent: child, children: child.children });
            }
        }
    }

    return null;
}

/**
 * 检查两个元素是否在同一个兄弟容器内。
 *
 * @param root 搜索的根节点
 * @param e1 元素1
 * @param e2 元素2
 */
export function areInSameContainer(
    root: IUI,
    e1: IUI,
    e2: IUI
): boolean {
    const ctx1 = findElementContext(root, e1);
    const ctx2 = findElementContext(root, e2);
    if (!ctx1 || !ctx2) return false;
    return ctx1.siblings === ctx2.siblings;
}

/**
 * 获取目标元素在兄弟数组中满足指定方向条件的相邻元素信息。
 *
 * @param siblings 兄弟元素数组
 * @param index 目标元素在数组中的位置
 * @param direction '<' 查找比当前 zIndex 小的最大 zIndex，'>' 反之
 */
export function getAdjacentElement(
    siblings: IUI[],
    index: number,
    direction: "<" | ">"
): { zIndex: number; elementIndex: number } | undefined {
    const currentZ = siblings[index]?.zIndex ?? 0;
    let adjacent: { zIndex: number; elementIndex: number } | undefined;

    siblings.forEach((sibling, i) => {
        if (i === index) return;
        sibling.zIndex = sibling.zIndex || 0;

        if (direction === "<") {
            if (sibling.zIndex < currentZ) {
                if (!adjacent || sibling.zIndex > adjacent.zIndex) {
                    adjacent = { zIndex: sibling.zIndex, elementIndex: i };
                }
            }
        } else {
            if (sibling.zIndex > currentZ) {
                if (!adjacent || sibling.zIndex < adjacent.zIndex) {
                    adjacent = { zIndex: sibling.zIndex, elementIndex: i };
                }
            }
        }
    });

    return adjacent;
}

/**
 * 打印当前层级结构（调试用途）。
 *
 * @param root 打印的根节点
 */
export function printTreeLayers(root: IUI): void {
    const printElement = (element: IUI, indent: string = ""): void => {
        console.log(`${indent}${element.tag} (zIndex: ${element.zIndex}) name: ${element.name}`);
        if (element.tag === "Group" && element.children) {
            element.children.forEach((child) => printElement(child, indent + "  "));
        }
    };

    console.log("=== Current Layers ===");
    (root.children || []).forEach((element) => printElement(element));
    console.log("======================");
}
