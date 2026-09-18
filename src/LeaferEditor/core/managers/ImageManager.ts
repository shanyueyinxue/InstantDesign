import { Image as LeaferImage, type Image } from "leafer-ui";
import type { IUI } from "@leafer-ui/interface";
import type { LeaferEditor } from "../editor";
import { Tag, ImageSourceTag, type UploadOptions } from "../interfaces";
import { base64toFile, blobUrlToFile } from "../utils/file";
import { EventTypes } from "../events";

const DEFAULT_IMAGE_WIDTH = 300

export class ImageManager {
    constructor(private editor: LeaferEditor) { }

    async open(): Promise<LeaferImage> {
        const file = await this.selectImage();
        const img = new LeaferImage({
            width: DEFAULT_IMAGE_WIDTH,
            height: DEFAULT_IMAGE_WIDTH,
            editable: true,
            placeholderColor: "rgba(120,120,120,0.4)",
        });
        const data = await this.editor.options.image?.uploadCallback!(file, ImageSourceTag.OpenImage, img)!;
        if (data.url) img.url = data.url;
        if (data.width) img.width = data.width;
        if (data.height) img.height = data.height;
        img.name = data.name || file.name;
        return img;
    }

    hasLocalImages(): boolean {
        const page = this.editor.page.current;
        for (const child of page.contentLayers) {
            if (this._checkLocalImageNode(child)) return true;
        }
        return false;
    }

    private _checkLocalImageNode(child: IUI): boolean {
        if (child.tag === Tag.Group) {
            for (const c of child.children || []) {
                if (this._checkLocalImageNode(c)) return true;
            }
        } else if (child.tag === Tag.Image) {
            const url = (child as Image).url;
            if (url && (url.startsWith('data:image/') || url.startsWith('blob:'))) return true;
        }
        return false;
    }

    async uploadLocalImages(options?: UploadOptions): Promise<void> {
        const { sourceTag, onUploaded } = options || {};
        const page = this.editor.page.current;
        for (const child of page.contentLayers) {
            await this._uploadImageNode(child, sourceTag, onUploaded);
        }
    }

    private async _uploadImageNode(child: IUI, sourceTag?: ImageSourceTag, onUploaded?: UploadOptions['onUploaded']): Promise<void> {
        if (child.tag === Tag.Group) {
            for (const c of child.children || []) {
                await this._uploadImageNode(c, sourceTag, onUploaded);
            }
        } else if (child.tag === Tag.Image) {
            const url = (child as Image).url;
            if (url && url.startsWith('data:image/')) {
                const tag = sourceTag ?? ImageSourceTag.Base64;
                const f = base64toFile(url, ((child as Image).name || 'image') + '.png');
                if (f) {
                    try {
                        const res = await this.editor.options.image?.uploadCallback!(f, tag, child)!;
                        (child as Image).url = res.url;
                        this.editor.eventBus.emit(EventTypes.imageLocalUploadSuccess, { url, newUrl: res.url });
                        onUploaded?.({ oldUrl: url, newUrl: res.url, ui: child });
                    } catch (error) {
                        this.editor.eventBus.emit(EventTypes.imageLocalUploadError, { url, error: error as Error });
                    }
                }
            } else if (url && url.startsWith('blob:')) {
                const tag = sourceTag ?? ImageSourceTag.Blob;
                const f = await blobUrlToFile(url, ((child as Image).name || 'image') + '.png');
                if (f) {
                    try {
                        const res = await this.editor.options.image?.uploadCallback!(f, tag, child)!;
                        (child as Image).url = res.url;
                        this.editor.eventBus.emit(EventTypes.imageLocalUploadSuccess, { url, newUrl: res.url });
                        onUploaded?.({ oldUrl: url, newUrl: res.url, ui: child });
                    } catch (error) {
                        this.editor.eventBus.emit(EventTypes.imageLocalUploadError, { url, error: error as Error });
                    }
                }
            }
        }
    }

    private selectImage(timeout: number = 20000): Promise<File> {
        return new Promise<File>((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.style.display = 'none';

            // 配置可接受的文件类型
            const imageFileTypes = this.editor.options.image?.fileTypes || [];
            if (imageFileTypes.length > 0) {
                input.accept = imageFileTypes.join(',');
            } else {
                input.accept = 'image/*';
            }

            let isSettled = false;   // 防止重复 resolve/reject
            let timeoutId: number;   // 超时定时器 ID

            // 统一的清理函数
            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (input.parentNode) document.body.removeChild(input);
            };

            // 文件选择变化处理
            input.addEventListener('change', (event: Event) => {
                if (isSettled) return;
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];

                // 用户取消选择（没有文件）
                if (!file) {
                    isSettled = true;
                    cleanup();
                    reject(new Error('cancel'));
                    return;
                }

                // 验证文件类型
                try {
                    const fileType = file.type;
                    if (imageFileTypes.length > 0) {
                        if (!imageFileTypes.includes(fileType)) {
                            throw new Error(
                                `Please select the image file in the following format: ${imageFileTypes.join(',')}`
                            );
                        }
                    } else {
                        if (!fileType.startsWith('image/')) {
                            throw new Error('Please select the image file');
                        }
                    }

                    // 验证文件大小
                    const maxSize = this.editor.options.image?.maxSize || 10 * 1024 * 1024;
                    if (file.size > maxSize) {
                        throw new Error(
                            `File size exceeds the limit of ${maxSize / 1024 / 1024}MB`
                        );
                    }

                    isSettled = true;
                    cleanup();
                    resolve(file);
                } catch (error) {
                    isSettled = true;
                    cleanup();
                    reject(error);
                }
            });

            input.addEventListener("cancel", () => {
                isSettled = true;
                cleanup();
                reject(new Error("cancel"));
            });

            // 超时检测：如果 timeout 秒内没有 change 事件，视为用户取消
            timeoutId = window.setTimeout(() => {
                if (!isSettled) {
                    isSettled = true;
                    cleanup();
                    reject(new Error('cancel (timeout)'));
                }
            }, timeout);

            // 添加至 DOM 并触发点击
            document.body.appendChild(input);
            input.click();
        });
    }
}
