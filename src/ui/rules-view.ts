import { evaluateGuess } from '../core/guess.js';
import { el } from './dom.js';
import { describeResult, renderMarks, renderTag } from './tag.js';

const EXAMPLE_SECRET = '4702';
const EXAMPLE_GUESS = '4079';

const tagRow = (label: string, digits: string, extra: Node | null = null): HTMLElement =>
  el('div', { className: 'example-row' }, [
    el('span', { className: 'example-label', text: label }),
    el(
      'span',
      { className: 'tag-row' },
      digits.split('').map((digit) => renderTag(digit, 'tag-example')),
    ),
    extra,
  ]);

const legendItem = (markClass: string, term: string, text: string): HTMLLIElement =>
  el('li', { className: 'legend-item' }, [
    el('span', { className: `mark ${markClass}`, attrs: { 'aria-hidden': 'true' } }),
    el('span', {}, [el('b', { text: term }), text]),
  ]);

export const renderRules = (): HTMLElement => {
  const result = evaluateGuess(EXAMPLE_SECRET, EXAMPLE_GUESS);

  return el(
    'section',
    { className: 'rules', attrs: { id: 'rules', 'aria-labelledby': 'rules-title' } },
    [
      el('h2', { className: 'screen-title', text: 'Как играть', attrs: { id: 'rules-title' } }),
      el('p', {
        className: 'rules-lead',
        text: 'Компьютер загадывает число из неповторяющихся цифр. Вы вводите варианты, а на каждой бирке пробиваются подсказки.',
      }),
      el('div', { className: 'example' }, [
        tagRow('Загадано', EXAMPLE_SECRET),
        tagRow(
          'Ваш вариант',
          EXAMPLE_GUESS,
          el('span', { className: 'example-result' }, [
            renderMarks(result, EXAMPLE_GUESS.length),
            el('span', {
              className: 'score',
              text: `Б ${String(result.bulls)} К ${String(result.cows)}`,
              attrs: { 'aria-label': describeResult(result) },
            }),
          ]),
        ),
      ]),
      el('ul', { className: 'legend-list' }, [
        legendItem('mark-bull', 'Бык', ': цифра есть в числе и стоит на своем месте. Здесь это 4.'),
        legendItem('mark-cow', 'Корова', ': цифра есть, но стоит в другом месте. Здесь это 0 и 7.'),
        legendItem('mark-miss', 'Мимо', ': такой цифры нет. Здесь это 9.'),
      ]),
      el('p', {
        className: 'rules-note',
        text: 'Попыток сколько угодно. В таблицу рекордов идут число ходов и время.',
      }),
    ],
  );
};
