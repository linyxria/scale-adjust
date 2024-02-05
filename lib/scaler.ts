import { ElementWithSelectors, getElement, isHTMLElement } from './utilities'

export type ScalerOptions<
  Target extends Element,
  Reference extends Element = Element
> = {
  /**
   * 目标元素
   * @default document.body
   */
  el: ElementWithSelectors<Target> | null
  /**
   * 基准宽度
   * @default 1920
   */
  width: number
  /**
   * 基准高度
   * @default 1080
   */
  height: number
  /**
   * 参照的元素，值为 `true` 的时候参照其父元素
   */
  reference: ElementWithSelectors<Reference> | true | null
  /**
   * 缩放时的过渡，值为 `true` 时的默认值: `transform 150ms cubic-bezier(0.4, 0, 0.2, 1)`
   */
  transition: string | boolean
}

type ListenCallback = (payload: { scale: number }) => void

export class Scaler<
  Target extends Element = Element,
  Reference extends Element = Element
> {
  readonly target: Target | null
  readonly reference: Reference | null
  readonly width: number
  readonly height: number
  scale: number
  private readonly resizeObserver: ResizeObserver | undefined
  private readonly listeners: ListenCallback[] = []

  constructor(options: Partial<ScalerOptions<Target, Reference>> = {}) {
    const {
      el = document.body as Element as Target,
      width = 1920,
      height = 1080,
      reference,
      transition,
    } = options

    this.target = getElement(el)
    this.reference = this.getReferenceElement(reference)
    this.width = width
    this.height = height
    this.scale = this.calculateScale(
      this.reference
        ? this.reference.clientWidth
        : document.documentElement.clientWidth,
      this.reference
        ? this.reference.clientHeight
        : document.documentElement.clientHeight
    )

    this.notifyListeners(this.scale)

    // TODO 只处理了 HTMLElement 的样式
    if (isHTMLElement(this.target)) {
      this.target.classList.add('scale-adjust-container')
      this.target.style.setProperty('--scale-adjust-width', `${this.width}px`)
      this.target.style.setProperty('--scale-adjust-height', `${this.height}px`)
      this.target.style.setProperty('--scale-adjust-scale', `${this.scale}`)

      if (transition) {
        this.target.style.setProperty(
          '--scale-adjust-transition',
          transition === true
            ? 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)'
            : transition
        )
      }
    }

    if (this.reference) {
      this.resizeObserver = this.createResizeObserver(this.reference)

      if (isHTMLElement(this.reference)) {
        this.reference.classList.add('scale-adjust-parent')
      }
    } else {
      window.addEventListener('resize', this.handleWindowResize)
    }
  }

  private getReferenceElement(
    reference: ElementWithSelectors<Reference> | true | null | undefined
  ): Reference | null {
    if (!reference) {
      return null
    }

    if (reference === true) {
      const parentElement = this.target?.parentElement
      return parentElement ? (parentElement as Element as Reference) : null
    } else {
      return getElement(reference)
    }
  }

  private calculateScale = (
    referenceWidth: number,
    referenceHeight: number
  ): number => {
    let result = 1

    const originScale = this.width / this.height
    const referenceScale = referenceWidth / referenceHeight

    if (referenceScale < originScale) {
      result = referenceWidth / this.width
    } else {
      result = referenceHeight / this.height
    }

    return result
  }

  private changeTransform(scale: number) {
    if (isHTMLElement(this.target)) {
      this.target.style.setProperty('--scale-adjust-scale', `${scale}`)
    }
  }

  private createResizeObserver(reference: Reference) {
    const resizeObserver = new ResizeObserver((entries) => {
      const contentBoxSize = entries[0].contentBoxSize[0]
      const scale = this.calculateScale(
        contentBoxSize.inlineSize,
        contentBoxSize.blockSize
      )
      this.scale = scale
      this.changeTransform(scale)
      this.notifyListeners(scale)
    })
    resizeObserver.observe(reference)
    return resizeObserver
  }

  private handleWindowResize = () => {
    const scale = this.calculateScale(
      document.documentElement.clientWidth,
      document.documentElement.clientHeight
    )
    this.scale = scale
    this.changeTransform(scale)
    this.notifyListeners(scale)
  }

  private notifyListeners(scale: number) {
    this.listeners.forEach((listener) => {
      listener({ scale })
    })
  }

  listen(callback: ListenCallback) {
    this.listeners.push(callback)
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    } else {
      document.removeEventListener('resize', this.handleWindowResize)
    }
  }
}
