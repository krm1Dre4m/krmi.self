const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'gallery.js'), 'utf8');
const sandbox = { window: {}, module: { exports: {} } };
vm.runInNewContext(source, sandbox, { filename: 'gallery.js' });
const { collectPhotos, planMasonry } = sandbox.module.exports;

const posts = [
  { id: 4, title: 'A day', date: '13-11-2026', body: [
    { image: 'assets/1.png', alt: 'A', caption: 'First', uploaded: '12-11-2026' },
    { stack: [{ image: 'assets/2.png' }, { image: 'assets/3.png', caption: 'Own caption' }], caption: 'Stack caption' }
  ] }
];
const photos = collectPhotos(posts);
test('extracts individual photos and stack photos with the right source details', () => {
  assert.equal(photos.length, 3);
  assert.deepEqual(Array.from(photos, photo => photo.caption), ['First', 'Stack caption', 'Own caption']);
  assert.deepEqual(Array.from(photos, photo => photo.postId), [4, 4, 4]);
  assert.equal(photos[0].isUploadDate, true);
  assert.equal(photos[0].date.toISOString().slice(0, 10), '2026-11-12');
  assert.equal(photos[1].date.toISOString().slice(0, 10), '2026-11-13');
});

const shapes = [.6, 1.7, .75, 2, .85, 1.2, 1.4, .5].map(ratio => ({ ratio }));
const clashes = items => {
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      const x = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const y = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      if (x > .01 && y > .01) return true;
    }
  }
  return false;
};
test('masonry reflows without tile collisions at mobile, tablet and desktop widths', () => {
  for (const width of [320, 375, 430, 650, 875, 980]) {
    for (let active = -1; active < shapes.length; active++) {
      const plan = planMasonry(shapes, width, active, active < 0 ? 0 : 115);
      assert.equal(clashes(plan.items), false, `collision at ${width}px with active image ${active}`);
      assert.equal(plan.items.filter(item => item.span > 1).length,
        active < 0 || plan.columns === 1 ? 0 : 1);
    }
  }
});
test('expanding a photo actually moves other tiles in the Pinterest layout', () => {
  const normal = planMasonry(shapes, 900, -1);
  const selected = planMasonry(shapes, 900, 1, 120);
  assert.ok(selected.items[1].width > normal.items[1].width);
  assert.ok(selected.items.some((item, i) => i !== 1 &&
    (item.x !== normal.items[i].x || item.y !== normal.items[i].y)));
});