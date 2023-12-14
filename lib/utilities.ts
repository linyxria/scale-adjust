export type ElementWithSelectors<E extends Element> = E | string

export const getElement = <E extends Element>(
  element: ElementWithSelectors<E>
) =>
  typeof element === 'string' ? document.querySelector<E>(element) : element

export const transformTemplate = (scale: number) =>
  `scale(${scale}) translate(-50%, -50%)`

export const isHTMLElement = (obj: any): obj is HTMLElement =>
  obj instanceof HTMLElement
