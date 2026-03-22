# StockFlow

## Current State
StockFlow is a client-side React SPA for Indian logistics inventory management. It has Transit, Queue, Inward, Transfer, History, Dashboard, Sales (admin-only), Opening Stock, Stock Control, and Admin Settings tabs. Multi-package bilty tracking uses postfix notation (e.g. sola1011X5(1)). Data is in-memory with JSON export/import. The app has ongoing bugs with:
- Queue "Not Received" bales incorrectly removing Transit entries
- Inward saving all bales together instead of per-bale individually
- Dashboard showing only the last bilty number per item
- Inward item name auto-creating inventory items before posting
- Queue/Inward not auto-filling package count from Transit
- Missing duplicate checks in Queue and Inward

## Requested Changes (Diff)

### Add
- Queue auto-fill from Transit: when bilty typed in Queue matches a Transit base bilty, auto-populate transporter, supplier, item category, item name, AND package count (extracted from "X" value in Transit postfix, e.g. sola1011X5 → packages=5)
- Duplicate check in Queue: after auto-fill, check if any bale with that postfix already exists in Queue tab or Inward history; warn user and block/flag if duplicate found
- Queue "Not Received" bale → saved to Transit: when a bale is marked Not Received in Queue, save that bale's data (unique bilty postfix, item category, item name, package info) into Transit; it stays there until called again through Queue
- Inward auto-fill from all 3 sources: when bilty typed in Inward, check Transit + Queue + Inward History simultaneously; auto-populate fields from whichever source matches; lock already-opened bale tabs (show previous data read-only); keep pending/unopened bale tabs editable
- Inward duplicate check against all 3: Transit (auto-fill), Queue (auto-fill), Inward History (lock if already opened)
- Checkbox/tick in Inward item name field for "Add new item to inventory"; if checked, user types new name but it is NOT saved until full bale is posted; after posting, show confirmation prompt "Do you want to create this as a new item in inventory?"
- Dashboard item card: show list of ALL bilty numbers through which stock was added (not just last)
- Dashboard history panel (on item click): show all bilty numbers with full details -- time, user who opened, godown movement for each bilty

### Modify
- Queue "Not Received" logic: do NOT remove the matching Transit entry when a bale is marked Not Received; only remove from Transit when bale is marked Received
- Inward per-bale save: for packages > 1, each bale tab has its own unique bilty postfix and is saved independently (one at a time, not all together)
- Inward item name field: change from free-type to combo box (dropdown from existing inventory items); new item creation only via explicit checkbox + post-save confirmation prompt
- Dashboard item card: update to show all associated bilty numbers (list), not just the most recent one

### Remove
- Auto-creation of inventory items when typing in Inward item name field (pre-posting item creation removed entirely)

## Implementation Plan
1. Fix Queue auto-fill: update the bilty input onChange handler to strip postfix, search Transit by base bilty, extract package count from "X" suffix, populate all form fields including packages
2. Fix Queue duplicate check: after auto-fill, scan existing Queue entries and Inward history for any matching postfixed bilty; show warning toast if duplicate found
3. Fix Queue Not Received logic: change the save handler so that when bale status = Not Received, instead of removing from Transit, create/update a Transit entry with the bale's data (postfixed bilty, category, item, package info); only remove from Transit when status = Received
4. Fix Inward auto-fill: update bilty search to query Transit, Queue, and inwardHistory state simultaneously; merge results; populate form fields; for packages > 1, generate bale tabs; mark tabs where postfixed bilty exists in inwardHistory as locked/read-only
5. Fix Inward per-bale save: change save handler to save only the currently active bale tab, not all bales at once; each save commits one postfixed bilty entry to inwardHistory and updates stock
6. Fix Inward item name: replace free-type input with combo box (filtered dropdown from inventory items); add checkbox "New item?"; suppress inventory item creation in onChange/onBlur; move item creation to post-save confirmation prompt
7. Fix Dashboard bilty display: update item card rendering to collect all inwardHistory entries for that item and display all unique bilty numbers as badges; update history panel to show per-bilty detail (time, user, godown/shop distribution)
