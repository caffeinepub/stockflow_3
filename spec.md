# StockFlow

## Current State
- Supplier and Transport fields in TransitTab and WarehouseTab are plain text inputs with no suggestions
- No combo box / autocomplete exists for these fields
- Supplier users (role='supplier') see the same full list as admin/staff
- Field Labels admin section supports rename, reorder, required toggle, and field type (text/combo/drop) -- but cannot add new custom fields or delete existing ones
- fieldTypes and fieldComboOptions are passed to SettingsTab only, not to TransitTab or WarehouseTab

## Requested Changes (Diff)

### Add
- A reusable `ComboInput` component: text input that shows a dropdown of matching existing options, allows typing a new value not in the list (freeform entry still works)
- Replace the supplier and transport plain text inputs in TransitTab and WarehouseTab with ComboInput
- Derive supplier options list from: all transitGoods supplierName values + all pendingParcels supplier values + all transactions (inward) supplier values -- deduplicated, for current business
- Derive transport options list from: all transitGoods transportName + pendingParcels transportName + transactions transportName -- deduplicated, for current business
- For supplier role users: filter both lists to only values that this user has previously entered (where addedBy === currentUser.username)
- Pass currentUser, transitGoods, pendingParcels, transactions to both tabs (most already passed)
- In SettingsTab Field Labels section: add an "Add Field" button per tab that creates a new custom field with a user-defined key and default label; add a delete (trash) button per field row that removes it from the tab's field list; system fields (the original TAB_FIELDS defaults) should show a warning if deleted but still allow it; custom fields added by admin are stored in a new `customTabFields` state

### Modify
- TransitTab: supplier and transport inputs become ComboInput; accept new props for option lists and currentUser role
- WarehouseTab: same as TransitTab
- App.tsx: derive and pass supplier/transport option lists to TransitTab and WarehouseTab; add customTabFields state
- SettingsTab: add delete button per field row; add "Add Field" button + name input below each tab's field list

### Remove
- Nothing removed

## Implementation Plan
1. Create `ComboInput` component in src/frontend/src/components/ComboInput.tsx -- text input with floating dropdown, filters by typed value, click to select, blur to close, always allows custom typed value
2. Modify TransitTab: replace supplier+transport inputs with ComboInput; add supplierOptions/transportOptions/currentUser props
3. Modify WarehouseTab: same
4. App.tsx: compute supplierOptions and transportOptions as deduplicated arrays from all records; pass to both tabs; add customTabFields state
5. SettingsTab: add delete button per field row in fieldlabels section; add Add Field UI below each tab's list; store custom fields in customTabFields prop
