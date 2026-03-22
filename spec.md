# StockFlow

## Current State

StockFlow is a client-side React inventory and stock management system (App.tsx, ~321KB) with:
- Transit, Queue (Warehouse), Inward, Transfer, History, Dashboard, Sales, Admin tabs
- Multi-package bilty system with postfix labeling (e.g. sola1011X5(1)...sola1011X5(5))
- Bilty uniqueness enforced per-tab; auto-removal from Transit when saved in Queue or Inward
- History tab with bilty search and item history panel in Dashboard
- WhatsApp share from item history
- Role-based access (admin/staff/supplier)

## Requested Changes (Diff)

### Add
- **Full Bilty Timeline in History tab**: A detailed timeline panel per bilty showing every checkpoint (Transit entry, Queue entry, Inward opening) with exact timestamp, user account, item category, item name, supplier, transport name, qty, and godown/shop distribution at each step. This is a richer version of the existing bilty history panel.
- **Inventory/Dashboard bilty info**: Each item in the Dashboard item history panel must show the bilty number it was received from, the date/time the parcel was opened, and the person who opened it, plus full transfer movement (who, from/to, when).

### Modify
- **Bug Fix -- Transit not cleared on Queue save (multi-package)**: `handleLog` in WarehouseTab filters Transit by exact base bilty match (`g.biltyNo !== bNo`). But when packages > 1, Transit entries are stored with postfixes (sola1011X5(1), sola1011X5(2)...). The filter misses them. Fix: after saving to Queue, also remove all Transit entries whose biltyNo starts with `${bNo}X` OR matches the base bilty exactly.
- **Bug Fix -- Move to Queue populates full postfix**: The `useEffect` in WarehouseTab that reads `moveToQueueData` fills the bilty field with the full postfixed label (e.g. sola1011X5(1)). Fix: parse the base bilty number (strip `X{N}({i})` suffix), extract the package count N, set total packages field to N, trigger the multi-bale expansion algorithm so the form shows N bale tabs ready for Received/Pending marking. Auto-fill transport, supplier, item category, item name from the Transit record.
- **Inward smart bilty search**: Current `handleLookup` matches exact bilty string only. Fix: when user types a base bilty (e.g. "sola1011"), also search Queue and Transit for postfixed variants (entries whose biltyNo starts with that base + "X"). If found, extract package count N from the postfix, set `inwardPackages` to N, generate N bale tabs (sola1011X5(1)...sola1011X5(5)). Auto-fill transport, supplier, item category from the matched Transit/Queue record. Then check `transactions` for any already-processed Inward entries with same postfixed bilty numbers -- for each already-opened bale, render its tab as read-only/locked showing the previously entered data. Only pending bale tabs remain editable.
- **Inward packages > 1 -- per-bale qty**: Currently `totalQty` is shared/auto-filled across all bale tabs. Fix: each bale tab in `perBaleData` must have its own independent `totalQty` field. The qty validation (godown + shop distribution must equal bale's own `totalQty`) applies per-bale, not across all bales.
- **Inward packages > 1 -- postfix on save**: In the multi-bale save path, each received bale must be saved as a Transaction with the unique postfixed bilty label (e.g. sola1011X5(2)) as `biltyNo`, not the base bilty. Currently saving without postfix as 1 entry.
- **Inward packages > 1 -- no cross-tab auto-fill**: When user switches between bale tabs, item name, qty, and other fields must NOT carry over from a previously filled tab. Each tab starts blank (except locked/already-opened tabs).

### Remove
- Nothing removed.

## Implementation Plan

1. **Fix Transit removal on Queue save**: In `handleLog` (WarehouseTab), after the multi-package path where received bales are added to Queue, update the Transit filter to:
   ```
   setTransitGoods(prev => prev.filter(g => {
     const bil = g.biltyNo?.toLowerCase();
     return bil !== bNo.toLowerCase() && !bil?.startsWith(bNo.toLowerCase() + 'x');
   }));
   ```
   Apply same logic in the single-package path.

2. **Fix Move to Queue autofill**: In the WarehouseTab `useEffect` that reads `moveToQueueData`:
   - Parse base bilty: strip `X{N}({i})` from the end of the biltyNo string using regex `/X(\d+)\(\d+\)$/i`
   - Extract N from the match
   - Set bilty prefix/number from base
   - Set `form.packages` to N
   - Auto-fill transport, supplier, itemCategory, itemName
   - The existing multi-bale expansion `useEffect` (triggered by packages > 1) will generate N bale tabs

3. **Inward smart bilty search**: Update `handleLookup` and the Queue dropdown search:
   - If exact match not found, search for postfixed variants: `transitGoods.find(g => g.biltyNo.match(new RegExp('^' + base + 'X', 'i')))`
   - Extract package count N from first matched entry's biltyNo
   - Set `inwardPackages` to N → triggers perBaleData generation
   - After perBaleData is generated, scan each bale label against `transactions` for existing INWARD entries; mark those bales as `locked: true` with their previous data

4. **Per-bale qty**: Change `perBaleData` item structure to include `totalQty: string` per bale. In the Inward JSX for packages > 1, render a separate "Qty in this bale" input for each bale tab. Validate per-bale: sum of items' godown+shop must equal that bale's `totalQty`.

5. **Postfix on save**: In the multi-bale `handleSaveAllBales` path, use `bale.label` (e.g. sola1011X5(2)) as the `biltyNo` in the Transaction record, not the base bilty.

6. **No cross-tab auto-fill**: In the `perBaleData` state, ensure each bale's `items` array is initialized as empty `[]` and is never copied from another bale when switching tabs.

7. **Full Bilty Timeline panel in History tab**: Enhance the `selectedBiltyForHistory` panel to show a full activity log: find all Transaction records (including INWARD, INWARD_PENDING, transfer) and Transit/Queue snapshots that reference this bilty. Display as a vertical timeline with timestamp, user, action type, and all available details (category, item name, supplier, transport, qty, godown/shop distribution per checkpoint).

8. **Dashboard item history bilty info**: In `ItemHistoryPanel`, for each INWARD transaction entry in the timeline, prominently display the bilty number (already stored in `tx.biltyNo`), date/time, and `tx.user` (who opened). For transfer entries, show from/to/by/date. This likely already exists partially -- ensure `tx.biltyNo` is displayed clearly as a badge alongside the timeline entry.
