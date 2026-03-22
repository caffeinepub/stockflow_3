# StockFlow

## Current State
- Transfer tab has a 'Transfer Another Item' button that appears only after a successful transfer (transferDone state). It resets search/selectedSku/qty.
- Transit tab: packages is a plain string field with no package postfix auto-expansion logic. Duplicate bilty prevention exists.
- Queue (WarehouseTab): packages is a plain string, no auto-expand bale tab logic, no Received/Pending per-bale status.
- Inward tab: one `totalQty` field for whole bale. No per-item 'Total Qty in Bale' field. Distribution done via shopQty + godownQuants per item.
- History tab: bilty numbers are plain `<span>` elements with no click handler. No bilty journey panel exists.

## Requested Changes (Diff)

### Add
- **Transfer tab:** Standalone refresh/reset icon button (always visible, not just after transfer) that clears selectedSku and search so user can re-select a different item
- **Transit tab:** Package count field (numeric) in the Transit form. When packages > 1, instead of saving one entry, auto-create N entries with bilty postfix: `biltyX{N}(1)`, `biltyX{N}(2)`, etc. Each child entry inherits same item name, supplier, package number from the main form
- **Queue tab:** When a bilty with packages > 1 is entered/auto-filled from Transit, auto-expand into N sub-entries (tabs/rows). Each shows: unique bilty label (sola1011X5(1)...), item category, item name (editable per bale), and a Received/Pending status toggle. Saving: Received bales go to Queue as separate bilty entries, Pending bales go to Transit as separate bilty entries
- **Inward tab:** Permanent 'Total Qty in Bale' field placed after item name in the inward form. Validation: sum of ALL items' godown + shop distributions across the whole bale must equal this Total Qty in Bale value
- **History tab:** Bilty numbers become clickable. Clicking opens a side panel/modal showing the full journey: Transit (date + entered by), Queue (date + entered by), Inward (date + opened by), item name with sub-categories, total qty, and godown/shop distribution split

### Modify
- **Transfer tab:** Remove the post-transfer 'Transfer Another Item' button (replace with always-visible refresh icon near item search/selection area)
- **Inward tab:** Existing `totalQty` field renamed/repurposed to 'Total Qty in Bale'. Validation updated to check sum of ALL baleItems' (shopQty + all godownQuants) equals this field
- **Queue tab:** When packages > 1, the single form entry is replaced by the expanded bale tab UI

### Remove
- Post-transfer success banner with 'Transfer Another Item' button (replaced by always-visible refresh icon)
- Queue bale tab fields: stock to godown, stock to shop, qty per bale (not needed at queue stage — just track receipt)

## Implementation Plan
1. **Transfer tab:** Add a small RefreshCw icon button always visible next to the item search area. On click: reset selectedSku, search, qty, transferDone. Remove the post-transfer banner button (keep the success message but remove the button or simplify).
2. **Transit tab:** Add numeric `packageCount` field to form. In handleAdd: if packageCount > 1, generate N entries with bilty labels `{biltyNo}X{N}({i})` each with same supplier, itemName, itemCategory, packageCount. If packageCount is 1 or empty, save single entry as before. Keep duplicate bilty check (each generated label is unique).
3. **Queue tab:** Add `packageCount` to form state. When bilty auto-fills from Transit and packageCount > 1, show an expanded UI with N bale rows, each having a unique bilty label, item category (combo), item name (combo), and a Received/Pending toggle. On save: Received bales → pendingParcels (Queue), Pending bales → transitGoods (Transit) as unique entries.
4. **Inward tab:** Rename `totalQty` label to 'Total Qty in Bale'. Place after item name section. Validate sum of all baleItems shopQty + all godownQuants equals totalQty. Show per-item subtotal and bale-level total in the validation message.
5. **History tab:** Add `selectedBilty` state and panel. Make bilty `<span>` elements clickable with onClick. Build a lookup function that finds matching records in transitGoods, pendingParcels, and transactions (inward type) by biltyNo. Show the journey timeline in a modal/drawer with all requested fields including distribution.
