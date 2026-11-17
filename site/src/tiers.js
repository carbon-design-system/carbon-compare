// The tiers view groups components by where they show up in products, from most widely used
// (tier 1) to most specialized (tier 5). Each entry is [label, the component's name in the
// changelog]. A component that isn't in the captured data (not in any Storybook) is left out.

export const TIERS = [
  { n: 1, name: 'Foundational', desc: 'Forms, inputs and actions: on every create, edit and settings flow, and the most repeated components across products.', cats: [
    { name: 'Forms & inputs', items: [['Checkbox', 'Checkbox'], ['Radio button', 'RadioButton'], ['Combo box', 'ComboBox'], ['Dropdown', 'Dropdown'], ['Multiselect', 'MultiSelect'], ['Form', 'Form'], ['Select', 'Select'], ['Text input', 'TextInput'], ['Number input', 'NumberInput'], ['Search', 'Search'], ['Date picker', 'DatePicker'], ['File uploader', 'FileUploader'], ['Slider', 'Slider'], ['Toggle', 'Toggle']] },
    { name: 'Buttons & actions', items: [['Button', 'Button'], ['Menu', 'Menu'], ['Menu button', 'MenuButton'], ['Combo button', 'ComboButton'], ['Link', 'Link']] },
  ] },
  { n: 2, name: 'Surface & elevation', desc: 'Overlays, dialogs and the containers that structure nearly every page, landing view and detail view.', cats: [
    { name: 'Overlays & dialogs', items: [['Modal', 'Modal'], ['Tearsheet', 'Tearsheet'], ['Side panel', 'SidePanel'], ['Popover', 'Popover'], ['Toggletip', 'Toggletip'], ['Tooltip', 'Tooltip'], ['Definition tooltip', 'DefinitionTooltip']] },
    { name: 'Layout & containers', items: [['Accordion', 'Accordion'], ['Card', 'preview__Card'], ['Tile', 'Tile'], ['Options tile', 'OptionsTile'], ['Page header', 'PageHeader']] },
  ] },
  { n: 3, name: 'Information & feedback', desc: 'Data display and status: everywhere, but usually small, transient or task-focused.', cats: [
    { name: 'Data display', items: [['Big number', 'preview__BigNumber'], ['List', 'UnorderedList'], ['Data table', 'DataTable'], ['Structured list', 'StructuredList'], ['Contained list', 'ContainedList'], ['Tag', 'Tag'], ['Tag overflow', 'TagOverflow'], ['Tree view', 'TreeView']] },
    { name: 'Feedback & status', items: [['Full page error', 'FullPageError'], ['Inline loading', 'InlineLoading'], ['Loading', 'Loading'], ['Notification', 'Notifications'], ['Progress bar', 'ProgressBar'], ['Progress indicator', 'ProgressIndicator']] },
  ] },
  { n: 4, name: 'Navigational', desc: 'Getting around: near-universal in multi-view products, less present in single-purpose tools.', cats: [
    { name: 'Navigation', items: [['Breadcrumb', 'Breadcrumb'], ['Content switcher', 'ContentSwitcher'], ['Tabs', 'Tabs'], ['Pagination', 'Pagination'], ['Notifications panel', 'NotificationsPanel'], ['UI Shell', 'UI Shell']] },
    { name: 'Content & media', items: [['User avatar', 'UserAvatar'], ['Code snippet', 'CodeSnippet']] },
  ] },
  { n: 5, name: 'Context-specific', desc: 'Onboarding and niche patterns: high value where present, but confined to first-run, education or specialist flows.', cats: [
    { name: 'Onboarding', items: [['Coachmark', 'Coachmark'], ['Guidebanner', 'Onboarding'], ['Interstitial screen', 'InterstitialScreen']] },
    { name: 'Niche', items: [['Condition builder', 'ConditionBuilder']] },
  ] },
];

// Tiers with each item resolved to its component; unmatched items and then-empty groups dropped.
export function resolveTiers(components) {
  const byName = new Map(components.map((c) => [c.name, c]));
  return TIERS.map((t) => ({
    ...t,
    cats: t.cats.map((cat) => ({
      ...cat,
      items: cat.items.map(([label, name]) => byName.get(name) && { label, c: byName.get(name) }).filter(Boolean),
    })).filter((cat) => cat.items.length),
  })).filter((t) => t.cats.length);
}

// Where a component sits, for the breadcrumb on its page.
export function placeOf(tiers, component) {
  for (const t of tiers) for (const cat of t.cats) {
    const item = cat.items.find((i) => i.c.id === component.id);
    if (item) return { tier: t, cat };
  }
  return null;
}
