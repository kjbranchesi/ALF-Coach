import { isProgressSignal, isConfusedSignal, hasJourneyContent, hasDeliverablesContent } from '../utils/stageTransitions';

describe('stageTransitions helpers', () => {
  it('detects progress signals', () => {
    expect(isProgressSignal("let's continue"));
    expect(isProgressSignal('next step'));
  });
  it('detects confusion signals', () => {
    expect(isConfusedSignal("I'm confused about this"));
  });
  it('detects journey content when substantive', () => {
    const text = 'In week 1 we research and analyze documents; in week 2 we brainstorm';
    expect(hasJourneyContent(text)).toBe(true);
  });
  it('detects deliverables content when substantive', () => {
    const text = 'Students present a prototype and a report at an exhibition for stakeholders.';
    expect(hasDeliverablesContent(text)).toBe(true);
  });
});

