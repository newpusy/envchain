/**
 * profiler.js — Track and report timing/performance of env loading operations
 */

const profiles = [];

/**
 * Start a profiling session for a named operation
 * @param {string} name - operation name
 * @returns {{ stop: () => ProfileEntry }}
 */
function startProfile(name) {
  const startedAt = Date.now();
  const startHr = process.hrtime.bigint();

  return {
    stop() {
      const durationNs = Number(process.hrtime.bigint() - startHr);
      const durationMs = durationNs / 1_000_000;
      const entry = {
        name,
        startedAt,
        durationMs: parseFloat(durationMs.toFixed(3)),
        durationNs,
      };
      profiles.push(entry);
      return entry;
    },
  };
}

/**
 * Get all recorded profile entries
 * @returns {ProfileEntry[]}
 */
function getProfiles() {
  return [...profiles];
}

/**
 * Clear all recorded profile entries
 */
function clearProfiles() {
  profiles.length = 0;
}

/**
 * Summarize profiles grouped by operation name
 * @returns {Record<string, { count: number, totalMs: number, avgMs: number }>}
 */
function summarizeProfiles() {
  const summary = {};
  for (const entry of profiles) {
    if (!summary[entry.name]) {
      summary[entry.name] = { count: 0, totalMs: 0, avgMs: 0 };
    }
    summary[entry.name].count += 1;
    summary[entry.name].totalMs = parseFloat(
      (summary[entry.name].totalMs + entry.durationMs).toFixed(3)
    );
    summary[entry.name].avgMs = parseFloat(
      (summary[entry.name].totalMs / summary[entry.name].count).toFixed(3)
    );
  }
  return summary;
}

module.exports = { startProfile, getProfiles, clearProfiles, summarizeProfiles };
