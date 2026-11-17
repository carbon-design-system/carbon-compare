import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, CodeSnippet, Tag } from '@carbon/react';
import { Eyebrow, Val, TypeTag } from '../bits.jsx';

export default function Notes({ data }) {
  const { changelog } = data;
  const t = changelog.tokens;
  const tokenRows = t ? [
    ...t.added.map((x) => ['Added', x.token, '—', x.v12]),
    ...t.changed.map((x) => ['Changed', x.token, x.v11, x.v12]),
    ...t.removed.map((x) => ['Removed', x.token, x.v11, '—']),
  ] : [];

  return (
    <>
      <Eyebrow>CARBON V12 · FROM THE V12 STORYBOOK DOCS</Eyebrow>
      <h1 className="page-title">Release notes, flags &amp; tokens</h1>
      <p className="lede">
        Taken from the V12 Storybook's <i>Getting Started/Changelog</i> and <i>Feature Flags</i> pages, plus a diff of
        the <code>--cds-*</code> custom properties in each Storybook's compiled CSS.
      </p>

      <h2 className="section-title">Release notes</h2>
      <div className="notes">
        {changelog.releaseNotes.map((n, i) => <div className="note" key={i}><span className="note-date">{n.date}</span><p>{n.text}</p></div>)}
      </div>

      <section className="log">
        <TableContainer title="Feature flags"
          description={<>Flags named <code className="flag">enable-v12-*</code> are stable and turn on by default in V12. Turn them all on in V11 with <code className="flag">enable-v12-release</code>.</>}>
          <Table size="md">
            <TableHead><TableRow><TableHeader>Flag</TableHeader><TableHeader>Description</TableHeader><TableHeader>Availability</TableHeader><TableHeader>Codemod</TableHeader></TableRow></TableHead>
            <TableBody>
              {changelog.featureFlags.map((f) => (
                <TableRow key={f.flag}>
                  <TableCell>
                    <CodeSnippet type="inline" feedback="Copied">{f.flag}</CodeSnippet>
                    {f.section === 'deprecated' && <Tag type="warm-gray" size="sm">deprecated</Tag>}
                  </TableCell>
                  <TableCell>{f.description}</TableCell>
                  <TableCell className="num">{f.availability.join(', ')}</TableCell>
                  <TableCell className="num">{f.codemod ? 'yes' : ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      <section className="log">
        <TableContainer title="Token changes">
          <Table size="md">
            <TableHead><TableRow><TableHeader>Change</TableHeader><TableHeader>Token</TableHeader><TableHeader>V11 → V12</TableHeader></TableRow></TableHead>
            <TableBody>
              {tokenRows.length ? tokenRows.map(([k, n, a, b]) => (
                <TableRow key={n}>
                  <TableCell><TypeTag>{k}</TypeTag></TableCell>
                  <TableCell className="el">{n}</TableCell>
                  <TableCell className="diff"><span className="from"><Val>{a}</Val></span><span className="arrow">→</span><span className="to"><Val>{b}</Val></span></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={3}>No token changes.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </>
  );
}
