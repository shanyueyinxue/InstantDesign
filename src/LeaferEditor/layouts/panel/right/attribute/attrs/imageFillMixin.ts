import { useLeaferEditor } from '../../../../editorContext'
import { activeObject } from '../../../../selectedProxyData'
import { useLayoutOptions } from '../../../../layoutOptions'
import { ImageSourceTag } from '../../../../../core'
import { type ImageFillConfig } from '../../../../components/fillPicker/interface'

export function useImageFill(): ImageFillConfig {
  const editor = useLeaferEditor()
  const options = useLayoutOptions()

  const acceptTypes = options.image?.acceptTypes ?? ['.png', '.jpg', '.jpeg']
  const maxImageSize = options.image?.maxSize ?? 10 * 1024 * 1024
  const uploadPreviewSize = options.image?.uploadPreviewSize ?? 100

  return {
    accept: acceptTypes.join(','),
    maxImageSize,
    uploadPreviewSize,
    handleUpload: (file: File) => {
      if (editor.options.image?.uploadCallback) { 
        // console.log(activeObject.value); // 可以使用 activeObject 获取当前填充的对象
        return editor.options.image?.uploadCallback(file, ImageSourceTag.ImageFill, activeObject.value!)
      }
      console.warn('uploadImageCallback is not configured in editor.options')
      return Promise.resolve({ url: '', width: 0, height: 0 })
    },
    onSuccess: (data: any) => { console.log('onSuccess', data) },
    onError: (error: Error) => { console.log('onError', error) },
    onDelete: () => { console.log('onRemove') },
  }
}
