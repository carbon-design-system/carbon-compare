import { useState } from 'react';
import { ClickableTile, InlineNotification, SelectableTag, Link } from '@carbon/react';
import { STATUS, STATUS_ORDER, STATUS_FILTERS, BASE, shot, plural, summaryLine, viaLine } from '../lib.js';
import { StatusDot, StatusTag, Eyebrow } from '../bits.jsx';

export default function Overview({ data }) {
  const { components } = data;
  const [filter, setFilter] = useState('All');
  const count = (k) => components.filter((c) => c.status === k).length;
  let list = [...components].sort((a, b) =>
    STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (b.pixel?.max ?? 0) - (a.pixel?.max ?? 0) || a.name.localeCompare(b.name));
  if (filter !== 'All') list = list.filter((c) => c.status === filter);

  return (
    <>
      <Eyebrow>CARBON V12 · CAPTURED FROM THE LIVE STORYBOOKS</Eyebrow>
      <h1 className="page-title">See every component, before and after</h1>
      <p className="lede">
        Every story that exists in both the V11 and V12 Storybooks, screenshotted side by side, with the computed-style
        differences behind each change. Open a component to try the real V11 and V12 stories side by side, drag a wipe
        across them, or see the captured pixel diff. Components moving over from <Link href="https://ibm-products.carbondesignsystem.com"
        target="_blank" rel="noopener" inline>Carbon for IBM Products</Link> are compared with their IBM Products version instead.
      </p>

      <InlineNotification kind="info" lowContrast hideCloseButton className="how-to-read" title="How to read this."
        subtitle={
          <>
            Screenshots use the white theme at 1280×800. Change entries compare the computed styles of every <code>cds--</code> element.{' '}
            <b>Changed</b> (solid dot) means the component's own styles changed; <b>Inherits changes</b> (hollow ring) means only
            something nested inside it changed, such as a Button. Components marked <b>From IBM Products</b> are new
            to <code>@carbon/react</code> but not to Carbon; they're compared with their Carbon for IBM Products version
            instead of V11. A shift that no recorded style explains is marked as unexplained.
          </>
        } />

      <div className="stats">
        <div className="stat"><div className="stat-n">{components.length}</div><div className="stat-l">Components tracked</div></div>
        {['changed', 'inherited', 'migrated', 'new', 'removed'].map((k) => (
          <div className="stat" key={k}>
            <div className="stat-n">{count(k)}</div>
            <div className="stat-l"><StatusDot status={k} />{STATUS[k].label}</div>
          </div>
        ))}
      </div>

      <div className="filters" role="group" aria-label="Filter by status">
        <SelectableTag text={`All ${components.length}`} selected={filter === 'All'} onChange={() => setFilter('All')} />
        {STATUS_FILTERS.map((s) => (
          <SelectableTag key={s} text={`${STATUS[s].label} ${count(s)}`} selected={filter === s}
            onChange={(on) => setFilter(on ? s : 'All')} />
        ))}
      </div>

      <div className="card-grid">
        {list.map((c) => (
          <ClickableTile key={c.id} href={`#${c.id}`} className="card">
            <div className="thumbs"><Thumbs c={c} /></div>
            <div className="card-meta">
              <div className="card-row"><h3 className="card-title">{c.name}</h3><StatusTag status={c.status} size="sm" /></div>
              <p>{summaryLine(c)}</p>
              {viaLine(c) && <p className="via">{viaLine(c)}</p>}
            </div>
          </ClickableTile>
        ))}
      </div>
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
