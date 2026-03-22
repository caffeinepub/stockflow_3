# StockFlow

## Current State
StockFlow is a client-side React SPA for Indian logistics inventory management. It has Transit Ledger, Arrival Queue, Inward Processing, Transfers, History Log, Dashboard, and Admin Settings tabs. Role-based access for admin, staff, supplier.

## Requested Changes (Diff)

### Add
- Duplicate bilty prevention in Transit tab (all roles blocked from adding same bilty twice within Transit)
- Duplicate bilty prevention in Queue tab (no duplicate within Queue; same bilty as in Transit is allowed since that is the workflow)
- Auto-fill Queue tab fields (transport, supplier, item category, item name) from Transit when matching bilty number is typed
- History tab: expandable rows showing full entry details — bilty number, item name, category, sub-categories, godown distribution, transferred by, date
- Gemini API key input field in Admin Settings with localStorage persistence; pass key to callGemini
- Per-godown stock breakdown on the selected item in Transfer tab
- Critical stock alert in Dashboard: show category, sub-categories, godown threshold, godown qty remaining per item (red highlight on table rows below threshold)

### Modify
- Inward Processing bilty search/dropdown: pull matching entries from BOTH Queue and Transit (currently Queue only)
- Item Name field in Inward Processing: convert to combo box (searchable dropdown + free-text for new items); new item names auto-saved to inventory item list
- History tab: admin can edit all fields of any inward stock entry (bilty, item, qty, dates, transport, etc.)
- Bilty number input (postfix): restrict to numeric characters only across Transit, Queue, and Inward tabs
- Dashboard critical alert: show godown-only qty, category, sub-heads; highlight table rows red when below threshold

### Remove
- Nothing removed

## Implementation Plan
1. Add numeric-only validation/input filter on bilty number suffix fields in TransitTab, WarehouseTab, InwardTab
2. Add duplicate bilty check in TransitTab handleAdd — block if same bilty already exists in transitGoods for this business
3. Fix WarehouseTab duplicate check — only block duplicates within pendingParcels (not against transitGoods), so same bilty can exist in both Transit and Queue
4. Add bilty onChange handler in WarehouseTab that looks up matching Transit entry and auto-fills transport, supplier, itemCategory, itemName fields
5. Extend InwardTab Queue dropdown to also list Transit entries (merged list, labeled by source), auto-fill all matching fields on selection
6. Convert Item Name in InwardTab to combo box: show filtered dropdown from inventory, allow typing new name, on save if new name add to inventory
7. Add no-duplicate-bilty check in InwardTab handleFinalSave — block if bilty already processed in transactions
8. Add Gemini API key input in Admin Settings (stored in localStorage), wire to callGemini function
9. Transfer tab: after item selected, show per-godown stock breakdown (each godown name + qty)
10. Dashboard: highlight inventory table rows red when below threshold; expand critical alert to show category, sub-categories, godown threshold, godown qty per item
11. History tab: add expand/collapse per row showing full transaction details (bilty, item, category, godown breakdown, transferred by); add admin edit modal for inward entries
