const { planEntry, planEnv, filterPlan, summarizePlan, applyPlan } = require('../planner');

describe('planEntry', () => {
  it('creates a plan entry with all fields', () => {
    const entry = planEntry('KEY', 'add', undefined, 'value');
    expect(entry).toEqual({ key: 'KEY', action: 'add', currentValue: undefined, nextValue: 'value' });
  });
});

describe('planEnv', () => {
  const current = { A: '1', B: '2', C: '3' };
  const proposed = { A: '1', B: '99', D: '4' };

  let plan;
  beforeEach(() => {
    plan = planEnv(current, proposed);
  });

  it('detects added keys', () => {
    const added = plan.filter(e => e.action === 'add');
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('D');
    expect(added[0].nextValue).toBe('4');
  });

  it('detects deleted keys', () => {
    const deleted = plan.filter(e => e.action === 'delete');
    expect(deleted).toHaveLength(1);
    expect(deleted[0].key).toBe('C');
    expect(deleted[0].currentValue).toBe('3');
  });

  it('detects updated keys', () => {
    const updated = plan.filter(e => e.action === 'update');
    expect(updated).toHaveLength(1);
    expect(updated[0].key).toBe('B');
    expect(updated[0].currentValue).toBe('2');
    expect(updated[0].nextValue).toBe('99');
  });

  it('detects kept keys', () => {
    const kept = plan.filter(e => e.action === 'keep');
    expect(kept).toHaveLength(1);
    expect(kept[0].key).toBe('A');
  });

  it('returns sorted entries', () => {
    const keys = plan.map(e => e.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('handles empty current', () => {
    const p = planEnv({}, { X: '1' });
    expect(p).toHaveLength(1);
    expect(p[0].action).toBe('add');
  });

  it('handles empty proposed', () => {
    const p = planEnv({ X: '1' }, {});
    expect(p[0].action).toBe('delete');
  });
});

describe('filterPlan', () => {
  const plan = [
    { key: 'A', action: 'add' },
    { key: 'B', action: 'update' },
    { key: 'C', action: 'keep' },
    { key: 'D', action: 'delete' },
  ];

  it('filters by single action', () => {
    expect(filterPlan(plan, 'add')).toHaveLength(1);
  });

  it('filters by multiple actions', () => {
    expect(filterPlan(plan, ['add', 'delete'])).toHaveLength(2);
  });
});

describe('summarizePlan', () => {
  it('counts each action type', () => {
    const plan = planEnv({ A: '1', B: '2' }, { A: '1', C: '3' });
    const summary = summarizePlan(plan);
    expect(summary.keep).toBe(1);
    expect(summary.delete).toBe(1);
    expect(summary.add).toBe(1);
    expect(summary.total).toBe(3);
  });
});

describe('applyPlan', () => {
  it('applies add, update, and delete actions', () => {
    const current = { A: '1', B: '2', C: '3' };
    const plan = planEnv(current, { A: '1', B: '99', D: '4' });
    const result = applyPlan(current, plan);
    expect(result).toEqual({ A: '1', B: '99', D: '4' });
  });

  it('does not mutate original env', () => {
    const current = { A: '1' };
    const plan = planEnv(current, {});
    applyPlan(current, plan);
    expect(current).toHaveProperty('A');
  });
});
