// The tiers view groups components by where they show up in products, from most widely used
// (tier 1) to most specialized (tier 5), then two unnumbered groups: Utilities (things products
// build with rather than place on screen) and Removed in V12. Each entry is [label, the
// component's name in the changelog]. Previews sit next to their stable counterparts. V12's
// "Examples" (whole workflows like Create flows) are deliberately not in any group. A component
// that isn't in the captured data (not in any Storybook) is left out.

export const TIERS = [
  { n: 1, name: 'Foundational', desc: 'Forms, inputs and actions: on every create, edit and settings flow, and the most repeated components across products.', cats: [
    { name: 'Forms & inputs', items: [['Checkbox', 'Checkbox'], ['Radio button', 'RadioButton'], ['Combo box', 'ComboBox'], ['Dropdown', 'Dropdown'], ['Multiselect', 'MultiSelect'], ['Form', 'Form'], ['Select', 'Select'], ['Text input', 'TextInput'], ['Number input', 'NumberInput'], ['Search', 'Search'], ['Date picker', 'DatePicker'], ['Date picker (preview)', 'preview__DatePicker'], ['Time picker', 'TimePicker'], ['Text area', 'TextArea'], ['Password input', 'PasswordInput'], ['File uploader', 'FileUploader'], ['Slider', 'Slider'], ['Toggle', 'Toggle'], ['Fluid components', 'Fluid Components'], ['Form group', 'FormGroup'], ['Form label', 'FormLabel'], ['Edit in place', 'EditInPlace']] },
    { name: 'Buttons & actions', items: [['Button', 'Button'], ['Icon button', 'IconButton'], ['Copy button', 'CopyButton'], ['Chat button (preview)', 'preview__ChatButton'], ['Menu', 'Menu'], ['Menu button', 'MenuButton'], ['Combo button', 'ComboButton'], ['Overflow menu', 'OverflowMenu'], ['Overflow menu V2 (preview)', 'preview__OverflowMenuV2'], ['Link', 'Link']] },
  ] },
  { n: 2, name: 'Surface & elevation', desc: 'Overlays, dialogs and the containers that structure nearly every page, landing view and detail view.', cats: [
    { name: 'Overlays & dialogs', items: [['Modal', 'Modal'], ['Composed modal', 'ComposedModal'], ['Dialog (preview)', 'preview__Dialog'], ['Tearsheet', 'Tearsheet'], ['Side panel', 'SidePanel'], ['Popover', 'Popover'], ['Toggletip', 'Toggletip'], ['Tooltip', 'Tooltip'], ['Definition tooltip', 'DefinitionTooltip']] },
    { name: 'Layout & containers', items: [['Accordion', 'Accordion'], ['Card', 'preview__Card'], ['Tile', 'Tile'], ['Options tile', 'OptionsTile'], ['Page header', 'PageHeader'], ['Aspect ratio', 'AspectRatio'], ['Layout (preview)', 'preview__Layout']] },
  ] },
  { n: 3, name: 'Information & feedback', desc: 'Data display and status: everywhere, but usually small, transient or task-focused.', cats: [
    { name: 'Data display', items: [['Big number', 'preview__BigNumber'], ['Unordered list', 'UnorderedList'], ['Ordered list', 'OrderedList'], ['Data table', 'DataTable'], ['Structured list', 'StructuredList'], ['Contained list', 'ContainedList'], ['Tag', 'Tag'], ['Tag overflow', 'TagOverflow'], ['Tree view', 'TreeView']] },
    { name: 'Feedback & status', items: [['Full page error', 'FullPageError'], ['Inline loading', 'InlineLoading'], ['Loading', 'Loading'], ['Notification', 'Notifications'], ['Progress bar', 'ProgressBar'], ['Progress indicator', 'ProgressIndicator'], ['Skeleton', 'Skeleton'], ['Status indicators (preview)', 'StatusIndicators'], ['AI label', 'AILabel']] },
  ] },
  { n: 4, name: 'Navigational', desc: 'Getting around: near-universal in multi-view products, less present in single-purpose tools.', cats: [
    { name: 'Navigation', items: [['Breadcrumb', 'Breadcrumb'], ['Content switcher', 'ContentSwitcher'], ['Tabs', 'Tabs'], ['Pagination', 'Pagination'], ['Pagination nav', 'PaginationNav'], ['Notifications panel', 'NotificationsPanel'], ['UI Shell', 'UI Shell']] },
    { name: 'Content & media', items: [['User avatar', 'UserAvatar'], ['Code snippet', 'CodeSnippet']] },
  ] },
  { n: 5, name: 'Context-specific', desc: 'Onboarding and niche patterns: high value where present, but confined to first-run, education or specialist flows.', cats: [
    { name: 'Onboarding', items: [['Coachmark', 'Coachmark'], ['Guidebanner', 'Onboarding'], ['Interstitial screen', 'InterstitialScreen']] },
    { name: 'Niche', items: [['Condition builder', 'ConditionBuilder'], ['Add select', 'AddSelect']] },
  ] },
  { key: 'utilities', name: 'Utilities', desc: 'What products build with rather than place on screen: theming, type, icons, layout primitives and hooks.', cats: [
    { name: 'Theming & setup', items: [['Theme', 'Theme'], ['Layer', 'Layer'], ['Class prefix', 'ClassPrefix'], ['ID prefix', 'IdPrefix']] },
    { name: 'Type, icons & motion', items: [['Heading', 'Heading'], ['Text (preview)', 'preview_Text'], ['IBM Plex', 'IBM Plex'], ['Icons', 'Icons'], ['Motion', 'Motion']] },
    { name: 'Layout primitives', items: [['Grid', 'Grid'], ['Flex grid', 'FlexGrid'], ['Stack', 'Stack'], ['Hide at breakpoint', 'HideAtBreakpoint']] },
    { name: 'Hooks & behaviors', items: [['useContextMenu', 'useContextMenu'], ['makeDraggable', 'makeDraggable'], ['Overflow handler', 'OverflowHandler'], ['Resizer', 'Resizer'], ['Scroll gradient', 'ScrollGradient'], ['Truncated text', 'TruncatedText'], ['Error boundary', 'ErrorBoundary']] },
  ] },
  { key: 'removed', name: 'Removed in V12', desc: 'In V11 but not in V12. Screens using these need to move off them before upgrading.', cats: [
    { name: 'Removed', items: [['Modal wrapper', 'ModalWrapper'], ['Page header (old preview)', 'preview__PageHeader'], ['Static notification (preview)', 'preview__StaticNotification'], ['Pagination (preview)', 'preview_Pagination']] },
  ] },
];

// Numbered tiers read "Tier 2 · Surface & elevation"; the extra groups just use their name.
export const groupId = (t) => t.key ?? t.n;
export const groupTitle = (t) => (t.key ? t.name : `Tier ${t.n} · ${t.name}`);

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
