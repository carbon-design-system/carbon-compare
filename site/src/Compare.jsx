import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from '@carbon/react';
import { Launch } from '@carbon/react/icons';
import { BASE, shot, storyUrl, sbUrl } from './lib.js';

function PaneHead({ v, id, label }) {
  // Version and package on the left (the package name truncates when space is short); a short,
  // non-wrapping link on the right.
  return (
    <div className="pane-head">
      <span className="pane-title">
        <span className="pane-ver">{label ?? BASE[v].label.toUpperCase()}</span>
        {!label && <span className="pane-pkg">{BASE[v].pkg}</span>}
      </span>
      {id && (
        <Link href={sbUrl(v, id)} target="_blank" rel="noopener" size="sm" renderIcon={Launch} className="pane-link">
          Open in Storybook
        </Link>
      )}
    </div>
  );
}

// Live: the real stories from both Storybooks, side by side.
export function LiveCompare({ s, b, bid }) {
  return (
    <div className="compare">
      {/* The capture restages these to match V12, but a live story can't be changed from here. */}
      {s.baseLayout === 'centered' && b === 'ibmp' && (
        <p className="compare-note">The IBM Products Storybook centers this story; V12 places it at the top left. Screenshots and pixel diffs use V12's placement for both.</p>
      )}
      <div className="pane"><PaneHead v={b} id={bid} /><div className="stage live"><iframe loading="lazy" title={`${BASE[b].label} ${s.name}`} src={storyUrl(b, bid)} /></div></div>
      <div className="pane"><PaneHead v="v12" id={s.id} /><div className="stage live"><iframe loading="lazy" title={`V12 ${s.name}`} src={storyUrl('v12', s.id)} /></div></div>
    </div>
  );
}

export function PixelDiff({ s, b }) {
  return (
    <div className="compare single">
      <div className="pane">
        <div className="pane-head"><span className="pane-ver">PIXEL DIFF · {BASE[b].label.toUpperCase()} → V12</span><span className="muted">red = changed pixels</span></div>
        <div className="stage"><img src={shot('diff', s.id)} alt={`Pixel diff for ${s.name}`} /></div>
      </div>
    </div>
  );
}

// For stories that exist on one side only: the one story, full width, with a line saying why
// there's nothing beside it. (An empty half-pane read as part of the page failing to load.)
export function OneSided({ c, sid }) {
  const v = c.status === 'removed' ? 'v11' : 'v12';
  const why =
    c.status === 'removed' ? 'Removed in V12, so there\'s only the V11 version to show.' :
    c.status === 'migrated' ? 'This story has no IBM Products equivalent, so there\'s only the V12 version to show.' :
    c.status === 'new' ? 'New in V12, so there\'s no V11 version to compare with.' :
    'This story is only in V12, so there\'s no V11 version to compare with.';
  return (
    <div className="compare single">
      <p className="compare-note">{why}</p>
      <div className="pane"><PaneHead v={v} id={sid} /><div className="stage live"><iframe loading="lazy" title={c.name} src={storyUrl(v, sid)} /></div></div>
    </div>
  );
}

// Wipe: two live stories stacked, the older version clipped on top. Clipping also limits where
// clicks land, so each side stays interactive: V12 left of the divider, the older version right,
// so dragging left reveals the older version. Both render at the capture's 1280×800 and are shifted
// together so the captured content box sits in the middle.
export function Wipe({ s, b, bid }) {
  const B = BASE[b];
  const wrap = useRef(null), layers = useRef(null);
  const [cut, setCut] = useState(50);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useLayoutEffect(() => {
    const center = () => {
      if (!layers.current) return;
      const box = layers.current.getBoundingClientRect();
      const { x = 0, y = 0, width: w = 1280, height: h = 800 } = s.clip ?? {};
      // Content larger than the wipe is pinned to its top-left instead.
      const place = (start, size, avail) => (size <= avail ? Math.round(avail / 2 - (start + size / 2)) : -start);
      setOffset({ x: place(x, w, box.width), y: place(y, h, box.height) });
    };
    center();
    window.addEventListener('resize', center);
    return () => window.removeEventListener('resize', center);
  }, [s]);

  const set = (v) => setCut(Math.max(0, Math.min(100, Math.round(v * 10) / 10)));
  const fromPointer = (e) => {
    const r = wrap.current.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };
  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 2;
    const k = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step }[e.key];
    if (k) { e.preventDefault(); set(cut + k); }
    else if (e.key === 'Home') { e.preventDefault(); set(0); }
    else if (e.key === 'End') { e.preventDefault(); set(100); }
  };

  const frame = { left: `${offset.x}px`, top: `${offset.y}px` };
  return (
    <div className={`wipe${dragging ? ' dragging' : ''}`} ref={wrap} style={{ '--cut': `${cut}%` }}>
      <div className="wipe-layers" ref={layers}>
        <div className="wipe-lay"><iframe title={`V12 ${s.name}`} src={storyUrl('v12', s.id)} style={frame} /></div>
        <div className="wipe-lay wipe-top"><iframe title={`${B.label} ${s.name}`} src={storyUrl(b, bid)} style={frame} /></div>
        {/* Drag the handle (not the whole surface) so both live stories stay clickable. */}
        <div className="wipe-handle"
          onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); }}
          onPointerMove={(e) => dragging && fromPointer(e)}
          onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}>
          <button className="wipe-knob" type="button" role="slider" aria-label={`Wipe between ${B.label} and V12`}
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={cut} aria-valuetext={`${Math.round(cut)}% V12`} onKeyDown={onKey}>⇔</button>
        </div>
      </div>
      <div className="wipe-tags"><span>← {B.label}</span><span>V12 →</span></div>
    </div>
  );
}

