
/**
 * 将文件读取为DataURL
 * @param file 文件对象
 * @returns 文件的DataURL
 */
export async function readFileAsDataURL(file: File): Promise<{
    url: string;
    width: number;
    height: number;
    name?: string;
}> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
            img.onload = () => {
                const url = img.src;
                const width = img.width;
                const height = img.height;
                resolve({ url, width, height });
            };
        };
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsDataURL(file);
    });
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
        const base64DataLength = base64Data.length;
        if (base64DataLength === 0) {
            return null;
        }else if (base64DataLength % 4 !== 0) { // 检查 base64 数据长度是否为 4 的倍数，不是则抛出错误
            throw new Error('Invalid base64 data length');
        }else if (base64DataLength > 1024 * 1024 * 1024) { // 检查 base64 数据长度是否超过 1GB，不是则抛出错误
            throw new Error('Base64 data length exceeds 1GB');
        }
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

/**
 * 将 blob: URL 转换为 File 对象
 * @param blobUrl blob: 格式的 URL（例如 "blob:http://..."）
 * @param fileName 文件名
 * @returns File 对象，失败时返回 null
 */
export async function blobUrlToFile(blobUrl: string, fileName: string): Promise<File | null> {
    try {
        const response = await fetch(blobUrl);
        if (!response.ok) return null;
        const blob = await response.blob();
        return new File([blob], fileName, { type: blob.type });
    } catch {
        return null;
    }
}
