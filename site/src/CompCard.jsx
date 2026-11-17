import { ClickableTile } from '@carbon/react';
import { BASE, shot, plural, summaryLine, viaLine, cardLine } from './lib.js';
import { StatusTag } from './bits.jsx';

// A component's card: before/after thumbnails, name, status and one line. Clicking goes to its page.
export default function CompCard({ c, label }) {
  const full = [summaryLine(c), viaLine(c)].filter(Boolean).join('. ');
  return (
    <ClickableTile href={`#${c.id}`} className="card" title={full}>
      <div className="thumbs"><Thumbs c={c} /></div>
      <div className="card-meta">
        <div className="card-row"><h3 className="card-title">{label ?? c.name}</h3><StatusTag status={c.status} size="sm" /></div>
        <p>{cardLine(c)}</p>
      </div>
    </ClickableTile>
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
