import {
  ElementWithSelectors,
  getElement,
  isHTMLElement,
  transformTemplate,
} from './utilities'

export type ScalerOptions<
  TTarget extends Element,
  TReference extends Element = Element
> = {
  el: ElementWithSelectors<TTarget>
  width: number
  height: number
  reference?: ElementWithSelectors<TReference> | true
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

  constructor({
    el,
    width,
    height,
    reference,
  }: ScalerOptions<TTarget, TReference>) {
    const targetElement = getElement(el)
    const referenceElement = reference
      ? reference === true
        ? targetElement
          ? (targetElement.parentElement as Element as TReference)
          : null
        : getElement(reference)
      : null

    this.target = targetElement
    this.reference = referenceElement
    this.width = width
    this.height = height

    const initScale = this.calculateScale(
      this.reference
        ? this.reference.clientWidth
        : document.documentElement.clientWidth,
      this.reference
        ? this.reference.clientHeight
        : document.documentElement.clientHeight
    )
    this.scale = initScale

    if (isHTMLElement(this.target)) {
      this.target.style.width = `${this.width}px`
      this.target.style.height = `${this.height}px`
      this.target.style.position = 'absolute'
      this.target.style.top = '50%'
      this.target.style.left = '50%'
      this.target.style.transform = transformTemplate(initScale)
      this.target.style.transformOrigin = '0 0'
    }

    if (this.reference) {
      this.resizeObserver = this.createResizeObserver(this.reference)

      if (isHTMLElement(this.reference)) {
        this.reference.style.position = 'relative'
      }
    } else {
      window.addEventListener('resize', this.handleWindowResize)
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
      this.target.style.transform = transformTemplate(scale)
    }
  }

  private createResizeObserver(reference: TReference) {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const scale = this.calculateScale(
        entry.target.clientWidth,
        entry.target.clientHeight
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
    if (this.reference && this.resizeObserver) {
      this.resizeObserver.unobserve(this.reference)
      this.resizeObserver.disconnect()
    } else {
      document.removeEventListener('resize', this.handleWindowResize)
    }
  }
}
