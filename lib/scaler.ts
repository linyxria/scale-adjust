import styles from './scaler.module.css'

type ScaleCallback = (scale: number) => void

export interface ScalerOptions<E extends HTMLElement> {
  /**
   * @description 大屏挂载元素
   */
  el: E | string | null
  /**
   * @description 大屏宽度
   */
  width: number
  /**
   * @description 大屏高度
   */
  height: number
}

export class Scaler<E extends HTMLElement> {
  readonly element: E | null = null
  readonly width: number
  readonly height: number
  scale: number
  private readonly resizeObserver: ResizeObserver | undefined
  private readonly listeners: Set<ScaleCallback> = new Set()

  constructor({ el, width, height }: ScalerOptions<E>) {
    this.width = width
    this.height = height
    this.scale = 1
    const element = typeof el === 'string' ? document.querySelector<E>(el) : el
    if (element) {
      element.style.setProperty('--scale-adjust-width', `${width}px`)
      element.style.setProperty('--scale-adjust-height', `${height}px`)
      element.classList.add(styles.container)
      this.element = element
      const parentElement = element.parentElement
      if (parentElement) {
        parentElement.classList.add(styles.parent)
        this.resizeObserver = this.createResizeObserver(parentElement)
      }
    }
  }

  private createResizeObserver(target: Element) {
    const resizeObserver = new ResizeObserver((entries) => {
      const { inlineSize, blockSize } = entries[0].contentBoxSize[0]
      this.changeTransform(inlineSize, blockSize)
    })
    resizeObserver.observe(target)
    return resizeObserver
  }

  private changeTransform(inlineSize: number, blockSize: number) {
    const scaleX = inlineSize / this.width
    const scaleY = blockSize / this.height
    const scale = Math.min(scaleX, scaleY)

    if (scale !== this.scale) {
      this.scale = scale
      this.notifyListeners(scale)
      this.element &&
        this.element.style.setProperty('--scale-adjust-scale', `${scale}`)
    }

    if (this.element) {
      const translateX = (inlineSize - this.width * scale) / 2
      const translateY = (blockSize - this.height * scale) / 2
      this.element.style.setProperty(
        '--scale-adjust-translate-x',
        `${translateX}px`
      )
      this.element.style.setProperty(
        '--scale-adjust-translate-y',
        `${translateY}px`
      )
    }
  }

  private notifyListeners(scale: number) {
    this.listeners.forEach((listener) => {
      listener(scale)
    })
  }

  onScale(callback: ScaleCallback) {
    this.listeners.add(callback)
  }

  destroy() {
    this.resizeObserver?.disconnect()
  }
}
