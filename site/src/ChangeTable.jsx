import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, Link } from '@carbon/react';
import { DiffCell, TypeTag, SourceLinks } from './bits.jsx';

// One table for every list of changes. Columns: optional Component, Type, Element, Property,
// V11 → V12, optional Source/From, Scope.
export default function ChangeTable({ rows, components, withComponent = false, source = null, title, description }) {
  const headers = [
    ...(withComponent ? ['Component'] : []),
    'Type', 'Element', 'Property', 'V11 → V12',
    ...(source ? [source] : []),
    'Scope',
  ];
  return (
    <TableContainer title={title} description={description} className="change-table">
      <Table size="md" useZebraStyles={false}>
        <TableHead>
          <TableRow>{headers.map((h) => <TableHeader key={h}>{h}</TableHeader>)}</TableRow>
        </TableHead>
        <TableBody>
          {!rows.length ? (
            <TableRow><TableCell colSpan={headers.length} className="muted">No changes.</TableCell></TableRow>
          ) : rows.map(({ c, ch }, i) => {
            const stories = ch.stories?.length ?? 0;
            return (
              <TableRow key={i}>
                {withComponent && <TableCell><Link href={`#${c.id}`}>{c.name}</Link></TableCell>}
                <TableCell><TypeTag>{ch.type}</TypeTag></TableCell>
                <TableCell className="el">
                  {ch.element}
                  {ch.variants?.length > 1 && <span className="nt">{ch.variants.length} variants</span>}
                </TableCell>
                <TableCell>{ch.type === 'Flag' ? <code className="flag">{ch.prop}</code> : ch.prop}</TableCell>
                <TableCell className="diff">
                  <DiffCell ch={ch} />
                  {ch.note && <span className="nt">{ch.note}</span>}
                </TableCell>
                {source && (
                  <TableCell>
                    {ch.inherited ? <SourceLinks names={ch.sources} components={components} /> : <span className="muted">Own</span>}
                  </TableCell>
                )}
                <TableCell className="num">{stories > 1 ? `${stories} stories` : stories === 1 ? '1 story' : ''}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
