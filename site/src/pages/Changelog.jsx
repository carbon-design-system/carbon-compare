import { useMemo, useState } from 'react';
import { SelectableTag, Toggle, Search, Button } from '@carbon/react';
import { TYPES } from '../lib.js';
import { Eyebrow } from '../bits.jsx';
import ChangeTable from '../ChangeTable.jsx';

const PAGE = 200;

export default function Changelog({ data }) {
  const [type, setType] = useState('All');
  const [q, setQ] = useState('');
  const [showInherited, setShowInherited] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const everything = useMemo(() => data.components.flatMap((c) => c.changes.map((ch) => ({ c, ch }))), [data]);
  const inhCount = everything.filter((x) => x.ch.inherited).length;
  // Inherited rows repeat a source component's change once per component that contains it; hidden by default.
  const all = showInherited ? everything : everything.filter((x) => !x.ch.inherited);
  const needle = q.toLowerCase();
  const searched = needle ? all.filter((x) => `${x.c.name} ${x.ch.element ?? ''} ${x.ch.prop} ${x.ch.from} ${x.ch.to}`.toLowerCase().includes(needle)) : all;
  const list = type === 'All' ? searched : searched.filter((x) => x.ch.type === type);
  const shown = list.slice(0, limit);
  const reset = (fn) => (...a) => { fn(...a); setLimit(PAGE); };

  return (
    <>
      <Eyebrow>CARBON V12</Eyebrow>
      <h1 className="page-title">Full changelog</h1>
      <p className="lede">
        Every difference between V11 and V12 across all captured stories. Identical changes on the same element are merged,
        so one row can cover many stories. Inherited changes (a Button's new shape showing up inside a Modal) are hidden until
        you turn them on.
      </p>
      <div className="filters" role="group" aria-label="Filter by type">
        {['All', ...TYPES].map((t) => (
          <SelectableTag key={t} selected={type === t} onChange={reset((on) => setType(on ? t : 'All'))}
            text={`${t} ${t === 'All' ? searched.length : searched.filter((x) => x.ch.type === t).length}`} />
        ))}
      </div>
      <div className="filters">
        <Toggle id="show-inherited" size="sm" labelText={`Show inherited changes (${inhCount})`} hideLabel={false}
          labelA="Hidden" labelB="Shown" toggled={showInherited} onToggle={reset(setShowInherited)} />
        <Search size="md" labelText="Search changelog" placeholder="Search: border-radius, Tag, #0f62fe…" className="changelog-search"
          value={q} onChange={reset((e) => setQ(e.target.value))} />
      </div>
      <ChangeTable rows={shown} components={data.components} withComponent source="Source" />
      {list.length > shown.length && (
        <Button kind="ghost" onClick={() => setLimit(limit + PAGE)} className="more">
          Show {Math.min(PAGE, list.length - shown.length)} more of {list.length - shown.length} remaining
        </Button>
      )}
    </>
  );
}
