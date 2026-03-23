# StockFlow

## Current State
StockFlow is a single-page React inventory management app with tabs: Dashboard, Transit, Queue, Inward, Inward Saved, History, Transfer, Godown Stock, Analytics, Sales, Admin. Analytics currently has a toggle between inward/outward movement, leaderboard and chart views. Admin has a 'fieldlabels' sub-section for renaming fields and marking them required. Dashboard has an ItemHistoryPanel that shows a transaction timeline when an item is clicked.

## Requested Changes (Diff)

### Add
- Analytics: Show both inward total AND outward total side by side for each category and each item (not just one type at a time). Add a 'Both' combined view showing inward qty column + outward qty column in leaderboard; in chart, show grouped bars or dual series.
- Analytics: Add godown filter dropdown so data is filtered to movement involving a specific godown.
- Admin Fields tab: Add move up / move down arrow buttons next to each field row so admin can reorder the fields list per tab. Store field order in state (fieldOrder: Record<string, string[]>) and persist with backup.

### Modify
- Analytics: Leaderboard table and chart must be in a scrollable inner container (overflow-y-auto, max-h ~55vh) so the list/chart scrolls independently without locking the page. Currently cannot scroll.
- Dashboard ItemHistoryPanel: Ensure the full timeline is visible when an item is clicked — each entry must prominently show: bilty number (badge), date, qty added/transferred, and user who performed the action. Already has some of this but ensure bilty number is shown for ALL inward entries and timeline entries are clearly dated.
- Admin fieldlabels section: Fix broken tab — ensure all field tabs (transit, queue, inward, etc.) load and render correctly. Ensure selectedFieldTab state resets properly when switching sub-tabs in admin.

### Remove
- Nothing removed.

## Implementation Plan
1. **Analytics combined view**: Compute separate inwardMap and outwardMap always (regardless of toggle). Add a third movementType option 'both'. When 'both' is selected, leaderboard shows columns: Category, Item, Sub-Category, Inward Qty, Outward Qty, Net. Chart shows grouped bars with two series.
2. **Analytics godown filter**: Add godowns prop to AnalyticsTab. Add godown dropdown. For inward, filter baleItemsList entries by godownQuants keys matching selected godown. For outward (TRANSFER), filter by toLocation matching selected godown.
3. **Analytics scrollable list**: Wrap leaderboard table in `<div className="overflow-y-auto" style={{maxHeight:'55vh'}}>`. Wrap chart in similar container.
4. **Dashboard item timeline**: In ItemHistoryPanel, ensure each transaction card clearly shows biltyNo badge, date, qty. For INWARD transactions, show each bale's items with qty and godown distribution. Ensure all transactions for the item are included.
5. **Admin Fields reorder**: Add `fieldOrder` state `Record<string, string[]>` initialized from TAB_FIELDS keys. Add up/down buttons per field row. On move, swap positions in fieldOrder. Render fields sorted by fieldOrder. Include fieldOrder in export/import.
6. **Admin Fields tab fix**: Ensure the fieldlabels section renders by checking that TAB_FIELDS lookup and selectedFieldTab are properly initialized. If selectedFieldTab is stale after switching activeSub, reset it in a useEffect or on click.
