import { useMemo, useState } from 'react';
import { Button, Link, Search, ContentSwitcher, Switch, TileGroup, RadioTile, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { Information } from '@carbon/react/icons';
import { STATUS, STATUS_ORDER, prefs } from '../lib.js';
import { StatusDot, Eyebrow } from '../bits.jsx';
import { resolveTiers } from '../tiers.js';
import TiersView from '../TiersView.jsx';
import CompCard from '../CompCard.jsx';

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

const VIEWS = ['tiers', 'cards'];
const VIEW_LABELS = { tiers: 'Tiers', cards: 'Cards' };

export default function Overview({ data }) {
  const { components } = data;
  const tiers = useMemo(() => resolveTiers(components), [components]);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [showUnchanged, setShowUnchanged] = useState(false);
  // The view and the tier drill-down are remembered, so coming back from a component page
  // lands where you left.
  const [view, setViewState] = useState(() => (VIEWS.includes(prefs.get('view')) ? prefs.get('view') : 'tiers'));
  const [drill, setDrillState] = useState(() => prefs.get('drill', { tier: null, cat: null }));
  const setView = (v) => { setViewState(v); prefs.set('view', v); };
  const setDrill = (d) => { setDrillState(d); prefs.set('drill', d); window.scrollTo(0, 0); };

  const count = (k) => (k === 'all' ? components.length : components.filter((c) => c.status === k).length);
  const unchanged = count('unchanged');
  const needle = q.trim().toLowerCase();
  // Status tile and search apply to both views.
  const matches = (c, label = c.name) =>
    (filter === 'all' || c.status === filter) && (!needle || label.toLowerCase().includes(needle) || c.name.toLowerCase().includes(needle));

  let list = [...components].sort((a, b) =>
    STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (b.pixel?.max ?? 0) - (a.pixel?.max ?? 0) || a.name.localeCompare(b.name));
  // By default the cards show what changed; the unchanged components are one click away.
  list = list.filter((c) => matches(c) && (filter !== 'all' || needle || showUnchanged || c.status !== 'unchanged'));

  return (
    <>
      <Eyebrow>CARBON V12 · CAPTURED FROM THE LIVE STORYBOOKS</Eyebrow>
      <h1 className="page-title">See every component, before and after</h1>
      <p className="lede">Every Carbon component in V11 and V12, side by side, with exactly what changed.</p>

      {/* Carbon's single-select tiles. The toggletip goes in the decorator slot, which sits outside
          the tile's label, so it can be interactive. */}
      <TileGroup name="status" legend="Filter components by status" className="stats" valueSelected={filter} onChange={setFilter}>
        {TILES.map((k) => {
          const label = k === 'all' ? 'Components tracked' : STATUS[k].label;
          return (
            <RadioTile key={k} id={`stat-${k}`} value={k} className="stat"
              decorator={
                <Toggletip align="bottom" className="stat-info">
                  <ToggletipButton label={`About "${label}"`}><Information /></ToggletipButton>
                  <ToggletipContent><p>{EXPLAIN[k]}</p></ToggletipContent>
                </Toggletip>
              }>
              <span className="stat-n">{count(k)}</span>
              <span className="stat-l">{k !== 'all' && <StatusDot status={k} />}{label}</span>
            </RadioTile>
          );
        })}
      </TileGroup>

      <div className="view-bar">
        <Search size="md" labelText="Search components" placeholder="Search components" className="view-search"
          value={q} onChange={(e) => setQ(e.target.value)} />
        <ContentSwitcher size="md" selectedIndex={VIEWS.indexOf(view)} onChange={({ name }) => setView(name)} className="view-switch">
          {VIEWS.map((v) => <Switch key={v} name={v} text={VIEW_LABELS[v]} />)}
        </ContentSwitcher>
      </div>

      {view === 'tiers' ? (
        <TiersView tiers={tiers} drill={drill} setDrill={setDrill} matches={matches} />
      ) : (
        <>
          <div className="card-grid">
            {list.map((c) => <CompCard key={c.id} c={c} />)}
          </div>
          {!list.length && <p className="muted">No components match.</p>}
          {filter === 'all' && !needle && unchanged > 0 && (
            <Button kind="ghost" className="more" onClick={() => setShowUnchanged(!showUnchanged)}>
              {showUnchanged ? `Hide the ${unchanged} unchanged components` : `Show ${unchanged} components with no visual change`}
            </Button>
          )}
        </>
      )}
    </>
  );
}
