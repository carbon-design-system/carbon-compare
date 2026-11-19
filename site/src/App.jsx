import { useEffect, useMemo, useState } from 'react';
import {
  Theme, Header, HeaderName, HeaderMenuButton, HeaderGlobalBar, HeaderGlobalAction, SkipToContent,
  SideNav, SideNavItems, SideNavLink, SideNavDivider, Search, Content, Loading, InlineNotification,
} from '@carbon/react';
import { Light, Asleep, Laptop, LogoGithub } from '@carbon/react/icons';
import { loadData, routeOf, STATUS, prefs } from './lib.js';
import { StatusDot } from './bits.jsx';
import Overview from './pages/Overview.jsx';
import ComponentPage from './pages/ComponentPage.jsx';
import Changelog from './pages/Changelog.jsx';
import Notes from './pages/Notes.jsx';

// The device's light/dark preference, for the "System" theme option.
function usePrefersDark() {
  const mq = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)'), []);
  const [dark, setDark] = useState(mq.matches);
  useEffect(() => {
    const on = (e) => setDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [mq]);
  return dark;
}

// Theme choice: "system" follows the device; "light" and "dark" are Carbon's white and Gray 100.
// Remembered per browser.
const THEMES = { system: { label: 'System', icon: Laptop }, light: { label: 'Light', icon: Light }, dark: { label: 'Dark', icon: Asleep } };
function useTheme() {
  const prefersDark = usePrefersDark();
  const [choice, setChoiceState] = useState(() => (THEMES[prefs.get('theme')] ? prefs.get('theme') : 'system'));
  const setChoice = (c) => { setChoiceState(c); prefs.set('theme', c); };
  const dark = choice === 'dark' || (choice === 'system' && prefersDark);
  // Native controls and scrollbars follow too.
  useEffect(() => { document.documentElement.style.colorScheme = dark ? 'dark' : 'light'; }, [dark]);
  return { choice, setChoice, dark };
}

// One click moves to the next option (System → Light → Dark → System). The icon shows the
// current choice; the label says what the next click does, which screen readers announce.
const THEME_ORDER = ['system', 'light', 'dark'];
function ThemeToggle({ choice, setChoice }) {
  const next = THEME_ORDER[(THEME_ORDER.indexOf(choice) + 1) % THEME_ORDER.length];
  const Icon = THEMES[choice].icon;
  return (
    <HeaderGlobalAction aria-label={`Theme: ${THEMES[choice].label}. Switch to ${THEMES[next].label}`}
      tooltipAlignment="end" onClick={() => setChoice(next)}>
      <Icon size={20} />
    </HeaderGlobalAction>
  );
}

function useHash() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const on = () => { setHash(location.hash); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

function stampText(meta, changelog) {
  const date = new Date(meta.capturedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  // The Carbon releases compared (set when a release triggered the capture; see watch-releases.yml).
  const rel = meta.releases?.v12 ? ` · ${meta.releases.v11 ? meta.releases.v11 + ' vs ' : ''}${meta.releases.v12}` : '';
  // __CARBON_VERSION__ is the @carbon/react this site itself is built with (see vite.config.js).
  return `Captured ${date}${rel} · ${changelog.counts.storiesCompared} stories · Site built with @carbon/react ${__CARBON_VERSION__}`;
}

export default function App() {
  const { choice, setChoice, dark } = useTheme();
  const hash = useHash();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [navQ, setNavQ] = useState('');

  useEffect(() => { loadData().then(setData, setError); }, []);
  useEffect(() => { setNavOpen(false); }, [hash]); // close the mobile nav after navigating

  const { page, component } = data ? routeOf(hash, data.components) : { page: 'overview', component: null };
  useEffect(() => {
    document.title = (component ? component.name + ' · ' : page === 'changelog' ? 'Changelog · ' : '') + 'Carbon Compare';
  }, [page, component]);

  const active = component ? component.id : page;
  const groups = useMemo(() => {
    if (!data) return [];
    const q = navQ.toLowerCase();
    const bySection = {};
    for (const c of data.components) {
      if (q && !c.name.toLowerCase().includes(q)) continue;
      (bySection[c.section] ??= []).push(c);
    }
    const order = ['Components', ...Object.keys(bySection).filter((s) => s !== 'Components').sort()];
    return order.filter((s) => bySection[s]).map((s) => [s, bySection[s]]);
  }, [data, navQ]);

  return (
    <Theme theme={dark ? 'g100' : 'white'} className="app">
      <Header aria-label="Carbon Compare">
        <SkipToContent />
        <HeaderMenuButton aria-label={navOpen ? 'Close menu' : 'Open menu'} onClick={() => setNavOpen(!navOpen)} isActive={navOpen} aria-expanded={navOpen} />
        <HeaderName href="#overview" prefix="IBM">Carbon Compare</HeaderName>
        <HeaderGlobalBar>
          {data && <span className="stamp" title={stampText(data.meta, data.changelog)}>{stampText(data.meta, data.changelog)}</span>}
          <ThemeToggle choice={choice} setChoice={setChoice} />
          <HeaderGlobalAction aria-label="Source on GitHub" tooltipAlignment="end"
            href="https://github.com/carbon-design-system/carbon-compare" target="_blank" rel="noopener">
            <LogoGithub size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
        <SideNav aria-label="Components" expanded={navOpen} onOverlayClick={() => setNavOpen(false)} onSideNavBlur={() => setNavOpen(false)} href="#main-content">
          <SideNavItems>
            <li className="nav-heading">Release</li>
            <SideNavLink href="#overview" isActive={active === 'overview'}>Overview</SideNavLink>
            <SideNavLink href="#changelog" isActive={active === 'changelog'}>
              <span className="nav-row">Full changelog{data && <span className="nav-count">{data.changelog.counts.changes}</span>}</span>
            </SideNavLink>
            <SideNavLink href="#notes" isActive={active === 'notes'}>Release notes, flags &amp; tokens</SideNavLink>
            <li className="nav-search">
              <Search size="sm" labelText="Filter components" placeholder="Filter components" value={navQ} onChange={(e) => setNavQ(e.target.value)} />
            </li>
            {groups.map(([section, list]) => (
              <SectionLinks key={section} section={section} list={list} active={active} />
            ))}
            {data && !groups.length && <li className="nav-heading">No match</li>}
          </SideNavItems>
        </SideNav>
      </Header>
      <Content id="main-content" className="main">
        {error ? (
          <InlineNotification kind="error" title="Couldn't load data" hideCloseButton lowContrast
            subtitle={`${error.message}. Run npm run capture && npm run diff, then npm run dev.`} />
        ) : !data ? (
          <Loading withOverlay={false} description="Loading captured data" />
        ) : page === 'component' ? (
          <ComponentPage key={component.id} c={component} data={data} />
        ) : page === 'changelog' ? (
          <Changelog data={data} />
        ) : page === 'notes' ? (
          <Notes data={data} />
        ) : (
          <Overview data={data} />
        )}
      </Content>
    </Theme>
  );
}

function SectionLinks({ section, list, active }) {
  return (
    <>
      <SideNavDivider />
      <li className="nav-heading">{section}</li>
      {list.map((c) => (
        <SideNavLink key={c.id} href={`#${c.id}`} isActive={active === c.id}>
          <span className="nav-row" title={STATUS[c.status].label}>
            <span className="nav-name">{c.name}</span>
            <StatusDot status={c.status} />
          </span>
        </SideNavLink>
      ))}
    </>
  );
}
