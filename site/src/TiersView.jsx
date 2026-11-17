import { SelectableTag, Tile, Link } from '@carbon/react';
import { STATUS_ORDER, cardLine } from './lib.js';
import { StatusDot } from './bits.jsx';
import CompCard from './CompCard.jsx';
import { groupId, groupTitle } from './tiers.js';

// The tiers view: all tiers → one tier → one category, then a component's own page.
// `drill` ({tier, cat}) is kept by the overview so it survives a visit to a component page.
// At the top level, components that don't match the search or status filter fade out; deeper in
// they're hidden.
export default function TiersView({ tiers, drill, setDrill, matches }) {
  const tier = tiers.find((t) => groupId(t) === drill.tier) ?? null;
  const cat = tier?.cats.find((x) => x.name === drill.cat) ?? null;
  const byStatus = (a, b) => STATUS_ORDER[a.c.status] - STATUS_ORDER[b.c.status];
  const go = (next) => (e) => { e.preventDefault(); setDrill(next); };

  const GroupHead = ({ t, kicker, onOpen }) => (
    <button type="button" className="tier-head" onClick={onOpen}>
      {kicker && <span className="tier-n">{kicker}</span>}
      <span className="tier-name" id={`tier-${groupId(t)}`}>{t.name}</span>
      <span className="tier-desc">{t.desc}</span>
    </button>
  );
  const Cat = ({ x, onOpen }) => (
    <div className="tier-cat">
      <button type="button" className="tier-cat-head" onClick={onOpen}>
        {x.name}<span className="tier-count">{x.items.length}</span>
      </button>
      {[...x.items].sort(byStatus).map(({ label, c }) => (
        <a key={c.id} href={`#${c.id}`} className={`tier-item${matches(c, label) ? '' : ' tier-item--dim'}`}>
          <StatusDot status={c.status} /><span>{label}</span>
        </a>
      ))}
    </div>
  );

  return (
    <div className="tiers">
      <div className="filters" role="group" aria-label="Tier">
        <SelectableTag text="All tiers" selected={!tier} onChange={() => setDrill({ tier: null, cat: null })} />
        {tiers.map((t) => (
          <SelectableTag key={groupId(t)} text={t.key ? t.name : `${t.n} · ${t.name}`} selected={tier === t}
            onChange={(on) => setDrill({ tier: on ? groupId(t) : null, cat: null })} />
        ))}
      </div>

      <nav className="drill-path" aria-label="Tier path">
        {tier ? <Link href="#overview" onClick={go({ tier: null, cat: null })}>All tiers</Link> : <span aria-current="page">All tiers</span>}
        {tier && <span className="sep" aria-hidden="true">/</span>}
        {tier && (cat ? <Link href="#overview" onClick={go({ tier: groupId(tier), cat: null })}>{groupTitle(tier)}</Link> : <span aria-current="page">{groupTitle(tier)}</span>)}
        {cat && <><span className="sep" aria-hidden="true">/</span><span aria-current="page">{cat.name}</span></>}
      </nav>

      {!tier && (
        <>
          <div className="tier-grid">
            {tiers.filter((t) => !t.key).map((t) => (
              <section className="tier-col" key={groupId(t)} aria-labelledby={`tier-${groupId(t)}`}>
                <GroupHead t={t} kicker={`TIER ${t.n}`} onOpen={() => setDrill({ tier: groupId(t), cat: null })} />
                {t.cats.map((x) => <Cat key={x.name} x={x} onOpen={() => setDrill({ tier: groupId(t), cat: x.name })} />)}
              </section>
            ))}
          </div>

          {/* Utilities and Removed in V12 aren't tiers, so they get their own section below. Each
              category is a column, so the section lines up with the five tiers above. */}
          {tiers.some((t) => t.key) && (
            <section className="tier-extras" aria-labelledby="tier-extras-title">
              <h2 className="tier-extras-title" id="tier-extras-title">Outside the tiers</h2>
              <div className="tier-extras-grid">
                {tiers.filter((t) => t.key).map((t) => (
                  <section className="tier-extra" key={groupId(t)} style={{ '--span': t.cats.length }} aria-labelledby={`tier-${groupId(t)}`}>
                    <GroupHead t={t} onOpen={() => setDrill({ tier: groupId(t), cat: null })} />
                    <div className="tier-extra-cats">
                      {t.cats.map((x) => <Cat key={x.name} x={x} onOpen={() => setDrill({ tier: groupId(t), cat: x.name })} />)}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {tier && !cat && (
        <>
          <p className="tier-lede">{tier.desc}</p>
          <div className="tier-panels">
            {tier.cats.map((x) => {
              const items = [...x.items].filter(({ c, label }) => matches(c, label)).sort(byStatus);
              return (
                <Tile key={x.name} className="tier-panel">
                  <button type="button" className="tier-panel-head" onClick={() => setDrill({ tier: groupId(tier), cat: x.name })}>
                    <span>{x.name}</span><span className="tier-open">Open all {x.items.length} →</span>
                  </button>
                  {items.length ? items.map(({ label, c }) => (
                    <a key={c.id} href={`#${c.id}`} className="tier-row">
                      <StatusDot status={c.status} /><span className="tier-row-name">{label}</span><span className="tier-row-meta">{cardLine(c)}</span>
                    </a>
                  )) : <p className="muted">No components match.</p>}
                </Tile>
              );
            })}
          </div>
        </>
      )}

      {cat && (
        <div className="card-grid">
          {[...cat.items].filter(({ c, label }) => matches(c, label)).sort(byStatus).map(({ label, c }) => <CompCard key={c.id} c={c} label={label} />)}
        </div>
      )}
    </div>
  );
}
