export type ElementWithSelectors<T extends HTMLElement = HTMLElement> =
  | T
  | string

export type ScalerOptions<T extends HTMLElement = HTMLElement> = {
  reference?: ElementWithSelectors<T> | true
}

type ListenCallback = (payload: { scale: number }) => void

export class Scaler<
  TTarget extends HTMLElement = HTMLElement,
  TReference extends HTMLElement = HTMLElement
> {
  readonly target: TTarget | null = null
  readonly reference: TReference | null = null
  readonly width: number
  readonly height: number
  scale: number
  private readonly resizeObserver: ResizeObserver | null = null
  private readonly listeners: ListenCallback[] = []

  constructor(
    target: ElementWithSelectors<TTarget>,
    width: number,
    height: number,
    { reference }: ScalerOptions<TReference> = {}
  ) {
    const targetElement = this.getElement(target)
    const referenceElement = reference
      ? reference === true
        ? targetElement
          ? (targetElement.parentElement as TReference)
          : null
        : this.getElement(reference)
      : null

    this.target = targetElement
    this.reference = referenceElement
    this.width = width
    this.height = height

    const initScale = this.calculateScale(
      referenceElement
        ? referenceElement.clientWidth
        : document.documentElement.clientWidth,
      referenceElement
        ? referenceElement.clientHeight
        : document.documentElement.clientHeight
    )
    this.scale = initScale

    if (targetElement) {
      targetElement.style.width = `${this.width}px`
      targetElement.style.height = `${this.height}px`
      targetElement.style.position = 'absolute'
      targetElement.style.top = '50%'
      targetElement.style.left = '50%'
      targetElement.style.transform = this.transformTemplate(initScale)
      targetElement.style.transformOrigin = '0 0'
    }

    if (referenceElement) {
      referenceElement.style.position = 'relative'
      this.resizeObserver = this.createResizeObserver(referenceElement)
    } else {
      window.addEventListener('resize', this.handleWindowResize)
    }
  }

  private getElement<T extends HTMLElement>(element: ElementWithSelectors<T>) {
    return typeof element === 'string'
      ? document.querySelector<T>(element)
      : element
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

  private transformTemplate(scale: number) {
    return `scale(${scale}) translate(-50%, -50%)`
  }

  private createResizeObserver(reference: TReference) {
    const resizeObserver = new ResizeObserver(([entry]) => {
      const scale = this.calculateScale(
        entry.target.clientWidth,
        entry.target.clientHeight
      )
      this.scale = scale

      if (this.target) {
        this.target.style.transform = this.transformTemplate(scale)
      }

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

    if (this.target) {
      this.target.style.transform = this.transformTemplate(scale)
    }

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
