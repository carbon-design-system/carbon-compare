// Shared data, rules and labels. Ported from the original single-file site; the wording and
// rules are unchanged, only the rendering moved to Carbon components.

export const STATUS = {
  changed: { label: 'Changed', tag: 'blue', hint: "The component's own styles changed" },
  inherited: { label: 'Inherits changes', tag: 'outline', hint: 'Only components nested inside it changed, such as a Button' },
  migrated: { label: 'From IBM Products', tag: 'purple', hint: 'New to @carbon/react, moved over from Carbon for IBM Products' },
  new: { label: 'New in V12', tag: 'green', hint: 'New to Carbon' },
  removed: { label: 'Removed in V12', tag: 'red' },
  unchanged: { label: 'No visual change', tag: 'gray' },
};
export const STATUS_ORDER = { changed: 0, inherited: 1, migrated: 2, new: 3, removed: 4, unchanged: 5 };
export const TYPES = ['API', 'Visual', 'Layout', 'Structure', 'Story', 'Flag'];

export const SRC = {
  v11: 'https://react.carbondesignsystem.com',
  v12: 'https://v12-react.carbondesignsystem.com',
  ibmp: 'https://ibm-products.carbondesignsystem.com',
};
// The "before" side of a comparison: V11, or Carbon for IBM Products for components moving into @carbon/react.
export const BASE = {
  v11: { label: 'V11', pkg: '@carbon/react v11' },
  ibmp: { label: 'IBM Products', pkg: '@carbon/ibm-products' },
  v12: { label: 'V12', pkg: '@carbon/react v12' },
};

// Screenshots aren't committed, so copies hosted elsewhere (e.g. internally) load them from the
// public GitHub Pages site. On Pages itself and on localhost, use the local ones so they match the
// changelog being served.
const GITHUB_PAGES_BASE = 'https://carbon-design-system.github.io/carbon-compare';
const SHOTS_BASE = /(^|\.)github\.io$|^localhost$|^127\.0\.0\.1$|^\[::1\]$/.test(location.hostname) ? '' : `${GITHUB_PAGES_BASE}/`;
export const shot = (v, id) => `${SHOTS_BASE}data/shots/${v}/${encodeURIComponent(id)}.png`;
export const storyUrl = (v, id) => `${SRC[v]}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`;
export const sbUrl = (v, id) => `${SRC[v]}/?path=/story/${encodeURIComponent(id)}`;

export const pct = (r) => (r == null ? '—' : (r * 100 < 0.1 && r > 0 ? '<0.1' : (r * 100).toFixed(1)) + '%');
export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
export const own = (c) => c.changes.filter((ch) => !ch.inherited);
export const inherited = (c) => c.changes.filter((ch) => ch.inherited);

// The story a component page opens on: its "Default" story if it has one, else the first listed.
const isDefault = (id, name) => /^default$/i.test(name || '') || /--default$/.test(id);
export function defaultFirst(list, id = (x) => x.id, name = (x) => x.name) {
  const i = list.findIndex((x) => isDefault(id(x), name(x)));
  return i > 0 ? [list[i], ...list.slice(0, i), ...list.slice(i + 1)] : list;
}

export async function loadData() {
  const get = (p) => fetch(p).then((r) => {
    if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`);
    return r.json();
  });
  const [changelog, meta] = await Promise.all([get('data/changelog.json'), get('data/meta.json')]);
  const components = changelog.components.map((x) => {
    const captured = x.stories.filter((s) => s.captured && !s.error);
    const added = x.changes.filter((ch) => ch.prop === 'story added').map((ch) => ch.stories[0]);
    const removed = x.changes.filter((ch) => ch.prop === 'story removed').map((ch) => ch.stories[0]);
    // Story names for V12-only / V11-only stories come from the changelog's Story rows.
    const storyNames = Object.fromEntries(x.changes.filter((ch) => ch.type === 'Story').map((ch) => [ch.stories[0], ch.to !== '—' ? ch.to : ch.from]));
    return { ...x, captured, added, removed, storyNames, lead: captured[0] || null };
  });
  return { changelog, meta, components };
}

export function summaryLine(c) {
  const n = own(c).length, m = inherited(c).length;
  if (c.status === 'new') return `${plural(c.added.length, 'new story', 'new stories')}`;
  if (c.status === 'migrated') {
    const k = c.captured.length, px = c.pixel ? `, up to ${pct(c.pixel.max)} pixels differ` : '';
    return k ? `${plural(k, 'story', 'stories')} compared with IBM Products${px}` : 'Not in the IBM Products Storybook under this name';
  }
  if (c.status === 'removed') return `${plural(c.removed.length, 'story', 'stories')} dropped`;
  const px = c.pixel ? ` · ${c.pixel.storiesChanged}/${c.pixel.storiesCompared} stories differ, up to ${pct(c.pixel.max)} pixels` : '';
  if (c.status === 'inherited') return `Inherits ${plural(m, 'change')}${px}`;
  return `${n ? plural(n, 'change') : 'No changes'}${m ? ` + ${m} inherited` : ''}${px}`;
}

// "From Button, Tooltip" / "Also inherits from …" for cards.
export function viaLine(c) {
  if (!c.inheritsFrom?.length) return null;
  const names = c.inheritsFrom.slice(0, 4).join(', ') + (c.inheritsFrom.length > 4 ? ` +${c.inheritsFrom.length - 4} more` : '');
  return `${c.status === 'inherited' ? 'From' : 'Also inherits from'} ${names}`;
}

// Hash routing: #overview, #changelog, #notes, or #<component id>.
export function routeOf(hash, components) {
  const id = (hash || '#overview').slice(1);
  const component = components.find((x) => x.id === id) ?? null;
  const page = component ? 'component' : ['changelog', 'notes'].includes(id) ? id : 'overview';
  return { page, component };
}

// Small per-viewer preferences (compare mode); safe when storage is unavailable.
export const prefs = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem('carbon-compare') || '{}')[key] ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try {
      const all = JSON.parse(localStorage.getItem('carbon-compare') || '{}');
      localStorage.setItem('carbon-compare', JSON.stringify({ ...all, [key]: value }));
    } catch { /* storage unavailable */ }
  },
};
