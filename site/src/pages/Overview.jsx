import { useState } from 'react';
import { ClickableTile, Button, Link, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { Information } from '@carbon/react/icons';
import { STATUS, STATUS_ORDER, BASE, shot, plural, pct, own, inherited, summaryLine, viaLine } from '../lib.js';
import { StatusDot, StatusTag, Eyebrow } from '../bits.jsx';

// The stat tiles double as the filters, and each carries its own explanation in a toggletip,
// so the legend shows up where it's needed instead of in a block above the page.
const TILES = ['all', 'changed', 'inherited', 'migrated', 'new', 'removed'];
const EXPLAIN = {
  all: <>Every component group in the V11, V12 and Carbon for IBM Products Storybooks. Screenshots and styles are captured in the white theme at 1280×800; open a component to try the live stories.</>,
  changed: <>The component's own styles changed between V11 and V12. Shown with a solid dot.</>,
  inherited: <>Only components nested inside it changed, such as a Button inside a Modal. Shown with a hollow ring. Review these at the source component.</>,
  migrated: (
    <>New to <code>@carbon/react</code> but not to Carbon: moving over
      from <Link inline href="https://ibm-products.carbondesignsystem.com" target="_blank" rel="noopener">Carbon for IBM Products</Link>.
      Compared with its IBM Products version instead of V11.</>
  ),
  new: <>New to Carbon in V12. There's no earlier version to compare with.</>,
  removed: <>In V11 but not in V12.</>,
};

// One line per card; the full summary is on hover and on the component page.
function cardLine(c) {
  const px = c.pixel?.max > 0.001 ? ` · up to ${pct(c.pixel.max)} pixels` : '';
  switch (c.status) {
    case 'changed': return `${plural(own(c).length, 'change')}${px}`;
    case 'inherited': return `Inherits ${plural(inherited(c).length, 'change')}${px}`;
    case 'migrated': return c.captured.length ? `${plural(c.captured.length, 'story', 'stories')} compared${px}` : 'No matching IBM Products story';
    case 'new': return plural(c.added.length, 'new story', 'new stories');
    case 'removed': return `${plural(c.removed.length, 'story', 'stories')} dropped`;
    default: return 'No visual change';
  }
}

export default function Overview({ data }) {
  const { components } = data;
  const [filter, setFilter] = useState('all');
  const [showUnchanged, setShowUnchanged] = useState(false);
  const count = (k) => (k === 'all' ? components.length : components.filter((c) => c.status === k).length);
  const unchanged = count('unchanged');

  let list = [...components].sort((a, b) =>
    STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (b.pixel?.max ?? 0) - (a.pixel?.max ?? 0) || a.name.localeCompare(b.name));
  // By default, show what changed; the unchanged components are one click away.
  list = filter === 'all' ? list.filter((c) => showUnchanged || c.status !== 'unchanged') : list.filter((c) => c.status === filter);

  return (
    <>
      <Eyebrow>CARBON V12 · CAPTURED FROM THE LIVE STORYBOOKS</Eyebrow>
      <h1 className="page-title">See every component, before and after</h1>
      <p className="lede">Every Carbon component in V11 and V12, side by side, with exactly what changed.</p>

      <div className="stats" role="group" aria-label="Filter components by status">
        {TILES.map((k) => (
          <div key={k} className={`stat${filter === k ? ' stat--selected' : ''}`}>
            <button type="button" className="stat-btn" aria-pressed={filter === k} onClick={() => setFilter(k)}>
              <span className="stat-n">{count(k)}</span>
              <span className="stat-l">{k !== 'all' && <StatusDot status={k} />}{k === 'all' ? 'Components tracked' : STATUS[k].label}</span>
            </button>
            <Toggletip align="bottom" className="stat-info">
              <ToggletipButton label={`About "${k === 'all' ? 'Components tracked' : STATUS[k].label}"`}>
                <Information />
              </ToggletipButton>
              <ToggletipContent><p>{EXPLAIN[k]}</p></ToggletipContent>
            </Toggletip>
          </div>
        ))}
      </div>

      <div className="card-grid">
        {list.map((c) => {
          const full = [summaryLine(c), viaLine(c)].filter(Boolean).join('. ');
          return (
            <ClickableTile key={c.id} href={`#${c.id}`} className="card" title={full}>
              <div className="thumbs"><Thumbs c={c} /></div>
              <div className="card-meta">
                <div className="card-row"><h3 className="card-title">{c.name}</h3><StatusTag status={c.status} size="sm" /></div>
                <p>{cardLine(c)}</p>
              </div>
            </ClickableTile>
          );
        })}
      </div>

      {filter === 'all' && unchanged > 0 && (
        <Button kind="ghost" className="more" onClick={() => setShowUnchanged(!showUnchanged)}>
          {showUnchanged ? `Hide the ${unchanged} unchanged components` : `Show ${unchanged} components with no visual change`}
        </Button>
      )}
    </>
  );
}

function Thumb({ label, children }) {
  return <div className="thumb"><span className="thumb-label">{label}</span>{children}</div>;
}

function Thumbs({ c }) {
  const stories = (n) => plural(n, 'story', 'stories');
  if (c.lead) {
    const b = c.lead.base || 'v11';
    return (
      <>
        <Thumb label={BASE[b].label}><img loading="lazy" src={shot(b, c.lead.id)} alt={`${BASE[b].label} ${c.name}`} /></Thumb>
        <Thumb label="V12"><img loading="lazy" src={shot('v12', c.lead.id)} alt={`V12 ${c.name}`} /></Thumb>
      </>
    );
  }
  if (c.status === 'migrated') return <><Thumb label="IBM Products"><span className="empty">No matching story</span></Thumb><Thumb label="V12"><span className="empty">{stories(c.added.length)}</span></Thumb></>;
  if (c.status === 'new') return <><Thumb label="V11"><span className="empty">Not in V11</span></Thumb><Thumb label="V12"><span className="empty">{stories(c.added.length)}</span></Thumb></>;
  return <><Thumb label="V11"><span className="empty">{stories(c.removed.length)}</span></Thumb><Thumb label="V12"><span className="empty">Not in V12</span></Thumb></>;
}
