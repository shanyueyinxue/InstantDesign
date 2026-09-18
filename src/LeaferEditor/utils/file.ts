import { useClipboard, useFileDialog, useBase64 } from "@vueuse/core";
import { Message } from "@arco-design/web-vue";

/**
 * @description: 图片文件转字符串
 * @param {Blob|File} file 文件
 * @return {String}
 */
export function getImgStr(file: File | Blob): Promise<FileReader["result"]> {
    return useBase64(file).promise.value;
}

export function blobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            resolve(e.target?.result);
        };
        // readAsDataURL
        fileReader.readAsDataURL(blob);
        fileReader.onerror = () => {
            reject(new Error("blobToBase64 error"));
        };
    });
}

export function Base64toBlob(base64: string) {
    const dataArr = base64.split(",");
    if (dataArr.length < 2) {
        return null; // 非base64格式
    }
    const mime = dataArr[0]!.match(/:(.*?);/)![1];
    const bstr = atob(dataArr[1]!);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

/**
 * @description: 选择文件
 * @param {Object} options accept = '', capture = '', multiple = false
 * @return {Promise}
 */
export function selectFiles(options: {
    accept?: string;
    capture?: string;
    multiple?: boolean;
}): Promise<FileList | null> {
    return new Promise((resolve) => {
        const { onChange, open } = useFileDialog(options);
        onChange((files) => {
            resolve(files);
        });
        open();
    });
}

/**
 * @description: 前端下载文件
 * @param {String} fileStr
 * @param fileName
 */
export function downFile(fileStr: string, fileName: string) {
    const anchorEl = document.createElement("a");
    anchorEl.style.display = "none";
    anchorEl.href = fileStr;
    anchorEl.download = fileName;
    document.body.appendChild(anchorEl); // required for firefox
    anchorEl.click();
    anchorEl.remove();
}

/**
 * @description: 创建图片元素
 * @param {String} str 图片地址或者base64图片
 * @return {Promise} element 图片元素
 */
export function createImgElement(str: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const imgEl = new Image();
        imgEl.src = str;
        // 插入页面
        // document.body.appendChild(imgEl);
        imgEl.onload = () => {
            resolve(imgEl);
        };
    });
}

/**
 * Copying text to the clipboard
 * @param source Copy source
 * @param options Copy options
 * @returns Promise that resolves when the text is copied successfully, or rejects when the copy fails.
 */
export const clipboardText = async (
    source: string,
    options?: Parameters<typeof useClipboard>[0],
) => {
    try {
        await useClipboard({ source, ...options }).copy();
        Message.success("复制成功");
    } catch (error) {
        Message.error("复制失败");
        throw error;
    }
};

/**
 * 获取文件后缀
 * @param file 文件
 */
export function getFileExt(file: File) {
    let fileExtension = "";
    if (file.name.lastIndexOf(".") > -1) {
        fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
    }
    return fileExtension;
}

/**
 * 判断文件类型是否在列表内
 * @param file 文件
 * @param fileTypes 文件类型数组
 */
export function checkFileExt(file: File, fileTypes: any | []) {
    const ext = getFileExt(file);
    const isTypeOk = fileTypes.some((type: string) => {
        if (file.type.indexOf(type) > -1) return true;
        if (ext && ext.indexOf(type) > -1) return true;
        return false;
    });
    return isTypeOk;
}

/**
 * 将 base64 dataURL 字符串转换为 File 对象
 * @param data base64 格式的 dataURL（例如 "data:image/png;base64,..."）
 * @param fileName 文件名（不含扩展名）
 * @returns File 对象，如果 data 不是有效的 base64 dataURL 则返回 null
 */
export function base64toFile(data: string, fileName: string): File | null {
    // 匹配 dataURL 格式：data:[mime];base64,实际数据
    const matches = data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
        return null;
    }

    const mimeType = matches[1]!;       // 提取 MIME 类型，如 "image/png"
    const base64Data = matches[2]!;     // 提取纯 base64 字符串

    // 根据 MIME 类型确定文件扩展名
    const extMap: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'application/pdf': '.pdf',
        'text/plain': '.txt',
        // 可继续扩展其他常用类型
    };
    const extension = extMap[mimeType] || '.bin'; // 未知类型默认 .bin

    try {
        // 解码 base64 字符串为二进制数据
        const byteString = atob(base64Data);
        const uint8Array = Uint8Array.from(byteString, (c) => c.charCodeAt(0));

        // 创建 File 对象，type 使用从 dataURL 中解析出的真实 MIME 类型
        return new File([uint8Array], `${fileName}${extension}`, { type: mimeType });
    } catch (error) {
        // 解码失败（如 base64 数据无效）时返回 null
        return null;
    }
}


export function uint8ArraytoFile(u8Arr: Uint8Array, fileName: string) {
    const byteString = "";
    const options = {
        type: "image/png",
        endings: "native",
    };
    for (let i = 0; i < byteString.length; i++) {
        u8Arr[i] = byteString.charCodeAt(i);
    }
    // @ts-ignore
    return new File([u8Arr], `${fileName}.png`, options); // 返回文件流
}

export async function toArrayBuffer(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const arrayBuffer = reader.result;
            resolve({ arrayBuffer });
        };
        reader.readAsArrayBuffer(file);
    });
}
