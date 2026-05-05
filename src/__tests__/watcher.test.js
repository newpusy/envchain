const fs = require('fs');
const path = require('path');
const os = require('os');
const { watchEnvFiles } = require('../watcher');

const tmpDir = os.tmpdir();

function tmpFile(name, content) {
  const filePath = path.join(tmpDir, name);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

describe('watchEnvFiles', () => {
  it('throws if onChange is not a function', () => {
    expect(() => watchEnvFiles([], 'not-a-function')).toThrow(TypeError);
  });

  it('returns a stop() method', () => {
    const handle = watchEnvFiles([], () => {});
    expect(typeof handle.stop).toBe('function');
    handle.stop();
  });

  it('does not throw for non-existent files (skips them)', () => {
    expect(() =>
      watchEnvFiles(['/non/existent/file.env'], () => {})
    ).not.toThrow();
  });

  it('calls onChange with merged env when a file changes', (done) => {
    const filePath = tmpFile(`watcher-test-${Date.now()}.env`, 'WATCH_KEY=initial\n');

    const handle = watchEnvFiles([filePath], (err, merged) => {
      handle.stop();
      expect(err).toBeNull();
      expect(merged).toHaveProperty('WATCH_KEY', 'updated');
      done();
    }, { debounceMs: 100 });

    setTimeout(() => {
      fs.writeFileSync(filePath, 'WATCH_KEY=updated\n', 'utf8');
    }, 50);
  }, 5000);

  it('stop() prevents further callbacks', (done) => {
    const filePath = tmpFile(`watcher-stop-${Date.now()}.env`, 'STOP_KEY=1\n');
    let callCount = 0;

    const handle = watchEnvFiles([filePath], () => {
      callCount++;
    }, { debounceMs: 80 });

    handle.stop();

    setTimeout(() => {
      fs.writeFileSync(filePath, 'STOP_KEY=2\n', 'utf8');
    }, 30);

    setTimeout(() => {
      expect(callCount).toBe(0);
      done();
    }, 300);
  }, 5000);
});
