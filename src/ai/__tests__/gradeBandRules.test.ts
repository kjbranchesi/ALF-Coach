import { buildGradeBandPrompt, gradeBandRules, resolveGradeBand } from '../gradeBandRules';

describe('gradeBandRules', () => {
  const bands: Array<[string | null | undefined, string | null]> = [
    ['K-2', 'K-2'],
    ['Early Primary (K-2)', 'K-2'],
    ['3-5', '3-5'],
    ['Primary (3-5)', '3-5'],
    ['Elementary', '3-5'],
    ['Elementary School', '3-5'],
    ['Lower Elementary', 'K-2'],
    ['Upper Elementary', '3-5'],
    ['6-8', '6-8'],
    ['Middle School (6-8)', '6-8'],
    ['9-12', '9-12'],
    ['High School (9-12)', '9-12'],
    ['Mixed', null],
    [undefined, null]
  ];

  it.each(bands)('resolves %s to %s', (input, expected) => {
    expect(resolveGradeBand(input)).toBe(expected);
  });

  it('produces a concise prompt per grade band', () => {
    (Object.keys(gradeBandRules) as Array<keyof typeof gradeBandRules>).forEach((band) => {
      const prompt = buildGradeBandPrompt(band);
      expect(prompt).toContain('Grade-band focus:');
      gradeBandRules[band].developmentalMoves.forEach((item) => {
        expect(prompt).toContain(item);
      });
    });
  });
});
