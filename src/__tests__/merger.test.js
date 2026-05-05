const { mergeEnvs } = require('../merger');

describe('mergeEnvs', () => {
  const base = { APP_NAME: 'myapp', PORT: '3000', DEBUG: 'false' };
  const override = { PORT: '4000', NEW_KEY: 'hello' };

  describe('last-wins strategy (default)', () => {
    it('merges two env objects, later values win', () => {
      const result = mergeEnvs([base, override]);
      expect(result).toEqual({
        APP_NAME: 'myapp',
        PORT: '4000',
        DEBUG: 'false',
        NEW_KEY: 'hello',
      });
    });

    it('returns empty object for empty input', () => {
      expect(mergeEnvs([])).toEqual({});
    });

    it('handles a single env object', () => {
      expect(mergeEnvs([base])).toEqual(base);
    });

    it('merges three sources in order', () => {
      const third = { PORT: '5000', EXTRA: 'yes' };
      const result = mergeEnvs([base, override, third]);
      expect(result.PORT).toBe('5000');
      expect(result.EXTRA).toBe('yes');
      expect(result.APP_NAME).toBe('myapp');
    });
  });

  describe('first-wins strategy', () => {
    it('keeps the first defined value for duplicate keys', () => {
      const result = mergeEnvs([base, override], { strategy: 'first-wins' });
      expect(result.PORT).toBe('3000');
      expect(result.NEW_KEY).toBe('hello');
    });
  });

  describe('error strategy', () => {
    it('throws when a duplicate key is encountered', () => {
      expect(() => mergeEnvs([base, override], { strategy: 'error' })).toThrow(
        /Duplicate key "PORT"/
      );
    });

    it('does not throw when there are no duplicates', () => {
      const a = { FOO: '1' };
      const b = { BAR: '2' };
      expect(() => mergeEnvs([a, b], { strategy: 'error' })).not.toThrow();
    });
  });

  describe('invalid input', () => {
    it('throws for an unknown strategy', () => {
      expect(() => mergeEnvs([base], { strategy: 'unknown' })).toThrow(
        /Unknown merge strategy/
      );
    });

    it('skips null or non-object entries gracefully', () => {
      const result = mergeEnvs([base, null, override]);
      expect(result.PORT).toBe('4000');
    });
  });
});
