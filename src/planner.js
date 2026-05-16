/**
 * planner.js — Plan and preview env changes before applying them
 */

/**
 * Create a plan entry describing a proposed change
 * @param {string} key
 * @param {'add'|'update'|'delete'|'keep'} action
 * @param {string|undefined} currentValue
 * @param {string|undefined} nextValue
 * @returns {object}
 */
function planEntry(key, action, currentValue, nextValue) {
  return { key, action, currentValue, nextValue };
}

/**
 * Build a plan comparing current env with proposed changes
 * @param {object} current - existing env object
 * @param {object} proposed - proposed env object
 * @returns {object[]} array of plan entries
 */
function planEnv(current = {}, proposed = {}) {
  const plan = [];
  const allKeys = new Set([...Object.keys(current), ...Object.keys(proposed)]);

  for (const key of allKeys) {
    const cur = current[key];
    const next = proposed[key];

    if (cur === undefined && next !== undefined) {
      plan.push(planEntry(key, 'add', undefined, next));
    } else if (next === undefined && cur !== undefined) {
      plan.push(planEntry(key, 'delete', cur, undefined));
    } else if (cur !== next) {
      plan.push(planEntry(key, 'update', cur, next));
    } else {
      plan.push(planEntry(key, 'keep', cur, next));
    }
  }

  return plan.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Filter plan entries by action type(s)
 * @param {object[]} plan
 * @param {string|string[]} actions
 * @returns {object[]}
 */
function filterPlan(plan, actions) {
  const set = new Set(Array.isArray(actions) ? actions : [actions]);
  return plan.filter(entry => set.has(entry.action));
}

/**
 * Summarize a plan into counts per action
 * @param {object[]} plan
 * @returns {object}
 */
function summarizePlan(plan) {
  const summary = { add: 0, update: 0, delete: 0, keep: 0, total: plan.length };
  for (const entry of plan) {
    if (entry.action in summary) summary[entry.action]++;
  }
  return summary;
}

/**
 * Apply only the non-keep actions from a plan to produce a result env
 * @param {object} current
 * @param {object[]} plan
 * @returns {object}
 */
function applyPlan(current = {}, plan = []) {
  const result = { ...current };
  for (const entry of plan) {
    if (entry.action === 'add' || entry.action === 'update') {
      result[entry.key] = entry.nextValue;
    } else if (entry.action === 'delete') {
      delete result[entry.key];
    }
  }
  return result;
}

module.exports = { planEntry, planEnv, filterPlan, summarizePlan, applyPlan };
