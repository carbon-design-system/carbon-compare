import { useState } from 'react';
import { PageHeader, Breadcrumb, BreadcrumbItem, Dropdown, ContentSwitcher, Switch, Toggle, Link } from '@carbon/react';
import { BASE, SRC, pct, own, inherited, summaryLine, defaultFirst, prefs } from '../lib.js';
import { StatusTag } from '../bits.jsx';
import { LiveCompare, Wipe, PixelDiff, OneSided } from '../Compare.jsx';
import ChangeTable from '../ChangeTable.jsx';
import { resolveTiers, placeOf } from '../tiers.js';

const MODES = ['live', 'wipe', 'diff'];
const MODE_LABELS = { live: 'Live', wipe: 'Wipe', diff: 'Pixel diff' };

export default function ComponentPage({ c, data }) {
  const stories = defaultFirst(c.captured);
  // Migrated and new components also list their V12 stories that have no counterpart (and removed
  // components their V11-only stories); those show one side only.
  const soloIds = c.status === 'migrated' || c.status === 'new' ? c.added : c.status === 'removed' ? c.removed : [];
  const solo = soloIds.map((id) => ({ id, name: c.storyNames[id] || id, solo: true }));
  const options = defaultFirst([...stories, ...solo]);

  const [sid, setSid] = useState(options[0]?.id);
  const [mode, setModeState] = useState(() => { const m = prefs.get('mode', 'live'); return MODES.includes(m) ? m : 'live'; });
  const [thisStory, setThisStory] = useState(false);
  const setMode = (m) => { setModeState(m); prefs.set('mode', m); };

  const s = stories.find((x) => x.id === sid);
  const b = s?.base || 'v11', bid = s?.baseId || s?.v11Id;
  const optionLabel = (x) => x && `${x.name}${x.solo && c.status === 'migrated' ? ' · V12 only' : ''}${x.pixel?.ratio > 0.001 ? ` · ${pct(x.pixel.ratio)}` : ''}`;

  const scope = (l) => (thisStory && s ? l.filter((ch) => ch.stories.includes(s.id) || ch.type === 'Flag') : l);
  const ownRows = scope(own(c)).map((ch) => ({ c, ch }));
  const inhRows = scope(inherited(c)).map((ch) => ({ c, ch }));
  const flags = c.changes.filter((ch) => ch.type === 'Flag');
  const firstBase = c.captured[0]?.baseId || '';
  const place = prefs.get('view') !== 'cards' ? placeOf(resolveTiers(data.components), c) : null;

  return (
    <>
      <PageHeader.Root className="comp-header">
        <PageHeader.BreadcrumbBar>
          {place ? (
            // Came from the tiers view: each crumb returns to that level of the drill-down.
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem><Link href="#overview" onClick={() => prefs.set('drill', { tier: null, cat: null })}>All tiers</Link></BreadcrumbItem>
              <BreadcrumbItem><Link href="#overview" onClick={() => prefs.set('drill', { tier: place.tier.n, cat: null })}>Tier {place.tier.n} · {place.tier.name}</Link></BreadcrumbItem>
              <BreadcrumbItem><Link href="#overview" onClick={() => prefs.set('drill', { tier: place.tier.n, cat: place.cat.name })}>{place.cat.name}</Link></BreadcrumbItem>
            </Breadcrumb>
          ) : (
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem href="#overview">Overview</BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>{c.section}</BreadcrumbItem>
            </Breadcrumb>
          )}
        </PageHeader.BreadcrumbBar>
        <PageHeader.Content title={c.name} contextualActions={<StatusTag status={c.status} />}>
          <PageHeader.ContentText>
            <p>{summaryLine(c)}</p>
            {c.migratedFrom && (
              <p className="migrated-note">
                New to <code>@carbon/react</code>, not to Carbon: moving over
                from <Link inline href={`${SRC.ibmp}/?path=/story/${encodeURIComponent(firstBase)}`} target="_blank" rel="noopener">Carbon for IBM Products</Link>
                {c.migratedFrom.ibmpTitles.length ? ` (${c.migratedFrom.ibmpTitles.join(', ')})` : ''}.
              </p>
            )}
          </PageHeader.ContentText>
        </PageHeader.Content>
      </PageHeader.Root>

      {options.length > 0 && (
        <div className="toolbar">
          <Dropdown id="story-pick" className="story-pick" size="md" titleText="Story" label="Choose a story" type="inline"
            items={options} itemToString={optionLabel} selectedItem={options.find((o) => o.id === sid) ?? null}
            onChange={({ selectedItem }) => selectedItem && setSid(selectedItem.id)} />
          {s && (
            <>
              <ContentSwitcher size="md" selectedIndex={MODES.indexOf(mode)} onChange={({ name }) => setMode(name)} className="mode-switch">
                {MODES.map((m) => <Switch key={m} name={m} text={MODE_LABELS[m]} />)}
              </ContentSwitcher>
              <span className="px-badge">
                {mode === 'diff' ? 'From capture · ' : 'Live from both Storybooks · '}
                {s.pixel && `${s.pixel.diffPixels.toLocaleString()} px differ (${pct(s.pixel.ratio)})${s.pixel.sizeChanged ? ' · size changed' : ''}`}
              </span>
            </>
          )}
        </div>
      )}

      {s ? (
        mode === 'wipe' ? <Wipe key={s.id} s={s} b={b} bid={bid} />
          : mode === 'diff' ? <PixelDiff s={s} b={b} />
            : <LiveCompare s={s} b={b} bid={bid} />
      ) : sid ? <OneSided c={c} sid={sid} /> : null}

      <section className="log">
        <h2>What changed</h2>
        {c.notes.length > 0 && (
          <div className="notes">
            {c.notes.map((n, i) => <div className="note" key={i}><span className="note-date">{n.date} · V12 changelog</span><p>{n.text}</p></div>)}
          </div>
        )}
        {flags.length > 0 && (
          <p className="flag-line">Try it in V11 today with {flags.map((f) => <code className="flag" key={f.prop}>{f.prop}</code>)}</p>
        )}
        {s && (
          <Toggle id="this-story" size="sm" labelText="Scope" labelA={`All stories`} labelB={`Only “${s.name}”`}
            toggled={thisStory} onToggle={setThisStory} className="scope-toggle" />
        )}
        <ChangeTable title={`Changes to ${c.name}`} rows={ownRows} components={data.components} />
        {inherited(c).length > 0 && (
          <ChangeTable title="Inherited from other components" source="From" rows={inhRows} components={data.components}
            description={`These come from components nested inside ${c.name} and change wherever those components appear. Fix or review them at the source.`} />
        )}
        <p className="footnote">
          Values show the Carbon token that set them when the capture could trace it (for example <span className="tok">$field</span>).
          Carbon's radius tokens are Sass variables that compile to plain numbers, so radii are matched to the Sass scale and
          tagged <span className="mini-tag">Sass</span>. Other plain values are tagged <span className="mini-tag">literal</span>;
          they may still come from Sass. The computed value is underneath. Captured at 1280×800 in the white theme. Radii of
          9999px or more are labelled as pills. The before side is {BASE[b].label}.
        </p>
      </section>
    </>
  );
}
