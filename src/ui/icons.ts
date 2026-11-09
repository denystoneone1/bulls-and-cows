import { svg } from './dom.js';

// Контурные иконки 24x24, цвет берут из currentColor
const icon = (size: number, children: readonly SVGElement[]): SVGSVGElement =>
  svg(
    'svg',
    {
      class: 'icon',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    children,
  );

const dot = (cx: number, cy: number): SVGCircleElement =>
  svg('circle', { cx, cy, r: 0.6, fill: 'currentColor' });

export const lockIcon = (size = 16): SVGSVGElement =>
  icon(size, [
    svg('rect', { x: 5, y: 11, width: 14, height: 10, rx: 1.5 }),
    svg('path', { d: 'M8 11V8a4 4 0 0 1 8 0v3' }),
  ]);

export const clockIcon = (size = 20): SVGSVGElement =>
  icon(size, [svg('circle', { cx: 12, cy: 13, r: 8 }), svg('path', { d: 'M12 9v4l2.5 2M10 2h4' })]);

export const alertIcon = (size = 20): SVGSVGElement =>
  icon(size, [
    svg('path', { d: 'M12 3 2.5 20h19z' }),
    svg('path', { d: 'M12 10v4.5' }),
    dot(12, 17.2),
  ]);

export const infoIcon = (size = 16): SVGSVGElement =>
  icon(size, [
    svg('circle', { cx: 12, cy: 12, r: 9 }),
    svg('path', { d: 'M12 11v6' }),
    dot(12, 7.5),
  ]);

export const questionIcon = (size = 20): SVGSVGElement =>
  icon(size, [
    svg('circle', { cx: 12, cy: 12, r: 9 }),
    svg('path', { d: 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7' }),
    dot(12, 17),
  ]);

export const moonIcon = (size = 20): SVGSVGElement =>
  icon(size, [svg('path', { d: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z' })]);

export const sunIcon = (size = 20): SVGSVGElement =>
  icon(size, [
    svg('circle', { cx: 12, cy: 12, r: 4 }),
    svg('path', {
      d: 'M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    }),
  ]);
