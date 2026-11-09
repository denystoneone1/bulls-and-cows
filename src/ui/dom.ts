type Child = Node | string | null | false;

type AttributeValue = string | number | boolean;

interface ElementOptions {
  readonly className?: string;
  readonly text?: string;
  readonly attrs?: Readonly<Record<string, AttributeValue>>;
  readonly on?: Readonly<Record<string, EventListener>>;
}

const isPresent = (child: Child): child is Node | string => child !== null && child !== false;

const setAttributes = (element: Element, attrs: Readonly<Record<string, AttributeValue>>): void => {
  Object.entries(attrs).forEach(([name, value]) => {
    if (value === true) {
      element.setAttribute(name, '');
    } else if (value !== false) {
      element.setAttribute(name, String(value));
    }
  });
};

export const el = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  options: ElementOptions = {},
  children: readonly Child[] = [],
): HTMLElementTagNameMap[Tag] => {
  const element = document.createElement(tag);

  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  setAttributes(element, options.attrs ?? {});
  Object.entries(options.on ?? {}).forEach(([type, listener]) => {
    element.addEventListener(type, listener);
  });
  element.append(...children.filter(isPresent));

  return element;
};

const SVG_NS = 'http://www.w3.org/2000/svg';

export const svg = <Tag extends keyof SVGElementTagNameMap>(
  tag: Tag,
  attrs: Readonly<Record<string, AttributeValue>> = {},
  children: readonly SVGElement[] = [],
): SVGElementTagNameMap[Tag] => {
  const element = document.createElementNS(SVG_NS, tag);

  setAttributes(element, attrs);
  element.append(...children);

  return element;
};
