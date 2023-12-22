import { ElementWithSelectors, getElement, isHTMLElement } from './utilities'

export type ScalerOptions<
  TTarget extends Element,
  TReference extends Element = Element
> = {
  el: ElementWithSelectors<TTarget>
  width: number
  height: number
  reference?: ElementWithSelectors<TReference> | true
  transition?: string | boolean
}

type ListenCallback = (payload: { scale: number }) => void

export class Scaler<
  TTarget extends Element,
  TReference extends Element = Element
> {
  readonly target: TTarget | null
  readonly reference: TReference | null
  readonly width: number
  readonly height: number
  scale: number
  private readonly resizeObserver: ResizeObserver | undefined
  private readonly listeners: ListenCallback[] = []

  constructor(options: ScalerOptions<TTarget, TReference>) {
    this.target = getElement(options.el)
    this.reference = this.getReferenceElement(options.reference)
    this.width = options.width
    this.height = options.height
    this.scale = this.calculateScale(
      this.reference
        ? this.reference.clientWidth
        : document.documentElement.clientWidth,
      this.reference
        ? this.reference.clientHeight
        : document.documentElement.clientHeight
    )

    if (isHTMLElement(this.target)) {
      this.target.classList.add('scale-adjust-container')
      this.target.style.setProperty('--scale-adjust-width', `${this.width}px`)
      this.target.style.setProperty('--scale-adjust-height', `${this.height}px`)
      this.target.style.setProperty('--scale-adjust-scale', `${this.scale}`)

      if (options.transition) {
        this.target.style.setProperty(
          '--scale-adjust-transition',
          options.transition === true
            ? 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)'
            : options.transition
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
    reference: ElementWithSelectors<TReference> | true | undefined
  ): TReference | null {
    if (!reference) {
      return null
    }

    if (reference === true) {
      const parentElement = this.target?.parentElement
      return parentElement ? (parentElement as Element as TReference) : null
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

  private createResizeObserver(reference: TReference) {
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
