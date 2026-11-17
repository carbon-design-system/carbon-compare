import { Fragment } from 'react';
import { Tag, Link } from '@carbon/react';
import { STATUS } from './lib.js';

// Solid dot for most statuses; "inherited" is a hollow ring so it reads as a weaker form of "changed".
export function StatusDot({ status }) {
  return <span className={`dot dot--${status}`} aria-hidden="true" />;
}

export function StatusTag({ status, size = 'md' }) {
  const s = STATUS[status];
  return (
    <Tag type={s.tag} size={size} title={s.hint ?? s.label} className={`status-tag status-tag--${status}`}>
      {s.label}
    </Tag>
  );
}

// Hex values get a color swatch so a token swap is visible at a glance.
export function Val({ children }) {
  const text = String(children ?? '');
  const parts = text.split(/(#[0-9a-f]{6}\b)/gi);
  return parts.map((p, i) =>
    /^#[0-9a-f]{6}$/i.test(p) ? (
      <Fragment key={i}><span className="swatch" style={{ background: p }} />{p}</Fragment>
    ) : p,
  );
}

// Show Carbon token names when the capture found them ($field, $button-radius-ss/…) or when a radius
// matches the Sass radius scale ($border-radius-04), a "literal" tag for other plain values, and the
// computed values underneath for precision.
function Side({ tok, raw }) {
  if (tok?.token) {
    return (
      <>
        <span className="tok">{tok.token}</span>
        {tok.sass && <span className="mini-tag" title="A Sass token: the compiled CSS only shows its value, which matches this token exactly">Sass</span>}
      </>
    );
  }
  const lit = tok?.literal ?? tok?.hardcoded;
  if (lit) {
    return (
      <>
        <Val>{lit}</Val>
        <span className="mini-tag" title="The compiled CSS has a plain value here. It may come from a Sass variable, which compiles to a number, so this isn't proof of a hardcoded value.">literal</span>
      </>
    );
  }
  return <Val>{raw}</Val>;
}

export function DiffCell({ ch }) {
  const hasTok = ch.fromToken || ch.toToken;
  return (
    <>
      <span className="from"><Side tok={ch.fromToken} raw={ch.from} /></span>
      <span className="arrow">→</span>
      <span className="to"><Side tok={ch.toToken} raw={ch.to} /></span>
      {hasTok && <span className="rawline"><Val>{ch.from}</Val> → <Val>{ch.to}</Val></span>}
    </>
  );
}

export function TypeTag({ children }) {
  return <Tag type="outline" size="sm" className="type-tag">{children}</Tag>;
}

// "Button, TextInput" with each name linking to that component's page.
export function SourceLinks({ names, components }) {
  return names.map((n, i) => {
    const t = components.find((x) => x.name === n);
    return (
      <Fragment key={n}>
        {i > 0 && ', '}
        {t ? <Link href={`#${t.id}`}>{n}</Link> : n}
      </Fragment>
    );
  });
}

export function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>;
}
