/**
 * classifier.js — Classify env keys into semantic categories
 */

const CATEGORIES = {
  auth: /^(AUTH|JWT|TOKEN|SECRET|PASSWORD|PASS|API_KEY|OAUTH)/i,
  database: /^(DB|DATABASE|MONGO|POSTGRES|MYSQL|REDIS|SQLITE)/i,
  network: /^(HOST|PORT|URL|URI|ENDPOINT|DOMAIN|BASE_URL|API_URL)/i,
  feature: /^(FEATURE|FLAG|ENABLE|DISABLE|TOGGLE)/i,
  logging: /^(LOG|LOGGER|DEBUG|VERBOSE|SILENT)/i,
  infra: /^(AWS|GCP|AZURE|S3|BUCKET|REGION|CLUSTER)/i,
  email: /^(MAIL|EMAIL|SMTP|SENDGRID|MAILGUN)/i,
  app: /^(APP|NODE|ENV|VERSION|BUILD|RELEASE)/i,
};

/**
 * Classify a single key into a category.
 * @param {string} key
 * @returns {string} category name or 'other'
 */
function classifyKey(key) {
  if (typeof key !== 'string' || key.trim() === '') return 'other';
  for (const [category, pattern] of Object.entries(CATEGORIES)) {
    if (pattern.test(key)) return category;
  }
  return 'other';
}

/**
 * Classify all entries in an env object.
 * @param {Record<string, string>} env
 * @returns {Record<string, { value: string, category: string }>}
 */
function classifyEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = { value, category: classifyKey(key) };
  }
  return result;
}

/**
 * Group env keys by their category.
 * @param {Record<string, string>} env
 * @returns {Record<string, string[]>}
 */
function groupByCategory(env) {
  const groups = {};
  for (const [key] of Object.entries(env)) {
    const cat = classifyKey(key);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(key);
  }
  return groups;
}

/**
 * Summarize category distribution.
 * @param {Record<string, string>} env
 * @returns {{ total: number, breakdown: Record<string, number> }}
 */
function summarizeClassification(env) {
  const groups = groupByCategory(env);
  const breakdown = {};
  let total = 0;
  for (const [cat, keys] of Object.entries(groups)) {
    breakdown[cat] = keys.length;
    total += keys.length;
  }
  return { total, breakdown };
}

module.exports = { classifyKey, classifyEnv, groupByCategory, summarizeClassification };
