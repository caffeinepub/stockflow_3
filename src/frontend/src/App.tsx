import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  BarChart2,
  Box,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Edit2,
  History,
  LayoutDashboard,
  LogOut,
  Navigation,
  Package,
  PackagePlus,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Settings,
  Share2,
  ShoppingCart,
  Trash2,
  Upload,
  User,
  Warehouse,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ================= TYPES ================= */
interface CategoryField {
  name: string;
  type: string;
  options?: string[];
}
interface Category {
  name: string;
  fields: CategoryField[];
}
interface Business {
  id: string;
  name: string;
}
interface AppUser {
  username: string;
  password: string;
  role: "admin" | "staff" | "supplier";
}
interface InventoryItem {
  sku: string;
  category: string;
  itemName: string;
  attributes: Record<string, string>;
  shop: number;
  godowns: Record<string, number>;
  saleRate: number;
  purchaseRate: number;
  businessId: string;
  minThreshold?: number;
}
interface TransitRecord {
  id: number;
  biltyNo: string;
  transportName: string;
  supplierName: string;
  itemName: string;
  packages: string;
  date: string;
  addedBy: string;
  businessId: string;
  customData: Record<string, string>;
  category?: string;
  itemCategory?: string;
}
interface PendingParcel {
  id: number;
  biltyNo: string;
  transportName: string;
  packages: string;
  dateReceived: string;
  arrivalDate?: string;
  businessId: string;
  customData: Record<string, string>;
  itemName?: string;
  category?: string;
  supplier?: string;
  itemCategory?: string;
}
interface Transaction {
  id: number;
  type: string;
  biltyNo?: string;
  businessId: string;
  date: string;
  user: string;
  transportName?: string;
  itemsCount?: number;
  sku?: string;
  itemName?: string;
  category?: string;
  notes?: string;
  fromLocation?: string;
  toLocation?: string;
  transferredBy?: string;
  subCategory?: string;
  totalQtyInBale?: number;
  baleItemsList?: {
    itemName: string;
    category: string;
    attributes: Record<string, string>;
    qty: number;
    shopQty?: number;
    godownQuants?: Record<string, number>;
    saleRate?: number;
    purchaseRate?: number;
  }[];
}
interface InwardRecord {
  id: number;
  biltyNo: string;
  dateOpened: string;
  openedBy: string;
  transport: string;
  baleItems: BaleItem[];
  businessId: string;
  createdAt: string;
}
interface ColumnDef {
  name: string;
  type: string;
}
interface CustomColumns {
  transit: ColumnDef[];
  warehouse: ColumnDef[];
  inward: ColumnDef[];
}
interface BaleItem {
  id: number;
  sku: string;
  category: string;
  itemName: string;
  attributes: Record<string, string>;
  shopQty: string;
  godownQuants: Record<string, string>;
  saleRate: string;
  purchaseRate: string;
  customData: Record<string, string>;
}

interface InwardSavedEntry {
  id: number;
  biltyNumber: string;
  baseNumber: string;
  packages: string;
  items: {
    category: string;
    itemName: string;
    qty: number;
    godownQty: number;
    shopQty: number;
    saleRate: number;
    purchaseRate: number;
    attributes: Record<string, string>;
  }[];
  savedBy: string;
  savedAt: string;
  transporter: string;
  supplier: string;
  businessId: string;
}

/* ================= CONSTANTS ================= */
const INITIAL_CATEGORIES: Category[] = [
  {
    name: "Safi",
    fields: [
      { name: "Size", type: "text" },
      { name: "Color", type: "select", options: ["black", "tiranga", "mix"] },
    ],
  },
  {
    name: "Lungi",
    fields: [
      {
        name: "Size",
        type: "select",
        options: ["2 mtr", "2.25 mtr", "2.5 mtr"],
      },
      {
        name: "Color",
        type: "select",
        options: ["plain white", "plain colour", "mix"],
      },
    ],
  },
  {
    name: "Napkin",
    fields: [
      { name: "Size", type: "select", options: ["14x21", "12x18", "16x24"] },
    ],
  },
];

/* ================= UTILITIES ================= */
const formatItemName = (name: string) => {
  if (!name) return "";
  const str = String(name).trim();
  if (str.length === 0) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getTotalGodownStock = (item: InventoryItem) => {
  if (!item || !item.godowns) return 0;
  return Object.values(item.godowns).reduce((a, b) => a + Number(b || 0), 0);
};

function BiltyInput({
  prefixOptions,
  prefix,
  setPrefix,
  number,
  setNumber,
  onSearch,
  disabled,
}: {
  prefixOptions?: string[];
  prefix: string;
  setPrefix: (v: string) => void;
  number: string;
  setNumber: (v: string) => void;
  onSearch?: (p: string, n: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
        Bilty Number *
      </p>
      <div className="flex gap-2">
        <select
          value={prefix}
          disabled={disabled}
          onChange={(e) => {
            setPrefix(e.target.value);
            if (onSearch) onSearch(e.target.value, number);
          }}
          className={`w-1/3 border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold uppercase ${disabled ? "bg-gray-100 opacity-50 cursor-not-allowed" : "bg-gray-50"}`}
        >
          {(prefixOptions || ["0"]).map((p) => (
            <option key={p} value={p}>
              {p === "0" ? "-" : p.toUpperCase()}
            </option>
          ))}
        </select>
        <input
          type="text"
          inputMode="numeric"
          value={number}
          onKeyDown={(e) => {
            const allowed = [
              "Backspace",
              "Delete",
              "ArrowLeft",
              "ArrowRight",
              "ArrowUp",
              "ArrowDown",
              "Tab",
              "Enter",
              "Home",
              "End",
            ];
            if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const numericOnly = e.target.value.replace(/[^0-9]/g, "");
            setNumber(numericOnly);
            if (onSearch) onSearch(prefix, numericOnly);
          }}
          disabled={disabled}
          className={`w-2/3 border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold ${disabled ? "bg-gray-100 opacity-50 cursor-not-allowed" : ""}`}
          placeholder="Numeric Part"
        />
      </div>
    </div>
  );
}

function DynamicFields({
  fields,
  values,
  onChange,
}: {
  fields?: ColumnDef[];
  values?: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  if (!fields || fields.length === 0) return null;
  return (
    <>
      {fields.map((col) => (
        <div key={col.name}>
          <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
            {col.name}
          </p>
          <input
            type={col.type || "text"}
            value={values?.[col.name] || ""}
            onChange={(e) => onChange(col.name, e.target.value)}
            className="w-full border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>
      ))}
    </>
  );
}

/* ================= DASHBOARD TAB ================= */
function DashboardTab({
  inventory,
  minStockThreshold,
  activeBusinessId,
  transactions,
  onItemClick,
  thresholdExcludedItems = [],
}: {
  inventory: Record<string, InventoryItem>;
  minStockThreshold: number;
  activeBusinessId: string;
  transactions: Transaction[];
  onItemClick?: (sku: string) => void;
  thresholdExcludedItems?: string[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const skus = Object.keys(inventory || {});
  const filteredSkus = skus.filter((sku) => {
    const item = inventory[sku];
    const matchesBusiness =
      !item.businessId || item.businessId === activeBusinessId;
    return (
      matchesBusiness &&
      `${item.itemName} ${item.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const grouped = filteredSkus.reduce<
    Record<string, (InventoryItem & { sku: string })[]>
  >((acc, sku) => {
    const item = inventory[sku];
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...item, sku });
    return acc;
  }, {});

  const lowStock = filteredSkus.filter((sku) => {
    if (thresholdExcludedItems.includes(sku)) return false;
    const item = inventory[sku];
    const threshold = item.minThreshold ?? minStockThreshold;
    return getTotalGodownStock(item) < threshold;
  });

  const shareWhatsApp = (item: InventoryItem) => {
    const text = `*Stock Update: ${item.category} - ${item.itemName}*\nShop: ${item.shop}\nGodown: ${getTotalGodownStock(item)}\nRate: ₹${item.saleRate}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in-down">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
          Stock Ledger
        </h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {lowStock.length > 0 && !searchTerm && (
        <div className="bg-red-50 border-2 border-red-200 p-5 rounded-3xl">
          <h3 className="text-red-800 font-black text-xs uppercase flex items-center gap-2 mb-4">
            <AlertTriangle size={16} /> Critical Stock Alerts ({lowStock.length}{" "}
            items)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map((sku) => {
              const item = inventory[sku];
              const threshold = item.minThreshold ?? minStockThreshold;
              const godownStock = getTotalGodownStock(item);
              const godownEntries = Object.entries(item.godowns || {}).filter(
                ([, v]) => Number(v) > 0,
              );
              return (
                <div
                  key={sku}
                  className="bg-white border-2 border-red-200 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-black text-red-800 text-sm">
                        {item.itemName}
                      </p>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                        {item.category}
                      </p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-lg text-[10px] font-black shrink-0">
                      {godownStock} LEFT
                    </span>
                  </div>
                  {Object.keys(item.attributes || {}).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {Object.entries(item.attributes).map(([k, v]) => (
                        <span
                          key={k}
                          className="text-[9px] bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded uppercase font-bold"
                        >
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-[10px] font-bold text-gray-500 space-y-0.5">
                    <p>
                      Threshold:{" "}
                      <span className="text-red-700 font-black">
                        {threshold}
                      </span>{" "}
                      | Godown:{" "}
                      <span className="text-red-700 font-black">
                        {godownStock}
                      </span>
                    </p>
                    {godownEntries.length > 0 && (
                      <p className="text-gray-400">
                        {godownEntries
                          .map(([g, v]) => `${g}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed text-gray-400">
          <Box className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-bold">No matching stock found</p>
        </div>
      ) : (
        Object.keys(grouped)
          .sort()
          .map((cat) => (
            <div
              key={cat}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-6"
            >
              <div className="bg-blue-600 px-6 py-3 flex justify-between items-center text-white">
                <h3 className="font-black uppercase text-xs tracking-widest">
                  {cat}
                </h3>
                <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full">
                  {grouped[cat].length} Variants
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[9px] font-black uppercase text-gray-400 border-b">
                    <tr>
                      <th className="px-6 py-3">Product Description</th>
                      <th className="px-6 py-3 text-center">Shop</th>
                      <th className="px-6 py-3 text-center">Godowns</th>
                      <th className="px-6 py-3 text-right">Rate (₹)</th>
                      <th className="px-6 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {grouped[cat].map((item) => {
                      const itemThreshold =
                        item.minThreshold ?? minStockThreshold;
                      const godownStock = getTotalGodownStock(item);
                      const isCritical = godownStock < itemThreshold;
                      return (
                        <tr
                          key={item.sku}
                          onClick={() => onItemClick?.(item.sku)}
                          onKeyUp={(e) =>
                            e.key === "Enter" && onItemClick?.(item.sku)
                          }
                          tabIndex={0}
                          className={`transition-colors cursor-pointer ${isCritical ? "bg-red-50 hover:bg-red-100/60" : "hover:bg-blue-50/30"}`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">
                              {item.itemName}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {Object.entries(item.attributes || {}).map(
                                ([k, v]) => (
                                  <span
                                    key={k}
                                    className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border uppercase font-bold"
                                  >
                                    {String(v)}
                                  </span>
                                ),
                              )}
                            </div>
                            {(() => {
                              // Fix 7: Show ALL bilty numbers for this item
                              const allInwardTxs = transactions
                                .filter(
                                  (tx) =>
                                    (!tx.businessId ||
                                      tx.businessId === activeBusinessId) &&
                                    tx.type === "INWARD" &&
                                    (tx.sku === item.sku ||
                                      (tx.itemName?.toLowerCase() ===
                                        item.itemName?.toLowerCase() &&
                                        tx.category === item.category) ||
                                      tx.baleItemsList?.some(
                                        (bi: {
                                          itemName?: string;
                                          category?: string;
                                        }) =>
                                          bi.itemName?.toLowerCase() ===
                                            item.itemName?.toLowerCase() &&
                                          bi.category === item.category,
                                      )),
                                )
                                .sort((a, b) =>
                                  (a.date || "").localeCompare(b.date || ""),
                                );
                              if (allInwardTxs.length === 0) return null;
                              const uniqueBiltyNos = [
                                ...new Set(
                                  allInwardTxs
                                    .map((tx) => tx.biltyNo)
                                    .filter(Boolean),
                                ),
                              ];
                              const firstTx = allInwardTxs[0];
                              return (
                                <div className="mt-1.5 space-y-0.5">
                                  <div className="flex flex-wrap gap-1">
                                    {uniqueBiltyNos.map((bn) => (
                                      <span
                                        key={bn}
                                        className="inline-flex items-center gap-1 text-[9px] font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100"
                                      >
                                        📦 {bn}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-[9px] text-gray-400 font-bold">
                                    First added{" "}
                                    {firstTx.date?.split("T")[0] ||
                                      firstTx.date}{" "}
                                    · {firstTx.user || "?"}
                                  </p>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 text-center font-black text-green-700 text-lg">
                            {Number(item.shop || 0)}
                          </td>
                          <td className="px-6 py-4 text-center font-black text-amber-700">
                            <div className="text-lg">
                              {getTotalGodownStock(item)}
                            </div>
                            <div className="text-[9px] text-gray-400 font-bold mt-0.5 text-left">
                              {Object.entries(item.godowns || {})
                                .filter(([, v]) => Number(v) > 0)
                                .map(([g, v]) => (
                                  <span key={g} className="block">
                                    {g}: {v}
                                  </span>
                                ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-blue-700 text-lg">
                            {Number(item.saleRate || 0)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => shareWhatsApp(item)}
                              className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                            >
                              <Share2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
      )}
    </div>
  );
}

/* ================= TRANSIT TAB ================= */
function TransitTab({
  transitGoods,
  setTransitGoods,
  biltyPrefixes,
  showNotification,
  currentUser,
  customColumns,
  setConfirmDialog,
  activeBusinessId,
  allTransitGoods: _allTransitGoods,
  categories,
  transportTracking,
  setMoveToQueueData,
  setActiveTabFromTransit,
  pendingParcels,
  transactions,
  inwardSaved,
  fieldLabels,
}: {
  transitGoods: TransitRecord[];
  setTransitGoods: React.Dispatch<React.SetStateAction<TransitRecord[]>>;
  biltyPrefixes: string[];
  showNotification: (m: string, t?: string) => void;
  currentUser: AppUser;
  customColumns: ColumnDef[];
  setConfirmDialog: (
    d: { message: string; onConfirm: () => void } | null,
  ) => void;
  activeBusinessId: string;
  allTransitGoods?: TransitRecord[];
  categories?: Category[];
  transportTracking?: Record<string, string>;
  setMoveToQueueData?: (d: TransitRecord | null) => void;
  setActiveTabFromTransit?: (t: string) => void;
  pendingParcels?: PendingParcel[];
  transactions?: Transaction[];
  inwardSaved?: InwardSavedEntry[];
  fieldLabels?: Record<string, Record<string, string>>;
}) {
  const _lbl = (key: string, def: string) => fieldLabels?.transit?.[key] || def;
  const [showForm, setShowForm] = useState(true);
  const [biltyPrefix, setBiltyPrefix] = useState(biltyPrefixes?.[0] || "0");
  const [biltyNumber, setBiltyNumber] = useState("");
  const [form, setForm] = useState({
    transportName: "",
    supplierName: "",
    itemName: "",
    itemCategory: "",
    packages: "",
    date: new Date().toISOString().split("T")[0],
    customData: {} as Record<string, string>,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [transitFilterMode, setTransitFilterMode] = useState<
    "daterange" | "days"
  >("daterange");
  const [transitMinDays, setTransitMinDays] = useState("");

  const downloadTemplate = () => {
    const headers =
      "Prefix,BiltyNumber,Transport,Supplier,ItemName,Packages,Date";
    const customHeaders = (customColumns || []).map((c) => c.name).join(",");
    const csvContent = `${
      headers + (customHeaders ? `,${customHeaders}` : "")
    }\nsola,12345,VRL,SupplierX,ItemA,10,2024-03-21`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transit_template.csv";
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split(/\r?\n/).filter((l) => l.trim());
      const newEntries: TransitRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols[1]) {
          const customData: Record<string, string> = {};
          for (const [idx, c] of (customColumns || []).entries()) {
            customData[c.name] = cols[7 + idx] || "";
          }
          newEntries.push({
            id: Date.now() + i,
            biltyNo:
              cols[0] === "0" || !cols[0] ? cols[1] : `${cols[0]}-${cols[1]}`,
            transportName: cols[2] || "",
            supplierName: cols[3] || "",
            itemName: cols[4] || "",
            packages: cols[5] || "",
            date: cols[6] || new Date().toISOString().split("T")[0],
            customData,
            addedBy: currentUser.username,
            businessId: activeBusinessId,
          });
        }
      }
      setTransitGoods((prev) => [...newEntries, ...prev]);
      showNotification(`Imported ${newEntries.length} records`, "success");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biltyNumber) return showNotification("Bilty number required", "error");
    const bNo =
      biltyPrefix === "0" ? biltyNumber : `${biltyPrefix}-${biltyNumber}`;
    const pkgCount = Number(form.packages) || 1;
    const isDupeTransit = (transitGoods || []).some(
      (g) =>
        (!g.businessId || g.businessId === activeBusinessId) &&
        g.biltyNo?.toLowerCase() === bNo.toLowerCase(),
    );
    if (isDupeTransit)
      return showNotification(
        `Bilty ${bNo} already exists in Transit!`,
        "error",
      );
    // Check if bilty exists in Queue
    const isDupeQueue = (pendingParcels || []).some(
      (p) =>
        (!p.businessId || p.businessId === activeBusinessId) &&
        (p.biltyNo?.toLowerCase() === bNo.toLowerCase() ||
          (p.biltyNo || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
            bNo.toLowerCase()),
    );
    if (isDupeQueue)
      return showNotification(`Bilty ${bNo} already exists in Queue!`, "error");
    // Check if bilty exists in Inward history
    const isDupeInward = (transactions || []).some(
      (t) =>
        t.type === "INWARD" &&
        (!t.businessId || t.businessId === activeBusinessId) &&
        (t.biltyNo?.toLowerCase() === bNo.toLowerCase() ||
          (t.biltyNo || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
            bNo.toLowerCase()),
    );
    if (isDupeInward)
      return showNotification(
        `Bilty ${bNo} has already been processed in Inward!`,
        "error",
      );
    // Check if bilty exists in Inward Saved
    const isDupeInwardSaved = (inwardSaved || []).some(
      (s) =>
        (!s.businessId || s.businessId === activeBusinessId) &&
        (s.biltyNumber?.toLowerCase() === bNo.toLowerCase() ||
          (s.biltyNumber || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
            bNo.toLowerCase() ||
          (s.baseNumber || "").toLowerCase() === bNo.toLowerCase()),
    );
    if (isDupeInwardSaved)
      return showNotification(
        `Bilty ${bNo} is already in Inward Saved!`,
        "error",
      );
    if (pkgCount > 1) {
      const newEntries: TransitRecord[] = [];
      for (let i = 1; i <= pkgCount; i++) {
        const label = `${bNo}X${pkgCount}(${i})`;
        const alreadyExists = (transitGoods || []).some(
          (g) =>
            (!g.businessId || g.businessId === activeBusinessId) &&
            g.biltyNo?.toLowerCase() === label.toLowerCase(),
        );
        const alreadyInQueue = (pendingParcels || []).some(
          (p) =>
            (!p.businessId || p.businessId === activeBusinessId) &&
            p.biltyNo?.toLowerCase() === label.toLowerCase(),
        );
        const alreadyInInward = (transactions || []).some(
          (t) =>
            t.type === "INWARD" &&
            (!t.businessId || t.businessId === activeBusinessId) &&
            t.biltyNo?.toLowerCase() === label.toLowerCase(),
        );
        if (!alreadyExists && !alreadyInQueue && !alreadyInInward) {
          newEntries.push({
            id: Date.now() + i,
            biltyNo: label,
            addedBy: currentUser.username,
            businessId: activeBusinessId,
            ...form,
            packages: String(pkgCount),
          });
        }
      }
      setTransitGoods((prev) => [...newEntries, ...prev]);
    } else {
      setTransitGoods((prev) => [
        {
          id: Date.now(),
          biltyNo: bNo,
          addedBy: currentUser.username,
          businessId: activeBusinessId,
          ...form,
        },
        ...prev,
      ]);
    }
    setShowForm(false);
    setBiltyNumber("");
    setForm({
      transportName: "",
      supplierName: "",
      itemName: "",
      itemCategory: "",
      packages: "",
      date: new Date().toISOString().split("T")[0],
      customData: {},
    });
    showNotification(
      pkgCount > 1
        ? `Saved ${pkgCount} bale entries to Transit`
        : "Saved Transit Entry",
      "success",
    );
  };

  let filtered = (transitGoods || []).filter((g) => {
    if (!(!g.businessId || g.businessId === activeBusinessId)) return false;
    // Supplier sees only own entries
    if (currentUser.role === "supplier" && g.addedBy !== currentUser.username)
      return false;
    if (
      searchTerm &&
      !g.biltyNo?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !g.transportName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !g.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (transitFilterMode === "daterange") {
      if (filterDateFrom && g.date < filterDateFrom) return false;
      if (filterDateTo && g.date > filterDateTo) return false;
    } else if (transitFilterMode === "days" && transitMinDays) {
      const daysInTransit = g.date
        ? Math.ceil((Date.now() - new Date(g.date).getTime()) / 86400000)
        : 0;
      if (daysInTransit < Number(transitMinDays)) return false;
    }
    return true;
  });
  filtered = [...filtered].sort((a, b) =>
    sortOrder === "desc"
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date),
  );

  return (
    <div className="space-y-6 animate-fade-in-down">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
          <Navigation className="text-indigo-600" /> Transit
        </h2>
        <div className="flex flex-wrap gap-2">
          {currentUser.role !== "supplier" && (
            <>
              <button
                type="button"
                onClick={downloadTemplate}
                className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-gray-50"
              >
                <Download size={14} /> Template
              </button>
              <label
                htmlFor="transit-csv-upload"
                className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-indigo-100 transition-colors"
              >
                <Upload size={14} /> Import CSV
              </label>
              <input
                id="transit-csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </>
          )}
          {currentUser.role !== "staff" && (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-xs uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95"
            >
              {showForm ? "Cancel" : "Log New"}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-xl space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BiltyInput
              prefixOptions={biltyPrefixes}
              prefix={biltyPrefix}
              setPrefix={setBiltyPrefix}
              number={biltyNumber}
              setNumber={setBiltyNumber}
            />
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Transport
              </p>
              <input
                type="text"
                value={form.transportName}
                onChange={(e) =>
                  setForm({ ...form, transportName: e.target.value })
                }
                className="w-full border rounded-xl p-2.5 font-bold bg-gray-50 focus:bg-white outline-none"
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Supplier
              </p>
              <input
                type="text"
                value={form.supplierName}
                onChange={(e) =>
                  setForm({ ...form, supplierName: e.target.value })
                }
                className="w-full border rounded-xl p-2.5 font-bold bg-gray-50 focus:bg-white outline-none"
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Item Category
              </p>
              <select
                value={form.itemCategory}
                onChange={(e) =>
                  setForm({ ...form, itemCategory: e.target.value })
                }
                className="w-full border rounded-xl p-2.5 font-bold bg-gray-50 focus:bg-white outline-none"
              >
                <option value="">All Categories</option>
                {(categories || []).map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Item Info
              </p>
              <input
                type="text"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className="w-full border rounded-xl p-2.5 font-bold bg-gray-50 focus:bg-white outline-none"
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Packages
              </p>
              <input
                type="number"
                value={form.packages}
                onChange={(e) => setForm({ ...form, packages: e.target.value })}
                className="w-full border rounded-xl p-2.5 font-bold bg-gray-50 focus:bg-white outline-none"
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                Bilty Date
              </p>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-xl p-2.5 font-bold bg-gray-50 focus:bg-white outline-none"
              />
            </div>
            <DynamicFields
              fields={customColumns}
              values={form.customData}
              onChange={(k, v) =>
                setForm({ ...form, customData: { ...form.customData, [k]: v } })
              }
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-transform active:scale-95 text-xs"
          >
            Save Transit Record
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter Bilty, Transport, Item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTransitFilterMode("daterange")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${transitFilterMode === "daterange" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}
          >
            Date Range
          </button>
          <button
            type="button"
            onClick={() => setTransitFilterMode("days")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${transitFilterMode === "days" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}
          >
            Days in Transit
          </button>
        </div>
        {transitFilterMode === "daterange" ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-400 text-xs font-bold">–</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Min Days ≥</span>
            <input
              type="number"
              min="0"
              value={transitMinDays}
              onChange={(e) => setTransitMinDays(e.target.value)}
              placeholder="e.g. 5"
              className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500 w-24"
            />
          </div>
        )}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        {(filterDateFrom || filterDateTo || transitMinDays) && (
          <button
            type="button"
            onClick={() => {
              setFilterDateFrom("");
              setFilterDateTo("");
              setTransitMinDays("");
            }}
            className="text-xs text-red-500 font-bold bg-red-50 px-3 py-2 rounded-xl"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white border border-dashed rounded-[2rem] text-gray-400 font-bold">
            No records found.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                    In Transit
                  </span>
                  <h3 className="font-black text-xl text-gray-900 uppercase mt-1 tracking-tight">
                    {item.biltyNo}
                  </h3>
                </div>
                <div className="flex gap-2 items-center">
                  {(() => {
                    const trackUrl =
                      transportTracking && item.transportName
                        ? transportTracking[item.transportName] ||
                          transportTracking[
                            item.transportName?.toLowerCase()
                          ] ||
                          null
                        : null;
                    return trackUrl ? (
                      <a
                        href={trackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-200 transition-colors"
                      >
                        Track Live
                      </a>
                    ) : null;
                  })()}
                  {currentUser.role !== "supplier" && setMoveToQueueData && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoveToQueueData(item);
                        setActiveTabFromTransit?.("warehouse");
                      }}
                      className="bg-amber-100 text-amber-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-amber-200 transition-colors"
                    >
                      → Queue
                    </button>
                  )}
                  {currentUser.role !== "supplier" && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDialog({
                          message: "Remove from transit?",
                          onConfirm: () =>
                            setTransitGoods((prev) =>
                              prev.filter((g) => g.id !== item.id),
                            ),
                        })
                      }
                      className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                <p>
                  From:{" "}
                  <span className="text-gray-700">
                    {item.supplierName || "-"}
                  </span>
                </p>
                <p>
                  Transport:{" "}
                  <span className="text-gray-700">
                    {item.transportName || "-"}
                  </span>
                </p>
                <p>
                  Category:{" "}
                  <span className="text-gray-700">
                    {item.category || item.itemCategory || "-"}
                  </span>
                </p>
                <p>
                  Item:{" "}
                  <span className="text-gray-700">{item.itemName || "-"}</span>
                </p>
                <p>
                  Date:{" "}
                  <span className="text-gray-700">{item.date || "-"}</span>
                </p>
              </div>
              {item.date && (
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${Math.ceil((Date.now() - new Date(item.date).getTime()) / 86400000) > 7 ? "bg-orange-100 text-orange-700" : "bg-indigo-50 text-indigo-700"}`}
                  >
                    🚚{" "}
                    {Math.ceil(
                      (Date.now() - new Date(item.date).getTime()) / 86400000,
                    )}{" "}
                    days in transit
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ================= WAREHOUSE TAB ================= */
function WarehouseTab({
  pendingParcels,
  setPendingParcels,
  setOpeningParcel,
  setActiveTab,
  biltyPrefixes,
  customColumns,
  showNotification,
  setConfirmDialog,
  activeBusinessId,
  transportTracking,
  existingQueueBiltyNos,
  transitGoods,
  setTransitGoods,
  categories,
  inventory,
  moveToQueueData,
  clearMoveToQueueData,
  transactions,
  inwardSaved: _inwardSavedQueue,
  fieldLabels,
}: {
  pendingParcels: PendingParcel[];
  setPendingParcels: React.Dispatch<React.SetStateAction<PendingParcel[]>>;
  setOpeningParcel: (p: PendingParcel | null) => void;
  setActiveTab: (t: string) => void;
  biltyPrefixes: string[];
  customColumns: ColumnDef[];
  showNotification: (m: string, t?: string) => void;
  setConfirmDialog: (
    d: { message: string; onConfirm: () => void } | null,
  ) => void;
  activeBusinessId: string;
  transportTracking?: Record<string, string>;
  existingQueueBiltyNos?: string[];
  transitGoods?: TransitRecord[];
  setTransitGoods?: React.Dispatch<React.SetStateAction<TransitRecord[]>>;
  categories?: Category[];
  inventory?: Record<string, InventoryItem>;
  moveToQueueData?: TransitRecord | null;
  clearMoveToQueueData?: () => void;
  transactions?: Transaction[];
  inwardSaved?: InwardSavedEntry[];
  fieldLabels?: Record<string, Record<string, string>>;
}) {
  const _lbl = (key: string, def: string) =>
    fieldLabels?.warehouse?.[key] || def;
  const [biltyPrefix, setBiltyPrefix] = useState(biltyPrefixes?.[0] || "0");
  const [biltyNumber, setBiltyNumber] = useState("");
  const [form, setForm] = useState({
    transportName: "",
    supplier: "",
    itemCategory: "",
    itemName: "",
    packages: "",
    dateReceived: new Date().toISOString().split("T")[0],
    arrivalDate: new Date().toISOString().split("T")[0],
    customData: {} as Record<string, string>,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterItemName, setFilterItemName] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [queueFilterMode, setQueueFilterMode] = useState<"daterange" | "days">(
    "daterange",
  );
  const [queueMinDays, setQueueMinDays] = useState("");
  const [baleRows, setBaleRows] = useState<
    {
      biltyLabel: string;
      itemCategory: string;
      itemName: string;
      status: "received" | "pending";
    }[]
  >([]);

  // Generate bale rows when biltyNumber or packages changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on package/bilty change
  useEffect(() => {
    const bNo =
      biltyPrefix === "0" ? biltyNumber : `${biltyPrefix}-${biltyNumber}`;
    const pkgCount = Number(form.packages) || 0;
    if (biltyNumber && pkgCount > 1) {
      const rows = Array.from({ length: pkgCount }, (_, i) => {
        const label = `${bNo}X${pkgCount}(${i + 1})`;
        const labelLower = label.toLowerCase();
        // Skip bales already in Queue (pendingParcels)
        const inQueue = pendingParcels.some(
          (p) =>
            p.biltyNo?.toLowerCase() === labelLower &&
            (!p.businessId || p.businessId === activeBusinessId),
        );
        // Skip bales already processed in Inward (transactions)
        const inInward = (transactions || []).some(
          (t) =>
            t.type === "INWARD" &&
            t.biltyNo?.toLowerCase() === labelLower &&
            (!t.businessId || t.businessId === activeBusinessId),
        );
        if (inQueue || inInward) return null;
        return {
          biltyLabel: label,
          itemCategory: form.itemCategory,
          itemName: form.itemName,
          status: "received" as const,
        };
      }).filter(Boolean) as {
        biltyLabel: string;
        itemCategory: string;
        itemName: string;
        status: "received" | "pending";
      }[];
      setBaleRows(rows);
    } else {
      setBaleRows([]);
    }
  }, [biltyNumber, biltyPrefix, form.packages]);

  // Auto-fill from moveToQueueData when "Move to Queue" is clicked from Transit
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally only runs on moveToQueueData
  useEffect(() => {
    if (!moveToQueueData) return;
    const biltyStr = (moveToQueueData.biltyNo || "").replace(
      /X\d+\(\d+\)$/i,
      "",
    );
    const pkgFromPostfix = (() => {
      const m = (moveToQueueData.biltyNo || "").match(/X(\d+)\(\d+\)$/i);
      return m ? m[1] : null;
    })();
    const dashIdx = biltyStr.lastIndexOf("-");
    if (dashIdx > 0) {
      const prefix = biltyStr.slice(0, dashIdx);
      const num = biltyStr.slice(dashIdx + 1);
      if (biltyPrefixes.includes(prefix)) {
        setBiltyPrefix(prefix);
        setBiltyNumber(num);
      } else {
        setBiltyPrefix("0");
        setBiltyNumber(biltyStr);
      }
    } else {
      setBiltyPrefix("0");
      setBiltyNumber(biltyStr);
    }
    setForm((prev) => ({
      ...prev,
      transportName: moveToQueueData.transportName || prev.transportName,
      supplier: moveToQueueData.supplierName || prev.supplier,
      itemCategory:
        moveToQueueData.itemCategory ||
        moveToQueueData.category ||
        prev.itemCategory,
      itemName: moveToQueueData.itemName || prev.itemName,
      packages: moveToQueueData.packages || pkgFromPostfix || prev.packages,
    }));
    clearMoveToQueueData?.();
  }, [moveToQueueData]);

  // Auto-fill from Transit when bilty matches (search by base bilty, extract package count from postfix)
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on bilty change
  useEffect(() => {
    if (!biltyNumber || !transitGoods) return;
    const bNo =
      biltyPrefix === "0" ? biltyNumber : `${biltyPrefix}-${biltyNumber}`;
    const transitMatch = (transitGoods || []).find(
      (g) =>
        (!g.businessId || g.businessId === activeBusinessId) &&
        // Match exact bilty OR match by stripping postfix from transit entry
        (g.biltyNo?.toLowerCase() === bNo.toLowerCase() ||
          (g.biltyNo || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
            bNo.toLowerCase()),
    );
    if (transitMatch) {
      // Extract package count from postfix (e.g. sola1011X5(1) -> 5)
      const postfixMatch = (transitMatch.biltyNo || "").match(
        /X(\d+)\(\d+\)$/i,
      );
      const extractedPkg = postfixMatch
        ? postfixMatch[1]
        : transitMatch.packages || "";
      setForm((prev) => ({
        ...prev,
        transportName: transitMatch.transportName || prev.transportName,
        supplier: transitMatch.supplierName || prev.supplier,
        itemCategory:
          transitMatch.itemCategory ||
          transitMatch.category ||
          prev.itemCategory,
        itemName: transitMatch.itemName || prev.itemName,
        packages: extractedPkg || prev.packages,
      }));
      showNotification("Auto-filled from Transit entry.", "success");
    }
  }, [biltyNumber, biltyPrefix]);

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biltyNumber) return showNotification("Bilty number required", "error");
    const bNo =
      biltyPrefix === "0" ? biltyNumber : `${biltyPrefix}-${biltyNumber}`;
    const queueBiltyList = existingQueueBiltyNos ?? [];
    const pkgCount = Number(form.packages) || 1;

    if (pkgCount > 1 && baleRows.length > 0) {
      // Save received bales to Queue, pending bales to Transit
      const receivedBales = baleRows.filter((r) => r.status === "received");
      const pendingBales = baleRows.filter((r) => r.status === "pending");
      // Check for duplicates in Queue, inwardHistory, and INWARD transactions
      const inwardTxBiltySet = new Set(
        (transactions || [])
          .filter(
            (t) =>
              t.type === "INWARD" &&
              (!t.businessId || t.businessId === activeBusinessId),
          )
          .map((t) => (t.biltyNo || "").toLowerCase()),
      );
      const inwardBiltySet = new Set([
        ...(existingQueueBiltyNos ?? []).map((b) => b.toLowerCase()),
        ...inwardTxBiltySet,
      ]);
      const dupLabels = receivedBales
        .filter((r) => inwardBiltySet.has(r.biltyLabel.toLowerCase()))
        .map((r) => r.biltyLabel);
      if (dupLabels.length > 0) {
        showNotification(
          `Duplicate bales blocked: ${dupLabels.join(", ")}`,
          "error",
        );
      }
      const safeReceivedBales = receivedBales.filter(
        (r) => !inwardBiltySet.has(r.biltyLabel.toLowerCase()),
      );
      setPendingParcels((prev) => [
        ...safeReceivedBales.map((r, i) => ({
          id: Date.now() + i,
          biltyNo: r.biltyLabel,
          businessId: activeBusinessId,
          transportName: form.transportName,
          supplier: form.supplier,
          itemCategory: r.itemCategory,
          itemName: r.itemName,
          packages: String(pkgCount),
          dateReceived: form.dateReceived,
          arrivalDate: form.arrivalDate,
          customData: form.customData,
        })),
        ...prev,
      ]);
      if (setTransitGoods) {
        const allBaleLabels = new Set(
          baleRows.map((r) => r.biltyLabel.toLowerCase()),
        );
        setTransitGoods((prev) => {
          // Remove ALL transit entries that match the base bilty OR any postfix variant
          const cleaned = prev.filter((g) => {
            const gLower = (g.biltyNo || "").toLowerCase();
            const gBase = gLower.replace(/x\d+\(\d+\)$/i, "");
            if (gLower === bNo.toLowerCase()) return false;
            if (gBase === bNo.toLowerCase()) return false;
            if (allBaleLabels.has(gLower)) return false;
            return true;
          });
          // Add back only the pending bales (not yet received)
          const newPendingEntries = pendingBales.map((r, i) => ({
            id: Date.now() + 1000 + i,
            biltyNo: r.biltyLabel,
            businessId: activeBusinessId,
            transportName: form.transportName,
            supplierName: form.supplier,
            itemCategory: r.itemCategory,
            itemName: r.itemName,
            packages: String(pkgCount),
            date: form.arrivalDate,
            addedBy: "Queue",
            customData: form.customData,
          }));
          return [...newPendingEntries, ...cleaned];
        });
      }
      setBaleRows([]);
      setBiltyNumber("");
      setForm({
        transportName: "",
        supplier: "",
        itemCategory: "",
        itemName: "",
        packages: "",
        dateReceived: new Date().toISOString().split("T")[0],
        arrivalDate: new Date().toISOString().split("T")[0],
        customData: {},
      });
      showNotification(
        `${safeReceivedBales.length} received, ${pendingBales.length} pending`,
        "success",
      );
      return;
    }

    if (queueBiltyList.some((b) => b.toLowerCase() === bNo.toLowerCase())) {
      return showNotification(`Bilty ${bNo} already exists in Queue!`, "error");
    }
    // Strict cross-tab uniqueness check (single-package path)
    {
      const baseBilty = bNo.replace(/X\d+\(\d+\)$/i, "").toLowerCase();
      const inTransitCheck = (transitGoods || []).some(
        (g) =>
          (!g.businessId || g.businessId === activeBusinessId) &&
          (g.biltyNo?.toLowerCase() === bNo.toLowerCase() ||
            (g.biltyNo || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
              baseBilty),
      );
      const inInwardCheck = (transactions || []).some(
        (t) =>
          t.type === "INWARD" &&
          (!t.businessId || t.businessId === activeBusinessId) &&
          (t.biltyNo || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
            baseBilty,
      );
      const inInwardSavedCheck = (_inwardSavedQueue || []).some(
        (s) =>
          (!s.businessId || s.businessId === activeBusinessId) &&
          ((s.biltyNumber || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
            baseBilty ||
            (s.baseNumber || "").toLowerCase() === baseBilty),
      );
      if (inTransitCheck)
        return showNotification(
          `Bilty ${bNo} already exists in Transit!`,
          "error",
        );
      if (inInwardCheck)
        return showNotification(
          `Bilty ${bNo} has already been processed in Inward!`,
          "error",
        );
      if (inInwardSavedCheck)
        return showNotification(
          `Bilty ${bNo} is already in Inward Saved!`,
          "error",
        );
    }
    setPendingParcels((prev) => [
      {
        id: Date.now(),
        biltyNo: bNo,
        businessId: activeBusinessId,
        ...form,
      },
      ...prev,
    ]);
    // Remove matching bilty from transit (both exact and postfixed variants)
    if (setTransitGoods) {
      setTransitGoods((prev) =>
        prev.filter((g) => {
          const gBase = (g.biltyNo || "")
            .replace(/X\d+\(\d+\)$/i, "")
            .toLowerCase()
            .trim();
          return (
            gBase !== bNo.toLowerCase() &&
            g.biltyNo?.toLowerCase() !== bNo.toLowerCase()
          );
        }),
      );
    }
    setBiltyNumber("");
    setForm({
      transportName: "",
      supplier: "",
      itemCategory: "",
      itemName: "",
      packages: "",
      dateReceived: new Date().toISOString().split("T")[0],
      arrivalDate: new Date().toISOString().split("T")[0],
      customData: {},
    });
    showNotification("Logged to Queue", "success");
  };

  let filtered = (pendingParcels || []).filter((p) => {
    if (!(!p.businessId || p.businessId === activeBusinessId)) return false;
    if (
      searchTerm &&
      !p.biltyNo?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !p.transportName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    const pDate = p.arrivalDate || p.dateReceived;
    if (queueFilterMode === "daterange") {
      if (filterDateFrom && pDate < filterDateFrom) return false;
      if (filterDateTo && pDate > filterDateTo) return false;
    } else if (queueFilterMode === "days" && queueMinDays) {
      const daysInQueue = pDate
        ? Math.ceil((Date.now() - new Date(pDate).getTime()) / 86400000)
        : 0;
      if (daysInQueue < Number(queueMinDays)) return false;
    }
    if (filterCategory && (p.itemCategory || p.category) !== filterCategory)
      return false;
    if (
      filterItemName &&
      !p.itemName?.toLowerCase().includes(filterItemName.toLowerCase())
    )
      return false;
    return true;
  });
  filtered = [...filtered].sort((a, b) => {
    const da = a.arrivalDate || a.dateReceived;
    const db = b.arrivalDate || b.dateReceived;
    return sortOrder === "desc" ? db.localeCompare(da) : da.localeCompare(db);
  });

  return (
    <div className="space-y-6 animate-fade-in-down">
      <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2 border-b pb-4">
        <Warehouse className="text-amber-600" /> Queue
      </h2>
      <form
        onSubmit={handleLog}
        className="bg-white p-6 rounded-[2rem] border border-amber-100 shadow-lg space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BiltyInput
            prefixOptions={biltyPrefixes}
            prefix={biltyPrefix}
            setPrefix={setBiltyPrefix}
            number={biltyNumber}
            setNumber={setBiltyNumber}
          />
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Transport
            </p>
            <input
              type="text"
              value={form.transportName}
              onChange={(e) =>
                setForm({ ...form, transportName: e.target.value })
              }
              className="w-full border rounded-xl p-2.5 outline-none font-bold bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Supplier
            </p>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="w-full border rounded-xl p-2.5 outline-none font-bold bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Item Category
            </p>
            <select
              value={form.itemCategory}
              onChange={(e) =>
                setForm({ ...form, itemCategory: e.target.value })
              }
              className="w-full border rounded-xl p-2.5 outline-none font-bold bg-gray-50 focus:bg-white"
            >
              <option value="">Select Category</option>
              {(categories || []).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <ItemNameCombo
              category={form.itemCategory}
              value={form.itemName}
              onChange={(val) => setForm({ ...form, itemName: val })}
              inventory={inventory || {}}
              activeBusinessId={activeBusinessId}
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Total Packages *
            </p>
            <input
              type="number"
              required
              value={form.packages}
              onChange={(e) => setForm({ ...form, packages: e.target.value })}
              className="w-full border rounded-xl p-2.5 outline-none font-bold bg-gray-50 focus:bg-white"
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Arrival Date
            </p>
            <input
              type="date"
              value={form.arrivalDate}
              onChange={(e) =>
                setForm({ ...form, arrivalDate: e.target.value })
              }
              className="w-full border rounded-xl p-2.5 outline-none font-bold bg-gray-50 focus:bg-white"
            />
          </div>
          <DynamicFields
            fields={customColumns}
            values={form.customData}
            onChange={(k, v) =>
              setForm({ ...form, customData: { ...form.customData, [k]: v } })
            }
          />
        </div>
        <button
          type="submit"
          className="w-full bg-amber-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl hover:bg-amber-700 transition-transform active:scale-95"
        >
          {baleRows.length > 0
            ? `Save ${baleRows.length} Bales`
            : "Log Arrival to Queue"}
        </button>
      </form>

      {baleRows.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-amber-200 shadow-lg overflow-hidden animate-fade-in-down">
          <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-black uppercase tracking-widest text-xs">
              Bale Breakdown ({baleRows.length} bales)
            </h3>
            <span className="text-amber-200 text-[10px] font-bold">
              Mark each bale as Received or Pending
            </span>
          </div>
          <div className="divide-y">
            {baleRows.map((row, idx) => (
              <div
                key={row.biltyLabel}
                className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
              >
                <span className="text-xs font-black text-gray-700 uppercase w-40 shrink-0">
                  {row.biltyLabel}
                </span>
                <select
                  value={row.itemCategory}
                  onChange={(e) => {
                    const updated = [...baleRows];
                    updated[idx] = {
                      ...updated[idx],
                      itemCategory: e.target.value,
                    };
                    setBaleRows(updated);
                  }}
                  className="border rounded-xl p-2 text-xs font-bold bg-gray-50 outline-none flex-1"
                >
                  <option value="">Category</option>
                  {(categories || []).map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ItemNameCombo
                  category={row.itemCategory}
                  value={row.itemName}
                  onChange={(val) => {
                    const updated = [...baleRows];
                    updated[idx] = { ...updated[idx], itemName: val };
                    setBaleRows(updated);
                  }}
                  inventory={inventory || {}}
                  activeBusinessId={activeBusinessId}
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...baleRows];
                    updated[idx] = {
                      ...updated[idx],
                      status:
                        row.status === "received" ? "pending" : "received",
                    };
                    setBaleRows(updated);
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 transition-colors ${
                    row.status === "received"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-orange-100 text-orange-700 border border-orange-300"
                  }`}
                >
                  {row.status === "received" ? "✓ Received" : "⏳ Pending"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Bilty or Transport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setQueueFilterMode("daterange")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${queueFilterMode === "daterange" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500"}`}
          >
            Date Range
          </button>
          <button
            type="button"
            onClick={() => setQueueFilterMode("days")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${queueFilterMode === "days" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500"}`}
          >
            Days in Queue
          </button>
        </div>
        {queueFilterMode === "daterange" ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none"
            />
            <span className="text-gray-400 text-xs">–</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Min Days ≥</span>
            <input
              type="number"
              min="0"
              value={queueMinDays}
              onChange={(e) => setQueueMinDays(e.target.value)}
              placeholder="e.g. 3"
              className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none w-24"
            />
          </div>
        )}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        {(filterDateFrom ||
          filterDateTo ||
          filterCategory ||
          filterItemName ||
          queueMinDays) && (
          <button
            type="button"
            onClick={() => {
              setFilterDateFrom("");
              setFilterDateTo("");
              setFilterCategory("");
              setFilterItemName("");
              setQueueMinDays("");
            }}
            className="text-xs text-red-500 font-bold bg-red-50 px-3 py-2 rounded-xl"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-amber-400 min-w-[150px]"
        >
          <option value="">All Categories</option>
          {(categories || []).map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by item name..."
            value={filterItemName}
            onChange={(e) => setFilterItemName(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 font-bold text-xs bg-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((p) => {
          const trackUrl =
            transportTracking && p.transportName
              ? transportTracking[p.transportName] ||
                transportTracking[p.transportName?.toLowerCase()]
              : null;
          return (
            <div
              key={p.id}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest w-fit mb-1">
                    Queue
                  </span>
                  <h3 className="font-black text-xl text-gray-900 uppercase mt-1 tracking-tight">
                    {p.biltyNo}
                  </h3>
                  <div className="text-[10px] font-bold text-gray-400 mt-1 space-y-0.5">
                    {p.transportName && (
                      <p>
                        Transport:{" "}
                        <span className="text-gray-700">{p.transportName}</span>
                      </p>
                    )}
                    {p.supplier && (
                      <p>
                        Supplier:{" "}
                        <span className="text-gray-700">{p.supplier}</span>
                      </p>
                    )}
                    {p.itemCategory && (
                      <p>
                        Category:{" "}
                        <span className="text-gray-700">{p.itemCategory}</span>
                      </p>
                    )}
                    {p.itemName && (
                      <p>
                        Item:{" "}
                        <span className="text-gray-700">{p.itemName}</span>
                      </p>
                    )}
                    {p.packages && (
                      <p>
                        Packages:{" "}
                        <span className="text-gray-700">{p.packages}</span>
                      </p>
                    )}
                    {(p.arrivalDate || p.dateReceived) && (
                      <p>
                        Arrived:{" "}
                        <span className="text-gray-700">
                          {p.arrivalDate || p.dateReceived}
                        </span>
                      </p>
                    )}
                    {(p.arrivalDate || p.dateReceived) && (
                      <p>
                        Days in Queue:{" "}
                        <span
                          className={`font-black ${Math.ceil((Date.now() - new Date(p.arrivalDate || p.dateReceived || "").getTime()) / 86400000) > 7 ? "text-orange-600" : "text-gray-700"}`}
                        >
                          {Math.ceil(
                            (Date.now() -
                              new Date(
                                p.arrivalDate || p.dateReceived || "",
                              ).getTime()) /
                              86400000,
                          )}{" "}
                          days
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    {trackUrl && (
                      <a
                        href={trackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase"
                      >
                        Track
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setOpeningParcel(p);
                        setActiveTab("inward");
                      }}
                      className="bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-md"
                    >
                      Open Bale
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDialog({
                          message: "Remove from Queue?",
                          onConfirm: () =>
                            setPendingParcels((prev) =>
                              prev.filter((x) => x.id !== p.id),
                            ),
                        })
                      }
                      className="text-red-400 p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= ITEM NAME COMBO ================= */
function ItemNameCombo({
  category,
  value,
  onChange,
  inventory,
  activeBusinessId,
}: {
  category: string;
  value: string;
  onChange: (val: string) => void;
  inventory: Record<string, InventoryItem>;
  activeBusinessId: string;
}) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  const suggestions = Array.from(
    new Set(
      Object.values(inventory)
        .filter(
          (i) =>
            (!category || i.category === category) &&
            (!i.businessId || i.businessId === activeBusinessId) &&
            (!inputVal ||
              i.itemName.toLowerCase().includes(inputVal.toLowerCase())),
        )
        .map((i) => i.itemName),
    ),
  );

  return (
    <div className="relative">
      <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
        Item Name *
      </p>
      <input
        required
        type="text"
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={category ? "Type or select item name" : "Type item name"}
        className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 left-0 right-0 bg-white border rounded-xl shadow-2xl mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((name) => (
            <button
              type="button"
              key={name}
              onMouseDown={() => {
                onChange(name);
                setInputVal(name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm font-bold border-b last:border-0"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= INWARD TAB ================= */
function InwardTab({
  inventory,
  categories,
  updateStock,
  setTransactions,
  showNotification,
  currentUser,
  generateSku,
  openingParcel,
  setOpeningParcel,
  pendingParcels,
  setPendingParcels,
  transitGoods,
  setTransitGoods,
  godowns,
  biltyPrefixes,
  customColumns,
  activeBusinessId,
  transactions,
  setInventory,
  setConfirmDialog,
  setInwardSaved,
  inwardSaved,
  fieldLabels,
}: {
  inventory: Record<string, InventoryItem>;
  categories: Category[];
  updateStock: (
    sku: string,
    details: Partial<InventoryItem>,
    shopDelta: number,
    godownDelta: number,
    targetGodown?: string,
  ) => void;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  showNotification: (m: string, t?: string) => void;
  currentUser: AppUser;
  generateSku: (
    cat: string,
    name: string,
    attrs: Record<string, string>,
    rate: string,
    bizId: string,
  ) => string;
  openingParcel: PendingParcel | null;
  setOpeningParcel: (p: PendingParcel | null) => void;
  pendingParcels: PendingParcel[];
  setPendingParcels: React.Dispatch<React.SetStateAction<PendingParcel[]>>;
  transitGoods: TransitRecord[];
  setTransitGoods: React.Dispatch<React.SetStateAction<TransitRecord[]>>;
  godowns: string[];
  biltyPrefixes: string[];
  customColumns: ColumnDef[];
  activeBusinessId: string;
  transactions: Transaction[];
  setInventory: React.Dispatch<
    React.SetStateAction<Record<string, InventoryItem>>
  >;
  setConfirmDialog: (
    d: { message: string; onConfirm: () => void } | null,
  ) => void;
  setInwardSaved?: React.Dispatch<React.SetStateAction<InwardSavedEntry[]>>;
  inwardSaved?: InwardSavedEntry[];
  fieldLabels?: Record<string, Record<string, string>>;
}) {
  const _lbl = (key: string, def: string) => fieldLabels?.inward?.[key] || def;
  const [biltyPrefix, setBiltyPrefix] = useState(biltyPrefixes?.[0] || "0");
  const [biltyNumber, setBiltyNumber] = useState("");
  const [baleItems, setBaleItems] = useState<BaleItem[]>([]);
  const [isNewItemMode, setIsNewItemMode] = useState(false);
  const [itemForm, setItemForm] = useState({
    category: "",
    itemName: "",
    attributes: {} as Record<string, string>,
    shopQty: "",
    godownQuants: {} as Record<string, string>,
    saleRate: "",
    purchaseRate: "",
    customData: {} as Record<string, string>,
  });
  const [matchedDetails, setMatchedDetails] = useState<
    TransitRecord | PendingParcel | null
  >(null);
  const [isDirectEntry, setIsDirectEntry] = useState(false);
  const [directReference, setDirectReference] = useState("");
  const [dateOpened, setDateOpened] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [openedBy, setOpenedBy] = useState(currentUser.username);
  const [totalQty, setTotalQty] = useState("");
  const [_filterDateFrom, _setFilterDateFrom] = useState("");
  const [_filterDateTo, _setFilterDateTo] = useState("");
  const [_filterName, _setFilterName] = useState("");
  const [queueBiltySearch, setQueueBiltySearch] = useState("");
  const [showQueueDropdown, setShowQueueDropdown] = useState(false);
  const [inwardPackages, setInwardPackages] = useState("1");
  const [biltyLocked, setBiltyLocked] = useState(false);
  const [perBaleData, setPerBaleData] = useState<
    {
      label: string;
      items: BaleItem[];
      totalQty: string;
      received: boolean;
      notReceivedTarget: "transit" | "queue";
      locked?: boolean;
      lockedBy?: string;
      lockedDate?: string;
      pendingSaved?: boolean;
      pendingSavedTarget?: string;
    }[]
  >([]);
  const [activeBaleIdx, setActiveBaleIdx] = useState(0);
  const [perBaleFormData, setPerBaleFormData] = useState<
    Record<
      number,
      {
        category: string;
        itemName: string;
        isNewItem: boolean;
        newItemName: string;
        totalQty: string;
        shopQty: string;
        godownQuants: Record<string, string>;
        saleRate: string;
        purchaseRate: string;
        attributes: Record<string, string>;
      }
    >
  >({});

  const getPerBaleForm = (idx: number) =>
    perBaleFormData[idx] || {
      category: "",
      itemName: "",
      isNewItem: false,
      newItemName: "",
      totalQty: "",
      shopQty: "",
      godownQuants: {},
      saleRate: "",
      purchaseRate: "",
      attributes: {},
    };

  const setPerBaleForm = (
    idx: number,
    patch: Partial<ReturnType<typeof getPerBaleForm>>,
  ) => {
    setPerBaleFormData((prev) => ({
      ...prev,
      [idx]: { ...getPerBaleForm(idx), ...patch },
    }));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only re-run on bilty/package change
  useEffect(() => {
    const bNo =
      biltyPrefix === "0" ? biltyNumber : `${biltyPrefix}-${biltyNumber}`;
    const pkgCount = Number(inwardPackages) || 1;
    if (biltyNumber) {
      setPerBaleData(
        Array.from({ length: pkgCount }, (_, i) => {
          const label = pkgCount === 1 ? bNo : `${bNo}X${pkgCount}(${i + 1})`;
          const existingTx = transactions.find(
            (tx) =>
              tx.type === "INWARD" &&
              (!tx.businessId || tx.businessId === activeBusinessId) &&
              tx.biltyNo?.toLowerCase() === label.toLowerCase(),
          );
          const alreadyOpened = !!existingTx;
          return {
            label,
            items:
              existingTx?.baleItemsList?.map(
                (
                  bi: {
                    category?: string;
                    itemName?: string;
                    attributes?: Record<string, string>;
                    shopQty?: number;
                    godownQuants?: Record<string, number>;
                    saleRate?: number;
                    purchaseRate?: number;
                  },
                  idx: number,
                ) => ({
                  id: idx,
                  sku: "",
                  category: bi.category || "",
                  itemName: bi.itemName || "",
                  attributes: bi.attributes || {},
                  shopQty: String(bi.shopQty || 0),
                  godownQuants: Object.fromEntries(
                    Object.entries(bi.godownQuants || {}).map(([g, v]) => [
                      g,
                      String(v),
                    ]),
                  ),
                  saleRate: String(bi.saleRate || 0),
                  purchaseRate: String(bi.purchaseRate || 0),
                  customData: {},
                }),
              ) || ([] as BaleItem[]),
            totalQty: existingTx
              ? String(existingTx.totalQtyInBale || existingTx.itemsCount || "")
              : "",
            received: true,
            notReceivedTarget: "transit" as const,
            locked: alreadyOpened,
            lockedBy: existingTx?.user || "",
            lockedDate:
              existingTx?.date?.split("T")[0] || existingTx?.date || "",
          };
        }),
      );
      setActiveBaleIdx(0);
    } else {
      setPerBaleData([]);
    }
  }, [biltyNumber, biltyPrefix, inwardPackages]);

  // Reset isNewItemMode when category changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on category change
  useEffect(() => {
    setIsNewItemMode(false);
  }, [itemForm.category]);

  const handleLookup = (pPrefix: string, pNumber: string) => {
    const bNo = pPrefix === "0" ? pNumber : `${pPrefix}-${pNumber}`;
    const searchStr = bNo.toLowerCase();
    // Check if already in Inward Saved
    const baseBiltyCheck = bNo.replace(/X\d+\(\d+\)$/i, "").toLowerCase();
    const alreadySaved = (inwardSaved || []).some(
      (s) =>
        (!s.businessId || s.businessId === activeBusinessId) &&
        ((s.biltyNumber || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
          baseBiltyCheck ||
          (s.baseNumber || "").toLowerCase() === baseBiltyCheck),
    );
    if (alreadySaved) {
      showNotification(
        `Bilty ${bNo} is already fully saved in Inward Saved!`,
        "error",
      );
      return;
    }
    // Fix 4: Search by base bilty (strip postfix from entries) for Transit, Queue, and inwardHistory
    const transitMatch = transitGoods.find(
      (g) =>
        g.biltyNo?.toLowerCase() === searchStr ||
        (g.biltyNo || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
          searchStr,
    );
    const queueMatch = pendingParcels.find(
      (p) =>
        p.biltyNo?.toLowerCase() === searchStr ||
        (p.biltyNo || "").replace(/X\d+\(\d+\)$/i, "").toLowerCase() ===
          searchStr,
    );
    const match = queueMatch || transitMatch;
    if (match) {
      setMatchedDetails(match);
      setBiltyLocked(true);
      // Extract package count from postfix or packages field
      const postfixMatch = ((match as TransitRecord).biltyNo || "").match(
        /X(\d+)\(\d+\)$/i,
      );
      const extractedPkg = postfixMatch
        ? postfixMatch[1]
        : (match as PendingParcel).packages ||
          (match as TransitRecord).packages ||
          "";
      setItemForm((prev) => ({
        ...prev,
        itemName: (match as TransitRecord).itemName || prev.itemName,
        category:
          (match as PendingParcel).itemCategory ||
          (match as TransitRecord).itemCategory ||
          (match as TransitRecord).category ||
          prev.category ||
          "",
      }));
      if (extractedPkg && Number(extractedPkg) > 1)
        setInwardPackages(extractedPkg);
      showNotification("Found Bilty! Data auto-filled.", "success");
    } else {
      setMatchedDetails(null);
      setBiltyLocked(false);
    }
  };

  // Auto-fill when Open Bale is clicked in Queue
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on openingParcel change
  useEffect(() => {
    if (!openingParcel) return;
    const biltyStr = openingParcel.biltyNo || "";
    const dashIdx = biltyStr.lastIndexOf("-");
    if (dashIdx > 0) {
      const prefix = biltyStr.slice(0, dashIdx);
      const num = biltyStr.slice(dashIdx + 1);
      if (biltyPrefixes.includes(prefix)) {
        setBiltyPrefix(prefix);
        setBiltyNumber(num);
      } else {
        setBiltyPrefix("0");
        setBiltyNumber(biltyStr);
      }
    } else {
      setBiltyPrefix("0");
      setBiltyNumber(biltyStr);
    }
    setMatchedDetails(openingParcel as unknown as PendingParcel);
    setBiltyLocked(true);
    setItemForm((prev) => ({
      ...prev,
      itemName: (openingParcel as PendingParcel).itemName || prev.itemName,
      category:
        (openingParcel as PendingParcel).itemCategory ||
        (openingParcel as PendingParcel).category ||
        prev.category,
    }));
    setQueueBiltySearch(biltyStr);
    const pkgs = (openingParcel as PendingParcel).packages;
    if (pkgs && Number(pkgs) > 1) setInwardPackages(pkgs);
  }, [openingParcel]);

  useEffect(() => {
    if (!itemForm.itemName) return;
    const term = itemForm.itemName.toLowerCase().trim();
    const existing = Object.values(inventory).find(
      (i) =>
        i.itemName?.toLowerCase() === term &&
        (!i.businessId || i.businessId === activeBusinessId),
    );
    if (existing) {
      setItemForm((prev) => {
        if (
          prev.saleRate === String(existing.saleRate) &&
          prev.category === existing.category
        )
          return prev;
        return {
          ...prev,
          category: prev.category || existing.category,
          saleRate: String(existing.saleRate) || "",
          purchaseRate: String(existing.purchaseRate) || "",
        };
      });
    }
  }, [itemForm.itemName, inventory, activeBusinessId]);

  const handleFinalSave = () => {
    if (baleItems.length === 0) return;
    // Check duplicate INWARD bilty
    if (!isDirectEntry) {
      const bNo =
        biltyPrefix === "0" ? biltyNumber : `${biltyPrefix}-${biltyNumber}`;
      const alreadyProcessed = transactions.some(
        (tx) =>
          tx.type === "INWARD" &&
          (!tx.businessId || tx.businessId === activeBusinessId) &&
          tx.biltyNo?.toLowerCase() === bNo.toLowerCase(),
      );
      if (alreadyProcessed) {
        showNotification(
          `Bilty ${bNo} has already been processed in Inward!`,
          "error",
        );
        return;
      }
    }
    // Validate totalQty if set
    if (totalQty) {
      const savedTotal = baleItems.reduce(
        (sum, i) =>
          sum +
          (Number(i.shopQty) || 0) +
          Object.values(i.godownQuants).reduce((a, b) => a + Number(b || 0), 0),
        0,
      );
      if (savedTotal !== Number(totalQty)) {
        showNotification(
          `Total qty mismatch: distributed ${savedTotal} but bale total is ${totalQty}. Please match before saving.`,
          "error",
        );
        return;
      }
    }
    // Items are created by updateStock; no pre-creation needed
    const newItemsToCreate = baleItems.filter((item) => {
      if (!item.itemName || !item.category) return false;
      return !Object.values(inventory).some(
        (inv) =>
          (!inv.businessId || inv.businessId === activeBusinessId) &&
          inv.category === item.category &&
          inv.itemName.toLowerCase() === item.itemName.toLowerCase(),
      );
    });
    const doFinalSave = () => {
      for (const item of baleItems) {
        if (Number(item.shopQty) > 0)
          updateStock(
            item.sku,
            {
              ...item,
              saleRate: Number(item.saleRate),
              purchaseRate: Number(item.purchaseRate),
            },
            Number(item.shopQty),
            0,
            "Main Godown",
          );
        for (const [g, q] of Object.entries(item.godownQuants)) {
          if (Number(q) > 0)
            updateStock(
              item.sku,
              {
                ...item,
                saleRate: Number(item.saleRate),
                purchaseRate: Number(item.purchaseRate),
              },
              0,
              Number(q),
              g,
            );
        }
      }
    };
    if (newItemsToCreate.length > 0) {
      const names = newItemsToCreate
        .map((i) => `${i.itemName} (${i.category})`)
        .join(", ");
      setConfirmDialog({
        message: `Create new inventory items?
${names}`,
        onConfirm: () => {
          doFinalSave();
        },
      });
    } else {
      doFinalSave();
    }
    const bNo = isDirectEntry
      ? `DIRECT-${directReference || Date.now().toString().slice(-4)}`
      : biltyPrefix === "0"
        ? biltyNumber
        : `${biltyPrefix}-${biltyNumber}`;
    const type = isDirectEntry ? "DIRECT_STOCK" : "INWARD";
    setTransactions((prev) => [
      {
        id: Date.now(),
        type,
        biltyNo: bNo,
        businessId: activeBusinessId,
        date: new Date().toISOString().split("T")[0],
        user: currentUser.username,
        transportName: isDirectEntry
          ? "Direct Entry"
          : (matchedDetails as TransitRecord)?.transportName || "",
        itemsCount: totalQty
          ? Number(totalQty)
          : baleItems.reduce(
              (sum, i) =>
                sum +
                (Number(i.shopQty) || 0) +
                Object.values(i.godownQuants).reduce(
                  (a, b) => a + Number(b || 0),
                  0,
                ),
              0,
            ),
        totalQtyInBale: totalQty ? Number(totalQty) : undefined,
        baleItemsList: baleItems.map((i) => ({
          itemName: i.itemName,
          category: i.category,
          attributes: { ...i.attributes },
          shopQty: Number(i.shopQty) || 0,
          godownQuants: Object.fromEntries(
            Object.entries(i.godownQuants).map(([g, q]) => [g, Number(q) || 0]),
          ),
          saleRate: Number(i.saleRate) || 0,
          purchaseRate: Number(i.purchaseRate) || 0,
          qty:
            (Number(i.shopQty) || 0) +
            Object.values(i.godownQuants).reduce(
              (a, b) => a + Number(b || 0),
              0,
            ),
        })),
      },
      ...prev,
    ]);
    if (!isDirectEntry) {
      if (matchedDetails) {
        setTransitGoods((prev) =>
          prev.filter((g) => g.id !== matchedDetails.id),
        );
        setPendingParcels((prev) =>
          prev.filter((p) => p.id !== matchedDetails.id),
        );
      } else {
        setTransitGoods((prev) =>
          prev.filter((g) => g.biltyNo?.toLowerCase() !== bNo.toLowerCase()),
        );
        setPendingParcels((prev) =>
          prev.filter((p) => p.biltyNo?.toLowerCase() !== bNo.toLowerCase()),
        );
      }
      // Also save to inwardSaved
      if (setInwardSaved) {
        setInwardSaved((prev) => [
          {
            id: Date.now(),
            biltyNumber: bNo,
            baseNumber: bNo.replace(/X\d+\(\d+\)$/i, ""),
            packages: "1",
            items: baleItems.map((i) => ({
              category: i.category,
              itemName: i.itemName,
              qty:
                (Number(i.shopQty) || 0) +
                Object.values(i.godownQuants).reduce(
                  (a, b) => a + Number(b || 0),
                  0,
                ),
              shopQty: Number(i.shopQty) || 0,
              godownQty: Object.values(i.godownQuants).reduce(
                (a, b) => a + Number(b || 0),
                0,
              ),
              saleRate: Number(i.saleRate) || 0,
              purchaseRate: Number(i.purchaseRate) || 0,
              attributes: i.attributes || {},
            })),
            savedBy: currentUser.username,
            savedAt: new Date().toISOString(),
            transporter: (matchedDetails as TransitRecord)?.transportName || "",
            supplier:
              (matchedDetails as TransitRecord)?.supplierName ||
              (matchedDetails as PendingParcel)?.supplier ||
              "",
            businessId: activeBusinessId,
          },
          ...prev,
        ]);
      }
    }
    setBaleItems([]);
    setBiltyNumber("");
    setMatchedDetails(null);
    setBiltyLocked(false);
    setOpeningParcel(null);
    setDirectReference("");
    showNotification(
      isDirectEntry
        ? "Direct Stock Saved"
        : "Inward Processed & Removed from Queues",
    );
  };

  const addItemToBale = (e: React.FormEvent) => {
    e.preventDefault();
    const sku = generateSku(
      itemForm.category,
      itemForm.itemName,
      itemForm.attributes,
      itemForm.saleRate,
      activeBusinessId,
    );
    setBaleItems((prev) => [...prev, { ...itemForm, sku, id: Date.now() }]);
    setItemForm({
      ...itemForm,
      itemName: "",
      shopQty: "",
      godownQuants: {},
      customData: {},
    });
  };

  const selectedCat = categories.find((c) => c.name === itemForm.category);
  const showItemForm = biltyNumber.length > 0 || openingParcel || isDirectEntry;

  return (
    <div className="space-y-6 animate-fade-in-down">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
          <PlusCircle className="text-green-600" /> Process Inward
        </h2>
        <button
          type="button"
          data-ocid="inward.secondary_button"
          onClick={() => {
            setBiltyNumber("");
            setBiltyPrefix(biltyPrefixes?.[0] || "0");
            setInwardPackages("1");
            setBiltyLocked(false);
            setMatchedDetails(null);
            setIsDirectEntry(false);
            setDirectReference("");
            setPerBaleData([]);
            setPerBaleFormData({});
            setActiveBaleIdx(0);
            setBaleItems([]);
            setItemForm({
              category: "",
              itemName: "",
              attributes: {},
              shopQty: "",
              godownQuants: {},
              saleRate: "",
              purchaseRate: "",
              customData: {},
            });
            setQueueBiltySearch("");
            setTotalQty("");
            setOpeningParcel(null);
            showNotification("Form cleared", "info");
          }}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          title="Clear form / New entry"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Queue Bilty Dropdown */}
      {!isDirectEntry && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 relative">
          <p className="text-[10px] font-black uppercase text-amber-800 block mb-2">
            Pick from Arrival Queue
          </p>
          <input
            type="text"
            value={queueBiltySearch}
            onChange={(e) => {
              setQueueBiltySearch(e.target.value);
              setShowQueueDropdown(true);
            }}
            onFocus={() => setShowQueueDropdown(true)}
            placeholder="Search queue bilty..."
            className="w-full border border-amber-200 rounded-xl p-3 font-bold bg-white outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          {showQueueDropdown &&
            (() => {
              const queueEntries = pendingParcels
                .filter(
                  (p) =>
                    (!p.businessId || p.businessId === activeBusinessId) &&
                    (!queueBiltySearch ||
                      p.biltyNo
                        ?.toLowerCase()
                        .includes(queueBiltySearch.toLowerCase())),
                )
                .slice(0, 6);
              const transitEntries = transitGoods
                .filter(
                  (g) =>
                    (!g.businessId || g.businessId === activeBusinessId) &&
                    (!queueBiltySearch ||
                      g.biltyNo
                        ?.toLowerCase()
                        .includes(queueBiltySearch.toLowerCase())),
                )
                .slice(0, 4);
              const totalEntries = queueEntries.length + transitEntries.length;
              return (
                <div className="absolute z-20 left-0 right-0 mx-4 bg-white border rounded-2xl shadow-2xl mt-1 max-h-56 overflow-y-auto">
                  {queueEntries.map((p) => (
                    <button
                      type="button"
                      key={`q-${p.id}`}
                      onClick={() => {
                        setMatchedDetails(p);
                        setQueueBiltySearch(p.biltyNo);
                        setShowQueueDropdown(false);
                        setOpeningParcel(p);
                        const parts = p.biltyNo.split("-");
                        if (parts.length >= 2) {
                          const prefix = parts.slice(0, -1).join("-");
                          const num = parts[parts.length - 1];
                          if (biltyPrefixes.includes(prefix)) {
                            setBiltyPrefix(prefix);
                            setBiltyNumber(num);
                          } else {
                            setBiltyPrefix("0");
                            setBiltyNumber(p.biltyNo);
                          }
                        } else {
                          setBiltyPrefix("0");
                          setBiltyNumber(p.biltyNo);
                        }
                        setItemForm((prev) => ({
                          ...prev,
                          category:
                            p.itemCategory || p.category || prev.category || "",
                          itemName: p.itemName || prev.itemName || "",
                        }));
                        if (p.packages && Number(p.packages) > 1)
                          setInwardPackages(p.packages);
                        showNotification(
                          "Queue entry selected! Fields auto-filled.",
                          "success",
                        );
                      }}
                      className="w-full text-left p-3 hover:bg-amber-50 cursor-pointer border-b last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase">
                          Queue
                        </span>
                        <p className="font-black text-sm">{p.biltyNo}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        {p.transportName} · {p.packages} pkgs ·{" "}
                        {p.arrivalDate || p.dateReceived}
                      </p>
                      {(p.supplier || p.itemCategory || p.itemName) && (
                        <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                          {[p.supplier, p.itemCategory, p.itemName]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </button>
                  ))}
                  {transitEntries.map((g) => (
                    <button
                      type="button"
                      key={`t-${g.id}`}
                      onClick={() => {
                        const fakeParcel: PendingParcel = {
                          id: g.id,
                          biltyNo: g.biltyNo,
                          transportName: g.transportName,
                          packages: g.packages,
                          dateReceived: g.date,
                          arrivalDate: g.date,
                          businessId: g.businessId,
                          customData: g.customData || {},
                          itemName: g.itemName,
                          category: g.category || g.itemCategory,
                          supplier: g.supplierName,
                          itemCategory: g.itemCategory || g.category,
                        };
                        setMatchedDetails(fakeParcel);
                        setQueueBiltySearch(g.biltyNo);
                        setShowQueueDropdown(false);
                        const parts = g.biltyNo.split("-");
                        if (parts.length >= 2) {
                          const prefix = parts.slice(0, -1).join("-");
                          const num = parts[parts.length - 1];
                          if (biltyPrefixes.includes(prefix)) {
                            setBiltyPrefix(prefix);
                            setBiltyNumber(num);
                          } else {
                            setBiltyPrefix("0");
                            setBiltyNumber(g.biltyNo);
                          }
                        } else {
                          setBiltyPrefix("0");
                          setBiltyNumber(g.biltyNo);
                        }
                        setItemForm((prev) => ({
                          ...prev,
                          category:
                            g.itemCategory || g.category || prev.category || "",
                          itemName: g.itemName || prev.itemName || "",
                        }));
                        if (g.packages && Number(g.packages) > 1)
                          setInwardPackages(g.packages);
                        showNotification(
                          "Transit entry selected! Fields auto-filled.",
                          "success",
                        );
                      }}
                      className="w-full text-left p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase">
                          Transit
                        </span>
                        <p className="font-black text-sm">{g.biltyNo}</p>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        {g.transportName} · {g.packages} pkgs · {g.date}
                      </p>
                      {(g.supplierName || g.itemCategory || g.itemName) && (
                        <p className="text-[10px] text-indigo-700 font-bold mt-0.5">
                          {[g.supplierName, g.itemCategory, g.itemName]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </button>
                  ))}
                  {totalEntries === 0 && (
                    <p className="p-3 text-xs text-gray-400 font-bold">
                      No matching entries found
                    </p>
                  )}
                </div>
              );
            })()}
        </div>
      )}

      <div className="bg-white p-6 rounded-[2.5rem] border border-blue-100 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-black text-gray-800 uppercase text-[10px] tracking-widest">
            Bilty Connect
          </h3>
          <button
            type="button"
            onClick={() => {
              setIsDirectEntry(!isDirectEntry);
              setBiltyNumber("");
              setMatchedDetails(null);
              setBiltyLocked(false);
            }}
            className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl uppercase tracking-widest hover:bg-blue-100 transition-colors"
          >
            {isDirectEntry ? "Use Bilty Queue" : "Direct / Opening Stock"}
          </button>
        </div>
        {isDirectEntry ? (
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mt-2">
            <p className="text-[10px] font-black uppercase text-blue-800 ml-1">
              Reference Note (Optional)
            </p>
            <input
              type="text"
              placeholder="e.g. Existing Godown Stock"
              value={directReference}
              onChange={(e) => setDirectReference(e.target.value)}
              className="w-full border rounded-xl p-3 font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500 mt-2"
            />
          </div>
        ) : (
          <>
            <div className="flex gap-2 items-end mt-2 flex-wrap">
              <BiltyInput
                prefixOptions={biltyPrefixes}
                prefix={biltyPrefix}
                setPrefix={setBiltyPrefix}
                number={biltyNumber}
                setNumber={setBiltyNumber}
                onSearch={handleLookup}
                disabled={biltyLocked}
              />
              <div className="min-w-[120px]">
                <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Packages
                </p>
                <input
                  type="number"
                  min="1"
                  value={inwardPackages}
                  disabled={biltyLocked}
                  onChange={(e) => setInwardPackages(e.target.value || "1")}
                  className={`w-full border rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] ${biltyLocked ? "bg-gray-100 opacity-50 cursor-not-allowed" : "bg-gray-50 focus:bg-white"}`}
                />
              </div>
            </div>
            {biltyLocked && (
              <button
                type="button"
                onClick={() => {
                  setBiltyLocked(false);
                  setMatchedDetails(null);
                }}
                className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl uppercase tracking-widest hover:bg-orange-100 transition-colors mt-1"
              >
                🔓 Change Bilty
              </button>
            )}
            {matchedDetails && (
              <div className="bg-green-50 text-green-700 p-3 rounded-xl border border-green-200 text-xs font-bold mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={16} /> Record connected.
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] mt-1">
                  {(matchedDetails as TransitRecord).transportName && (
                    <p>
                      Transport:{" "}
                      <b>{(matchedDetails as TransitRecord).transportName}</b>
                    </p>
                  )}
                  {(matchedDetails as PendingParcel).supplier && (
                    <p>
                      Supplier:{" "}
                      <b>{(matchedDetails as PendingParcel).supplier}</b>
                    </p>
                  )}
                  {((matchedDetails as PendingParcel).itemCategory ||
                    (matchedDetails as TransitRecord).category) && (
                    <p>
                      Category:{" "}
                      <b>
                        {(matchedDetails as PendingParcel).itemCategory ||
                          (matchedDetails as TransitRecord).category}
                      </b>
                    </p>
                  )}
                  {((matchedDetails as PendingParcel).itemName ||
                    (matchedDetails as TransitRecord).itemName) && (
                    <p>
                      Item:{" "}
                      <b>
                        {(matchedDetails as PendingParcel).itemName ||
                          (matchedDetails as TransitRecord).itemName}
                      </b>
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Multi-Bale Section when packages > 1 */}
      {Number(inwardPackages) >= 1 && perBaleData.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-blue-100 shadow-xl overflow-hidden animate-fade-in-down">
          <div className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-black uppercase tracking-widest text-xs">
              Multi-Bale Processing ({perBaleData.length} Bales)
            </h3>
          </div>
          {/* Bale Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide border-b bg-gray-50">
            {perBaleData.map((bale, idx) => (
              <button
                key={bale.label}
                type="button"
                onClick={() => {
                  setActiveBaleIdx(idx);
                  setItemForm((prev) => ({
                    ...prev,
                    itemName: "",
                    shopQty: "",
                    godownQuants: {},
                    attributes: {},
                  }));
                }}
                className={`px-4 py-3 text-[10px] font-black uppercase shrink-0 transition-colors border-r last:border-r-0 ${
                  activeBaleIdx === idx
                    ? bale.locked
                      ? "bg-gray-500 text-white"
                      : "bg-blue-600 text-white"
                    : bale.locked
                      ? "bg-gray-100 text-gray-400"
                      : bale.received
                        ? "bg-white text-gray-600 hover:bg-blue-50"
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                }`}
              >
                {bale.locked ? "🔒 " : ""}
                {bale.label.split("(").pop()?.replace(")", "") || idx + 1}
                {bale.items.length > 0 && (
                  <span className="ml-1 bg-white/30 px-1 rounded-full">
                    {bale.items.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Active Bale */}
          {(() => {
            const bale = perBaleData[activeBaleIdx];
            if (!bale) return null;
            if (bale.locked) {
              return (
                <div className="p-6">
                  <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <h4 className="font-black text-lg text-gray-700">
                      {bale.label}
                    </h4>
                    <p className="text-sm font-bold text-gray-500 mt-1">
                      {bale.pendingSaved
                        ? "Saved as Not Received on"
                        : "Already opened on"}{" "}
                      <span className="text-gray-700">{bale.lockedDate}</span>{" "}
                      by{" "}
                      <span className="text-gray-700">
                        {bale.lockedBy || "unknown"}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">
                      {bale.pendingSaved
                        ? `Bale transferred to ${bale.pendingSavedTarget || "transit/queue"} as Not Received. Select another bale tab.`
                        : "This bale is already in inventory. Select another bale tab to continue."}
                    </p>
                    {bale.items.length > 0 && (
                      <div className="mt-4 text-left space-y-1">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">
                          Items in this bale:
                        </p>
                        {bale.totalQty && (
                          <div className="text-xs font-bold text-blue-700 bg-blue-50 rounded-xl px-3 py-2 border border-blue-200 mb-2">
                            Total Bale Qty: {bale.totalQty}
                          </div>
                        )}
                        {bale.items.map((it, i) => {
                          const itemQty =
                            (Number(it.shopQty) || 0) +
                            Object.values(it.godownQuants || {}).reduce(
                              (a, b) => a + Number(b || 0),
                              0,
                            );
                          return (
                            <div
                              key={`${it.itemName}-${i}`}
                              className="text-xs text-gray-600 bg-white rounded-xl px-3 py-2 border"
                            >
                              <span className="font-bold">
                                {it.category} · {it.itemName}
                              </span>
                              {itemQty > 0 && (
                                <span className="ml-2 text-green-700 font-black">
                                  Qty: {itemQty}
                                </span>
                              )}
                              {Number(it.shopQty) > 0 && (
                                <span className="ml-1 text-indigo-600">
                                  (Shop: {it.shopQty}
                                </span>
                              )}
                              {Object.entries(it.godownQuants || {})
                                .filter(([, q]) => Number(q) > 0)
                                .map(([g, q]) => (
                                  <span key={g} className="ml-1 text-gray-500">
                                    {g}: {q}
                                  </span>
                                ))}
                              {Number(it.shopQty) > 0 && <span>)</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">
                      Bale Label
                    </p>
                    <h4 className="font-black text-lg text-gray-900">
                      {bale.label}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      Status:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...perBaleData];
                        updated[activeBaleIdx] = {
                          ...updated[activeBaleIdx],
                          received: !bale.received,
                        };
                        setPerBaleData(updated);
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                        bale.received
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-orange-100 text-orange-700 border border-orange-300"
                      }`}
                    >
                      {bale.received ? "✓ Received" : "⏳ Not Received"}
                    </button>
                  </div>
                </div>
                {!bale.received && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase text-orange-800">
                      Save undelivered bale to:
                    </p>
                    <div className="flex gap-3">
                      {(["transit", "queue"] as const).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            const updated = [...perBaleData];
                            updated[activeBaleIdx] = {
                              ...updated[activeBaleIdx],
                              notReceivedTarget: loc,
                            };
                            setPerBaleData(updated);
                          }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${
                            bale.notReceivedTarget === loc
                              ? loc === "transit"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-amber-600 text-white border-amber-600"
                              : "bg-white text-gray-600 border-gray-300"
                          }`}
                        >
                          {loc === "transit" ? "→ Transit" : "→ Queue"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {bale.received && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase text-blue-800 ml-1 mb-2">
                        Total Qty in this Bale
                      </p>
                      <input
                        type="number"
                        value={bale.totalQty}
                        onChange={(e) => {
                          const updated = [...perBaleData];
                          updated[activeBaleIdx] = {
                            ...updated[activeBaleIdx],
                            totalQty: e.target.value,
                          };
                          setPerBaleData(updated);
                        }}
                        placeholder="Enter total qty"
                        className="w-full border border-blue-300 rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      {bale.totalQty &&
                        (() => {
                          const dist = bale.items.reduce(
                            (s, i) =>
                              s +
                              (Number(i.shopQty) || 0) +
                              Object.values(i.godownQuants).reduce(
                                (a, b) => a + Number(b || 0),
                                0,
                              ),
                            0,
                          );
                          const exp = Number(bale.totalQty);
                          return (
                            <p
                              className={`text-[10px] font-black mt-2 ${dist === exp ? "text-green-700" : "text-orange-600"}`}
                            >
                              {dist === exp
                                ? `✓ ${dist}/${exp}`
                                : `⚠ ${dist}/${exp} — add items to match`}
                            </p>
                          );
                        })()}
                    </div>
                    {/* Items in this bale */}
                    {bale.items.length > 0 && (
                      <div className="bg-gray-50 rounded-2xl border overflow-hidden">
                        <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase">
                            Items ({bale.items.length})
                          </span>
                        </div>
                        <table className="w-full text-xs">
                          <tbody className="divide-y">
                            {bale.items.map((item, iIdx) => (
                              <tr key={item.id}>
                                <td className="px-4 py-3 font-bold">
                                  {item.itemName}{" "}
                                  <span className="text-gray-400">
                                    ({item.category})
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-black text-center">
                                  {(Number(item.shopQty) || 0) +
                                    Object.values(item.godownQuants).reduce(
                                      (a, b) => a + Number(b || 0),
                                      0,
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...perBaleData];
                                      updated[activeBaleIdx] = {
                                        ...updated[activeBaleIdx],
                                        items: updated[
                                          activeBaleIdx
                                        ].items.filter((_, i) => i !== iIdx),
                                      };
                                      setPerBaleData(updated);
                                    }}
                                    className="text-red-400 p-1.5 bg-red-50 rounded-lg"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* Inline per-bale item form */}
                    {(() => {
                      const bf = getPerBaleForm(activeBaleIdx);
                      const bfCat = categories.find(
                        (c) => c.name === bf.category,
                      );
                      const _effectiveItemName = bf.isNewItem
                        ? bf.newItemName
                        : bf.itemName;
                      return (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                          <p className="text-[10px] font-black uppercase text-blue-800 tracking-widest">
                            Add Item to This Bale
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                                Category *
                              </p>
                              <select
                                value={bf.category}
                                onChange={(e) =>
                                  setPerBaleForm(activeBaleIdx, {
                                    category: e.target.value,
                                    itemName: "",
                                    newItemName: "",
                                    attributes: {},
                                  })
                                }
                                className="w-full border rounded-xl p-2.5 font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                  <option key={c.name} value={c.name}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-black uppercase text-gray-500">
                                  Item Name *
                                </p>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={bf.isNewItem}
                                    onChange={(e) =>
                                      setPerBaleForm(activeBaleIdx, {
                                        isNewItem: e.target.checked,
                                        itemName: "",
                                        newItemName: "",
                                      })
                                    }
                                    className="w-3 h-3 accent-blue-600"
                                  />
                                  <span className="text-[10px] font-black uppercase text-blue-600">
                                    ＋ New Item
                                  </span>
                                </label>
                              </div>
                              {bf.isNewItem ? (
                                <input
                                  type="text"
                                  value={bf.newItemName}
                                  onChange={(e) =>
                                    setPerBaleForm(activeBaleIdx, {
                                      newItemName: e.target.value,
                                    })
                                  }
                                  placeholder="Type new item name"
                                  className="w-full border border-blue-300 rounded-xl p-2.5 font-bold bg-yellow-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                              ) : (
                                <ItemNameCombo
                                  category={bf.category}
                                  value={bf.itemName}
                                  onChange={(val) =>
                                    setPerBaleForm(activeBaleIdx, {
                                      itemName: val,
                                    })
                                  }
                                  inventory={inventory}
                                  activeBusinessId={activeBusinessId}
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                                Total Qty in this item *
                              </p>
                              <input
                                type="number"
                                value={bf.totalQty}
                                onChange={(e) =>
                                  setPerBaleForm(activeBaleIdx, {
                                    totalQty: e.target.value,
                                  })
                                }
                                placeholder="Qty for this item"
                                className="w-full border rounded-xl p-2.5 font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                              />
                            </div>
                            {bfCat && bfCat.fields.length > 0 && (
                              <div className="grid grid-cols-2 gap-2">
                                {bfCat.fields.map((f) => (
                                  <div key={f.name}>
                                    <p className="text-[10px] font-black uppercase text-blue-800 mb-1">
                                      {f.name}
                                    </p>
                                    {f.type === "select" ? (
                                      <select
                                        value={bf.attributes[f.name] || ""}
                                        onChange={(e) =>
                                          setPerBaleForm(activeBaleIdx, {
                                            attributes: {
                                              ...bf.attributes,
                                              [f.name]: e.target.value,
                                            },
                                          })
                                        }
                                        className="w-full border rounded-xl p-2 font-bold text-sm bg-white"
                                      >
                                        <option value="">-</option>
                                        {(f.options || []).map((o) => (
                                          <option key={o} value={o}>
                                            {o}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type="text"
                                        value={bf.attributes[f.name] || ""}
                                        onChange={(e) =>
                                          setPerBaleForm(activeBaleIdx, {
                                            attributes: {
                                              ...bf.attributes,
                                              [f.name]: e.target.value,
                                            },
                                          })
                                        }
                                        className="w-full border rounded-xl p-2 font-bold text-sm bg-white"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[10px] font-black uppercase text-green-700 mb-1">
                                  Shop Qty
                                </p>
                                <input
                                  type="number"
                                  value={bf.shopQty}
                                  onChange={(e) =>
                                    setPerBaleForm(activeBaleIdx, {
                                      shopQty: e.target.value,
                                    })
                                  }
                                  placeholder="Shop"
                                  className="w-full border-2 border-green-200 rounded-xl p-2.5 font-black text-green-700 outline-none"
                                />
                              </div>
                              {godowns.map((g) => (
                                <div key={g}>
                                  <p className="text-[10px] font-black uppercase text-amber-700 mb-1 truncate">
                                    {g}
                                  </p>
                                  <input
                                    type="number"
                                    value={bf.godownQuants[g] || ""}
                                    onChange={(e) =>
                                      setPerBaleForm(activeBaleIdx, {
                                        godownQuants: {
                                          ...bf.godownQuants,
                                          [g]: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder={g}
                                    className="w-full border-2 border-amber-200 rounded-xl p-2.5 font-black text-amber-700 outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[10px] font-black uppercase text-blue-600 mb-1">
                                  Sale Rate (₹)
                                </p>
                                <input
                                  type="number"
                                  value={bf.saleRate}
                                  onChange={(e) =>
                                    setPerBaleForm(activeBaleIdx, {
                                      saleRate: e.target.value,
                                    })
                                  }
                                  className="w-full border-2 border-blue-200 rounded-xl p-2.5 font-black text-blue-700 outline-none"
                                />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                                  Pur. Rate (₹)
                                </p>
                                <input
                                  type="number"
                                  value={bf.purchaseRate}
                                  onChange={(e) =>
                                    setPerBaleForm(activeBaleIdx, {
                                      purchaseRate: e.target.value,
                                    })
                                  }
                                  className="w-full border rounded-xl p-2.5 font-black text-gray-600 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const bfNow = getPerBaleForm(activeBaleIdx);
                              const finalItemName = bfNow.isNewItem
                                ? bfNow.newItemName
                                : bfNow.itemName;
                              if (!finalItemName || !bfNow.category) {
                                showNotification(
                                  "Fill category and item name first",
                                  "error",
                                );
                                return;
                              }
                              const dist =
                                (Number(bfNow.shopQty) || 0) +
                                Object.values(bfNow.godownQuants).reduce(
                                  (a, b) => a + Number(b || 0),
                                  0,
                                );
                              const qty = Number(bfNow.totalQty) || 0;
                              if (qty > 0 && dist !== qty) {
                                showNotification(
                                  `Distribution (${dist}) must equal Total Qty (${qty})`,
                                  "error",
                                );
                                return;
                              }
                              const sku = generateSku(
                                bfNow.category,
                                finalItemName,
                                bfNow.attributes,
                                bfNow.saleRate,
                                activeBusinessId,
                              );
                              const newItem: BaleItem = {
                                id: Date.now(),
                                sku,
                                category: bfNow.category,
                                itemName: finalItemName,
                                attributes: bfNow.attributes,
                                shopQty: bfNow.shopQty,
                                godownQuants: bfNow.godownQuants,
                                saleRate: bfNow.saleRate,
                                purchaseRate: bfNow.purchaseRate,
                                customData: {},
                              };
                              const updated = [...perBaleData];
                              updated[activeBaleIdx] = {
                                ...updated[activeBaleIdx],
                                items: [
                                  ...updated[activeBaleIdx].items,
                                  newItem,
                                ],
                              };
                              setPerBaleData(updated);
                              setPerBaleForm(activeBaleIdx, {
                                itemName: "",
                                newItemName: "",
                                isNewItem: false,
                                shopQty: "",
                                godownQuants: {},
                                totalQty: "",
                                attributes: {},
                              });
                              showNotification("Item added to bale", "success");
                            }}
                            className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl uppercase tracking-widest text-[10px] hover:bg-blue-700"
                          >
                            ＋ Add Item to Bale {activeBaleIdx + 1}
                          </button>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            );
          })()}
          {/* Per-Bale Save Button */}
          {perBaleData[activeBaleIdx] && !perBaleData[activeBaleIdx].locked && (
            <div className="px-6 pt-2">
              <button
                type="button"
                onClick={() => {
                  const bale = perBaleData[activeBaleIdx];
                  if (!bale || bale.locked) return;
                  if (bale.received) {
                    if (bale.items.length === 0) {
                      showNotification(
                        "Add items to this bale before saving.",
                        "error",
                      );
                      return;
                    }
                    if (bale.totalQty) {
                      const dist = bale.items.reduce(
                        (s, i) =>
                          s +
                          (Number(i.shopQty) || 0) +
                          Object.values(i.godownQuants).reduce(
                            (a, b) => a + Number(b || 0),
                            0,
                          ),
                        0,
                      );
                      if (dist !== Number(bale.totalQty)) {
                        showNotification(
                          `Qty mismatch: ${dist} vs ${bale.totalQty}`,
                          "error",
                        );
                        return;
                      }
                    }
                    const existingTx = transactions.find(
                      (t) =>
                        t.biltyNo?.toLowerCase() === bale.label.toLowerCase() &&
                        (!t.businessId || t.businessId === activeBusinessId),
                    );
                    if (existingTx && currentUser.role !== "admin") {
                      showNotification(
                        `Bilty ${bale.label} already processed. Admin override required.`,
                        "error",
                      );
                      return;
                    }
                    // Check for new items that need to be created
                    const newItemNames = bale.items
                      .filter((itm) => {
                        if (!itm.itemName || !itm.category) return false;
                        return !Object.values(inventory).some(
                          (inv) =>
                            (!inv.businessId ||
                              inv.businessId === activeBusinessId) &&
                            inv.category === itm.category &&
                            inv.itemName.toLowerCase() ===
                              itm.itemName.toLowerCase(),
                        );
                      })
                      .map((itm) => `${itm.itemName} (${itm.category})`);
                    const doSave = () => {
                      // Update stock (updateStock handles new item creation automatically)
                      for (const itm of bale.items) {
                        if (Number(itm.shopQty) > 0)
                          updateStock(
                            itm.sku,
                            {
                              ...itm,
                              saleRate: Number(itm.saleRate),
                              purchaseRate: Number(itm.purchaseRate),
                            },
                            Number(itm.shopQty),
                            0,
                            "Main Godown",
                          );
                        for (const [g, q] of Object.entries(itm.godownQuants)) {
                          if (Number(q) > 0)
                            updateStock(
                              itm.sku,
                              {
                                ...itm,
                                saleRate: Number(itm.saleRate),
                                purchaseRate: Number(itm.purchaseRate),
                              },
                              0,
                              Number(q),
                              g,
                            );
                        }
                      }
                      // Create transaction
                      setTransactions((prev) => [
                        {
                          id: Date.now(),
                          type: "INWARD" as const,
                          biltyNo: bale.label,
                          businessId: activeBusinessId,
                          date: new Date().toISOString().split("T")[0],
                          user: currentUser.username,
                          transportName:
                            (matchedDetails as TransitRecord)?.transportName ||
                            "",
                          itemsCount: bale.totalQty
                            ? Number(bale.totalQty)
                            : bale.items.reduce(
                                (s, i) =>
                                  s +
                                  (Number(i.shopQty) || 0) +
                                  Object.values(i.godownQuants).reduce(
                                    (a, b) => a + Number(b || 0),
                                    0,
                                  ),
                                0,
                              ),
                          totalQtyInBale: bale.totalQty
                            ? Number(bale.totalQty)
                            : undefined,
                          baleItemsList: bale.items.map((i) => ({
                            itemName: i.itemName,
                            category: i.category,
                            attributes: { ...i.attributes },
                            shopQty: Number(i.shopQty) || 0,
                            godownQuants: Object.fromEntries(
                              Object.entries(i.godownQuants).map(([g, q]) => [
                                g,
                                Number(q) || 0,
                              ]),
                            ),
                            saleRate: Number(i.saleRate) || 0,
                            purchaseRate: Number(i.purchaseRate) || 0,
                            qty:
                              (Number(i.shopQty) || 0) +
                              Object.values(i.godownQuants).reduce(
                                (a, b) => a + Number(b || 0),
                                0,
                              ),
                          })),
                        },
                        ...prev,
                      ]);
                      // Remove from transit/queue
                      setTransitGoods((prev) =>
                        prev.filter(
                          (g) =>
                            g.biltyNo?.toLowerCase() !==
                            bale.label.toLowerCase(),
                        ),
                      );
                      setPendingParcels((prev) =>
                        prev.filter(
                          (p) =>
                            p.biltyNo?.toLowerCase() !==
                            bale.label.toLowerCase(),
                        ),
                      );
                      // Add to inwardSaved
                      if (setInwardSaved) {
                        setInwardSaved((prev) => [
                          {
                            id: Date.now(),
                            biltyNumber: bale.label,
                            baseNumber: bale.label.replace(/X\d+\(\d+\)$/i, ""),
                            packages: inwardPackages,
                            items: bale.items.map((i) => ({
                              category: i.category,
                              itemName: i.itemName,
                              qty:
                                (Number(i.shopQty) || 0) +
                                Object.values(i.godownQuants).reduce(
                                  (a, b) => a + Number(b || 0),
                                  0,
                                ),
                              shopQty: Number(i.shopQty) || 0,
                              godownQty: Object.values(i.godownQuants).reduce(
                                (a, b) => a + Number(b || 0),
                                0,
                              ),
                              saleRate: Number(i.saleRate) || 0,
                              purchaseRate: Number(i.purchaseRate) || 0,
                              attributes: i.attributes || {},
                            })),
                            savedBy: currentUser.username,
                            savedAt: new Date().toISOString(),
                            transporter:
                              (matchedDetails as TransitRecord)
                                ?.transportName || "",
                            supplier:
                              (matchedDetails as TransitRecord)?.supplierName ||
                              (matchedDetails as PendingParcel)?.supplier ||
                              "",
                            businessId: activeBusinessId,
                          },
                          ...prev,
                        ]);
                      }
                      // Mark bale as locked
                      const updated = [...perBaleData];
                      updated[activeBaleIdx] = {
                        ...updated[activeBaleIdx],
                        locked: true,
                        lockedBy: currentUser.username,
                        lockedDate: new Date().toISOString().split("T")[0],
                      };
                      setPerBaleData(updated);
                      showNotification(
                        `Bale ${bale.label} saved to inventory!`,
                        "success",
                      );
                    };
                    if (newItemNames.length > 0) {
                      setConfirmDialog({
                        message: `Create new inventory items?\n${newItemNames.join(", ")}`,
                        onConfirm: doSave,
                      });
                    } else {
                      doSave();
                    }
                  } else {
                    // Not received: save to transit/queue
                    const inTransit = transitGoods.some(
                      (g) =>
                        g.biltyNo?.toLowerCase() === bale.label.toLowerCase() &&
                        (!g.businessId || g.businessId === activeBusinessId),
                    );
                    const inQueue = pendingParcels.some(
                      (p) =>
                        p.biltyNo?.toLowerCase() === bale.label.toLowerCase() &&
                        (!p.businessId || p.businessId === activeBusinessId),
                    );
                    if (!inTransit && !inQueue) {
                      if (bale.notReceivedTarget === "transit") {
                        setTransitGoods((prev) => [
                          {
                            id: Date.now(),
                            biltyNo: bale.label,
                            transportName:
                              (matchedDetails as TransitRecord)
                                ?.transportName || "",
                            supplierName:
                              (matchedDetails as PendingParcel)?.supplier || "",
                            itemName: bale.items[0]?.itemName || "",
                            itemCategory: bale.items[0]?.category || "",
                            packages: "1",
                            date: new Date().toISOString().split("T")[0],
                            addedBy: currentUser.username,
                            businessId: activeBusinessId,
                            customData: {},
                          },
                          ...prev,
                        ]);
                      } else {
                        setPendingParcels((prev) => [
                          {
                            id: Date.now(),
                            biltyNo: bale.label,
                            transportName:
                              (matchedDetails as TransitRecord)
                                ?.transportName || "",
                            packages: "1",
                            dateReceived: new Date()
                              .toISOString()
                              .split("T")[0],
                            businessId: activeBusinessId,
                            itemName: bale.items[0]?.itemName || "",
                            itemCategory: bale.items[0]?.category || "",
                            customData: {},
                          },
                          ...prev,
                        ]);
                      }
                    }
                    setTransactions((prev) => [
                      {
                        id: Date.now(),
                        type: "INWARD_PENDING" as const,
                        biltyNo: bale.label,
                        businessId: activeBusinessId,
                        date: new Date().toISOString().split("T")[0],
                        user: currentUser.username,
                        notes: `Not received — saved to ${bale.notReceivedTarget}`,
                      },
                      ...prev,
                    ]);
                    const updated = [...perBaleData];
                    updated[activeBaleIdx] = {
                      ...updated[activeBaleIdx],
                      locked: true,
                      lockedBy: currentUser.username,
                      lockedDate: new Date().toISOString().split("T")[0],
                      pendingSaved: true,
                      pendingSavedTarget: bale.notReceivedTarget,
                    };
                    setPerBaleData(updated);
                    showNotification(
                      `Bale ${bale.label} transferred to ${bale.notReceivedTarget} as Not Received`,
                      "success",
                    );
                  }
                }}
                disabled={
                  !perBaleData[activeBaleIdx]?.received &&
                  !perBaleData[activeBaleIdx]?.notReceivedTarget
                }
                className="w-full bg-green-600 text-white font-black py-3 rounded-2xl uppercase tracking-widest text-xs shadow hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {perBaleData[activeBaleIdx]?.received
                  ? `💾 Save Bale ${activeBaleIdx + 1} — ${perBaleData[activeBaleIdx]?.label}`
                  : `📦 Store as Not Received — ${perBaleData[activeBaleIdx]?.label}`}
              </button>
            </div>
          )}
          {/* Save All Bales Button */}
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={() => {
                // Validate all received bales (skip locked ones - already processed)
                for (const bale of perBaleData) {
                  if (bale.locked) continue;
                  if (!bale.received) continue;
                  if (bale.items.length === 0) {
                    showNotification(
                      `Bale ${bale.label} has no items. Add items or mark as not received.`,
                      "error",
                    );
                    return;
                  }
                  if (bale.totalQty) {
                    const dist = bale.items.reduce(
                      (s, i) =>
                        s +
                        (Number(i.shopQty) || 0) +
                        Object.values(i.godownQuants).reduce(
                          (a, b) => a + Number(b || 0),
                          0,
                        ),
                      0,
                    );
                    if (dist !== Number(bale.totalQty)) {
                      showNotification(
                        `Bale ${bale.label}: qty mismatch (${dist} vs ${bale.totalQty})`,
                        "error",
                      );
                      return;
                    }
                  }
                }
                // Check for duplicate bilties (skip locked ones)
                for (const bale of perBaleData) {
                  if (bale.locked) continue;
                  if (!bale.received) continue;
                  const existing = transactions.find(
                    (t) =>
                      t.biltyNo?.toLowerCase() === bale.label.toLowerCase() &&
                      (!t.businessId || t.businessId === activeBusinessId),
                  );
                  if (existing && currentUser.role !== "admin") {
                    showNotification(
                      `Bilty ${bale.label} already processed. Admin override required.`,
                      "error",
                    );
                    return;
                  }
                }
                // Process each bale (skip locked ones - already in inventory)
                // Collect all new transactions for a single batched state update
                const batchedInwardTxns: Transaction[] = [];
                const batchedPendingTxns: Transaction[] = [];
                const labelsToRemoveFromTransit: string[] = [];
                const labelsToRemoveFromQueue: string[] = [];
                for (const bale of perBaleData) {
                  if (bale.locked) continue;
                  if (bale.received) {
                    // Fix 6: Only create inventory items after posting (no pre-creation)
                    for (const itm of bale.items) {
                      if (itm.itemName && itm.category) {
                        const exists = Object.values(inventory).some(
                          (inv) =>
                            (!inv.businessId ||
                              inv.businessId === activeBusinessId) &&
                            inv.category === itm.category &&
                            inv.itemName.toLowerCase() ===
                              itm.itemName.toLowerCase(),
                        );
                        if (!exists) {
                          const newSku = generateSku(
                            itm.category,
                            itm.itemName,
                            {},
                            "0",
                            activeBusinessId,
                          );
                          setInventory((prev) => ({
                            ...prev,
                            [newSku]: {
                              sku: newSku,
                              category: itm.category,
                              itemName: itm.itemName,
                              attributes: {},
                              shop: 0,
                              godowns: {},
                              saleRate: 0,
                              purchaseRate: 0,
                              businessId: activeBusinessId,
                            },
                          }));
                        }
                      }
                    }
                    // Update stock
                    for (const itm of bale.items) {
                      if (Number(itm.shopQty) > 0)
                        updateStock(
                          itm.sku,
                          {
                            ...itm,
                            saleRate: Number(itm.saleRate),
                            purchaseRate: Number(itm.purchaseRate),
                          },
                          Number(itm.shopQty),
                          0,
                          "Main Godown",
                        );
                      for (const [g, q] of Object.entries(itm.godownQuants)) {
                        if (Number(q) > 0)
                          updateStock(
                            itm.sku,
                            {
                              ...itm,
                              saleRate: Number(itm.saleRate),
                              purchaseRate: Number(itm.purchaseRate),
                            },
                            0,
                            Number(q),
                            g,
                          );
                      }
                    }
                    // Collect for batch transaction update
                    batchedInwardTxns.push({
                      id: Date.now() + Math.random(),
                      type: "INWARD",
                      biltyNo: bale.label,
                      businessId: activeBusinessId,
                      date: new Date().toISOString().split("T")[0],
                      user: currentUser.username,
                      transportName:
                        (matchedDetails as TransitRecord)?.transportName || "",
                      itemsCount: bale.totalQty
                        ? Number(bale.totalQty)
                        : bale.items.reduce(
                            (s, i) =>
                              s +
                              (Number(i.shopQty) || 0) +
                              Object.values(i.godownQuants).reduce(
                                (a, b) => a + Number(b || 0),
                                0,
                              ),
                            0,
                          ),
                      totalQtyInBale: bale.totalQty
                        ? Number(bale.totalQty)
                        : undefined,
                      baleItemsList: bale.items.map((i) => ({
                        itemName: i.itemName,
                        category: i.category,
                        attributes: { ...i.attributes },
                        shopQty: Number(i.shopQty) || 0,
                        godownQuants: Object.fromEntries(
                          Object.entries(i.godownQuants).map(([g, q]) => [
                            g,
                            Number(q) || 0,
                          ]),
                        ),
                        saleRate: Number(i.saleRate) || 0,
                        purchaseRate: Number(i.purchaseRate) || 0,
                        qty:
                          (Number(i.shopQty) || 0) +
                          Object.values(i.godownQuants).reduce(
                            (a, b) => a + Number(b || 0),
                            0,
                          ),
                      })),
                    });
                    labelsToRemoveFromTransit.push(bale.label.toLowerCase());
                    labelsToRemoveFromQueue.push(bale.label.toLowerCase());
                  } else {
                    // Not received: check if already in transit or queue
                    const inTransit = transitGoods.some(
                      (g) =>
                        g.biltyNo?.toLowerCase() === bale.label.toLowerCase() &&
                        (!g.businessId || g.businessId === activeBusinessId),
                    );
                    const inQueue = pendingParcels.some(
                      (p) =>
                        p.biltyNo?.toLowerCase() === bale.label.toLowerCase() &&
                        (!p.businessId || p.businessId === activeBusinessId),
                    );
                    if (!inTransit && !inQueue) {
                      if (bale.notReceivedTarget === "transit") {
                        setTransitGoods((prev) => [
                          {
                            id: Date.now() + Math.random(),
                            biltyNo: bale.label,
                            transportName:
                              (matchedDetails as TransitRecord)
                                ?.transportName || "",
                            supplierName:
                              (matchedDetails as PendingParcel)?.supplier || "",
                            itemName: bale.items[0]?.itemName || "",
                            itemCategory: bale.items[0]?.category || "",
                            packages: "1",
                            date: new Date().toISOString().split("T")[0],
                            addedBy: currentUser.username,
                            businessId: activeBusinessId,
                            customData: {},
                          },
                          ...prev,
                        ]);
                      } else {
                        setPendingParcels((prev) => [
                          {
                            id: Date.now() + Math.random(),
                            biltyNo: bale.label,
                            transportName:
                              (matchedDetails as TransitRecord)
                                ?.transportName || "",
                            supplier:
                              (matchedDetails as PendingParcel)?.supplier || "",
                            packages: "1",
                            dateReceived: new Date()
                              .toISOString()
                              .split("T")[0],
                            businessId: activeBusinessId,
                            itemName: bale.items[0]?.itemName || "",
                            itemCategory: bale.items[0]?.category || "",
                            customData: {},
                          },
                          ...prev,
                        ]);
                      }
                    }
                    // Collect pending in history for batch update
                    batchedPendingTxns.push({
                      id: Date.now() + Math.random(),
                      type: "INWARD_PENDING",
                      biltyNo: bale.label,
                      businessId: activeBusinessId,
                      date: new Date().toISOString().split("T")[0],
                      user: currentUser.username,
                      notes: `Not received — saved to ${bale.notReceivedTarget}`,
                    });
                  }
                }
                // Single batched state update for all transactions
                if (
                  batchedInwardTxns.length > 0 ||
                  batchedPendingTxns.length > 0
                ) {
                  setTransactions((prev) => [
                    ...batchedInwardTxns,
                    ...batchedPendingTxns,
                    ...prev,
                  ]);
                }
                // Single batched removal from transit and queue
                if (labelsToRemoveFromTransit.length > 0) {
                  setTransitGoods((prev) =>
                    prev.filter(
                      (g) =>
                        !labelsToRemoveFromTransit.includes(
                          g.biltyNo?.toLowerCase() ?? "",
                        ),
                    ),
                  );
                }
                if (labelsToRemoveFromQueue.length > 0) {
                  setPendingParcels((prev) =>
                    prev.filter(
                      (p) =>
                        !labelsToRemoveFromQueue.includes(
                          p.biltyNo?.toLowerCase() ?? "",
                        ),
                    ),
                  );
                }
                // Add received bales to inwardSaved
                if (setInwardSaved && batchedInwardTxns.length > 0) {
                  const newSavedEntries: InwardSavedEntry[] = perBaleData
                    .filter((b) => !b.locked && b.received)
                    .map((bale) => ({
                      id: Date.now() + Math.random(),
                      biltyNumber: bale.label,
                      baseNumber: bale.label.replace(/X\d+\(\d+\)$/i, ""),
                      packages: inwardPackages,
                      items: bale.items.map((i) => ({
                        category: i.category,
                        itemName: i.itemName,
                        qty:
                          (Number(i.shopQty) || 0) +
                          Object.values(i.godownQuants).reduce(
                            (a, b) => a + Number(b || 0),
                            0,
                          ),
                        shopQty: Number(i.shopQty) || 0,
                        godownQty: Object.values(i.godownQuants).reduce(
                          (a, b) => a + Number(b || 0),
                          0,
                        ),
                        saleRate: Number(i.saleRate) || 0,
                        purchaseRate: Number(i.purchaseRate) || 0,
                        attributes: i.attributes || {},
                      })),
                      savedBy: currentUser.username,
                      savedAt: new Date().toISOString(),
                      transporter:
                        (matchedDetails as TransitRecord)?.transportName || "",
                      supplier:
                        (matchedDetails as TransitRecord)?.supplierName ||
                        (matchedDetails as PendingParcel)?.supplier ||
                        "",
                      businessId: activeBusinessId,
                    }));
                  setInwardSaved((prev) => [...newSavedEntries, ...prev]);
                }
                // Clear all
                setPerBaleData([]);
                setInwardPackages("1");
                setBiltyNumber("");
                setMatchedDetails(null);
                setBiltyLocked(false);
                setOpeningParcel(null);
                showNotification(
                  `Processed ${perBaleData.filter((b) => b.received).length} received, ${perBaleData.filter((b) => !b.received).length} pending bales`,
                  "success",
                );
              }}
              className="w-full bg-blue-700 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl hover:bg-blue-800 transition-transform active:scale-95 mt-4"
            >
              Save All {perBaleData.length} Bales
            </button>
          </div>
        </div>
      )}

      {showItemForm &&
        Number(inwardPackages) <= 1 &&
        perBaleData.length === 0 &&
        false && (
          <form
            onSubmit={addItemToBale}
            className="bg-white p-6 sm:p-8 rounded-[2.5rem] border shadow-xl space-y-6 animate-fade-in-down"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Category *
                </p>
                <select
                  required
                  value={itemForm.category}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, category: e.target.value })
                  }
                  className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between ml-1 mb-1">
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Item Name *
                  </p>
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isNewItemMode}
                      onChange={(e) => {
                        setIsNewItemMode(e.target.checked);
                        setItemForm({ ...itemForm, itemName: "" });
                      }}
                      className="w-3 h-3 accent-blue-600"
                    />
                    <span className="text-[10px] font-black uppercase text-blue-600">
                      ＋ New Item
                    </span>
                  </label>
                </div>
                {isNewItemMode ? (
                  <input
                    type="text"
                    value={itemForm.itemName}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, itemName: e.target.value })
                    }
                    placeholder="Type new item name"
                    className="w-full border rounded-xl p-3 font-bold bg-yellow-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm border-blue-300"
                  />
                ) : (
                  <ItemNameCombo
                    category={itemForm.category}
                    value={itemForm.itemName}
                    onChange={(val) =>
                      setItemForm({ ...itemForm, itemName: val })
                    }
                    inventory={inventory}
                    activeBusinessId={activeBusinessId}
                  />
                )}
              </div>
            </div>
            {/* Total Qty in Bale - permanent, always shown */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-blue-800 ml-1">
                    Total Qty in Bale
                  </p>
                  <input
                    type="number"
                    value={totalQty}
                    onChange={(e) => setTotalQty(e.target.value)}
                    placeholder="Enter total qty in this bale"
                    className="w-full border border-blue-300 rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                </div>
                <div className="shrink-0 pt-5">
                  {totalQty &&
                    (() => {
                      const savedTotal = baleItems.reduce(
                        (sum, i) =>
                          sum +
                          (Number(i.shopQty) || 0) +
                          Object.values(i.godownQuants).reduce(
                            (a, b) => a + Number(b || 0),
                            0,
                          ),
                        0,
                      );
                      const currentFormTotal =
                        (Number(itemForm.shopQty) || 0) +
                        Object.values(itemForm.godownQuants).reduce(
                          (a, b) => a + Number(b || 0),
                          0,
                        );
                      const grandTotal = savedTotal + currentFormTotal;
                      const expected = Number(totalQty);
                      return grandTotal === expected ? (
                        <span className="text-green-700 text-[10px] font-black bg-green-100 border border-green-300 px-3 py-2 rounded-xl block">
                          ✓ {grandTotal}/{expected}
                        </span>
                      ) : (
                        <span className="text-orange-700 text-[10px] font-black bg-orange-100 border border-orange-300 px-3 py-2 rounded-xl block">
                          ⚠ {grandTotal}/{expected}
                        </span>
                      );
                    })()}
                </div>
              </div>
            </div>
            {selectedCat && (
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(selectedCat?.fields ?? []).map((f) => (
                  <div key={f.name}>
                    <p className="text-[10px] font-black uppercase text-blue-900 ml-1">
                      {f.name}
                    </p>
                    {f.type === "select" ? (
                      <select
                        value={itemForm.attributes[f.name] || ""}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            attributes: {
                              ...itemForm.attributes,
                              [f.name]: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-blue-200 rounded-xl p-2.5 font-bold text-sm bg-white"
                      >
                        <option value="">-</option>
                        {(f.options || []).map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={itemForm.attributes[f.name] || ""}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            attributes: {
                              ...itemForm.attributes,
                              [f.name]: e.target.value,
                            },
                          })
                        }
                        className="w-full border border-blue-200 rounded-xl p-2.5 font-bold text-sm bg-white"
                      />
                    )}
                  </div>
                ))}
                <DynamicFields
                  fields={customColumns}
                  values={itemForm.customData}
                  onChange={(k, v) =>
                    setItemForm({
                      ...itemForm,
                      customData: { ...itemForm.customData, [k]: v },
                    })
                  }
                />
              </div>
            )}
            <div className="bg-green-50 p-6 rounded-3xl border border-green-200">
              <h4 className="text-[10px] font-black text-green-900 uppercase tracking-widest mb-4 ml-1">
                Distribution
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-green-700 ml-1">
                    Shop Qty
                  </p>
                  <input
                    type="number"
                    placeholder="Shop"
                    value={itemForm.shopQty}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, shopQty: e.target.value })
                    }
                    className="w-full border-2 border-green-300 rounded-xl p-3 font-black text-green-700 text-lg outline-none focus:bg-white"
                  />
                </div>
                {godowns.map((g) => (
                  <div key={g}>
                    <p className="text-[10px] font-black uppercase text-amber-700 ml-1 truncate">
                      {g}
                    </p>
                    <input
                      type="number"
                      placeholder={g}
                      value={itemForm.godownQuants[g] || ""}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          godownQuants: {
                            ...itemForm.godownQuants,
                            [g]: e.target.value,
                          },
                        })
                      }
                      className="w-full border-2 border-amber-200 rounded-xl p-3 font-black text-amber-700 text-lg outline-none focus:bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`grid gap-6 ${currentUser.role === "staff" ? "grid-cols-1" : "grid-cols-2"}`}
            >
              <div>
                <p className="text-[10px] font-black uppercase text-blue-600 ml-1">
                  Sale Rate (₹) *
                </p>
                <input
                  required
                  type="number"
                  value={itemForm.saleRate}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, saleRate: e.target.value })
                  }
                  className="w-full border-2 border-blue-200 rounded-xl p-3 font-black text-blue-700 text-lg outline-none focus:bg-white"
                />
              </div>
              {currentUser.role !== "staff" && (
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 ml-1">
                    Pur. Rate (₹)
                  </p>
                  <input
                    type="number"
                    value={itemForm.purchaseRate}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, purchaseRate: e.target.value })
                    }
                    className="w-full border rounded-xl p-3 font-black text-gray-600 outline-none focus:bg-white"
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-transform active:scale-95 text-xs"
            >
              Add Item To Bale List
            </button>
          </form>
        )}

      {baleItems.length > 0 && perBaleData.length === 0 && (
        <div className="bg-white rounded-[2rem] border overflow-hidden shadow-2xl animate-fade-in-down">
          <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
            <h3 className="font-black uppercase tracking-widest text-xs">
              Items in this Bale
            </h3>
            <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">
              {baleItems.length} ITEMS
            </span>
          </div>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y">
              {baleItems.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 font-bold">
                    {i.itemName}{" "}
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-2 uppercase">
                      {i.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-black">
                    {(Number(i.shopQty) || 0) +
                      Object.values(i.godownQuants).reduce(
                        (a, b) => a + Number(b || 0),
                        0,
                      )}{" "}
                    Pcs
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setBaleItems((prev) =>
                          prev.filter((x) => x.id !== i.id),
                        )
                      }
                      className="text-red-500 p-2 bg-red-50 rounded-xl hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 bg-gray-50 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Date Opened
                </p>
                <input
                  type="date"
                  value={dateOpened}
                  onChange={(e) => setDateOpened(e.target.value)}
                  className="w-full border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Opened By
                </p>
                <input
                  type="text"
                  value={openedBy}
                  onChange={(e) => setOpenedBy(e.target.value)}
                  className="w-full border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleFinalSave}
              className="w-full bg-green-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.3em] shadow-xl shadow-green-200 hover:bg-green-700 transition-transform active:scale-95 text-sm"
            >
              Confirm & Save Entire Bale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= TRANSFER TAB ================= */
function TransferTab({
  inventory,
  updateStock,
  showNotification,
  godowns,
  activeBusinessId,
  setTransactions,
  currentUser,
}: {
  inventory: Record<string, InventoryItem>;
  updateStock: (
    sku: string,
    details: Partial<InventoryItem>,
    shopDelta: number,
    godownDelta: number,
    targetGodown?: string,
  ) => void;
  showNotification: (m: string, t?: string) => void;
  godowns: string[];
  activeBusinessId: string;
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
  currentUser?: AppUser;
}) {
  const [mode, setMode] = useState("G2S");
  const [targetG, setTargetG] = useState(godowns?.[0] || "Main Godown");
  const [search, setSearch] = useState("");
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [qty, setQty] = useState("");

  const filteredSkus = Object.keys(inventory || {})
    .filter((s) => {
      const matchesBusiness =
        !inventory[s].businessId ||
        inventory[s].businessId === activeBusinessId;
      return (
        matchesBusiness &&
        inventory[s].itemName?.toLowerCase().includes(search.toLowerCase())
      );
    })
    .slice(0, 10);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || !qty) return;
    const item = inventory[selectedSku];
    const qVal = Number(qty);
    let fromLoc = "";
    let toLoc = "";
    if (mode === "G2S") {
      if ((item.godowns?.[targetG] || 0) < qVal)
        return showNotification(`Not enough stock in ${targetG}`, "error");
      updateStock(selectedSku, item, qVal, -qVal, targetG);
      fromLoc = targetG;
      toLoc = "Shop";
    } else {
      if ((item.shop || 0) < qVal)
        return showNotification("Not enough stock in Shop", "error");
      updateStock(selectedSku, item, -qVal, qVal, targetG);
      fromLoc = "Shop";
      toLoc = targetG;
    }
    // Record in history
    if (setTransactions && currentUser) {
      const attrStr = Object.entries(item.attributes || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      setTransactions((prev) => [
        {
          id: Date.now(),
          type: "transfer",
          biltyNo: undefined,
          businessId: activeBusinessId,
          date: new Date().toISOString().split("T")[0],
          user: currentUser.username,
          itemName: item.itemName,
          category: item.category,
          itemsCount: qVal,
          fromLocation: fromLoc,
          toLocation: toLoc,
          transferredBy: currentUser.username,
          subCategory: attrStr || undefined,
          notes: `${item.itemName} · ${qVal} pcs · ${fromLoc} → ${toLoc}`,
        },
        ...prev,
      ]);
    }
    showNotification("Transfer Success!");
    setQty("");
    setSelectedSku(null);
    setSearch("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-down">
      <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2 border-b pb-4">
        <ArrowRightLeft className="text-purple-600" /> Internal Transfers
      </h2>
      <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-inner">
        <button
          type="button"
          onClick={() => setMode("G2S")}
          className={`flex-1 py-4 rounded-2xl transition-all ${mode === "G2S" ? "bg-purple-600 text-white shadow-lg" : "text-gray-500"}`}
        >
          Godown ➡️ Shop
        </button>
        <button
          type="button"
          onClick={() => setMode("S2G")}
          className={`flex-1 py-4 rounded-2xl transition-all ${mode === "S2G" ? "bg-blue-600 text-white shadow-lg" : "text-gray-500"}`}
        >
          Shop ➡️ Godown
        </button>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl space-y-6">
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Search Product
            </p>
            <button
              type="button"
              title="Reset selection"
              onClick={() => {
                setSelectedSku(null);
                setSearch("");
                setQty("");
              }}
              className="p-1.5 bg-gray-100 hover:bg-purple-100 text-gray-400 hover:text-purple-600 rounded-lg transition-colors"
            >
              <RefreshCw size={13} />
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-2xl p-4 font-bold outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="Type item name..."
          />
          {search && !selectedSku && (
            <div className="absolute z-10 w-full bg-white border mt-2 rounded-2xl shadow-2xl divide-y overflow-hidden">
              {filteredSkus.map((s) => {
                const inv = inventory[s];
                const attrs = Object.entries(inv.attributes || {});
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setSelectedSku(s);
                      setSearch(inv.itemName);
                    }}
                    className="w-full text-left p-4 hover:bg-purple-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm">{inv.itemName}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">
                          {inv.category}
                        </p>
                        {attrs.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {attrs.map(([k, v]) => (
                              <span
                                key={k}
                                className="bg-purple-50 text-purple-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase"
                              >
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-black text-amber-600 uppercase">
                          Godown: {getTotalGodownStock(inv)}
                        </p>
                        <p className="text-[10px] font-black text-blue-600 uppercase">
                          Shop: {inv.shop}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {selectedSku && (
          <div className="animate-fade-in-down space-y-4">
            {/* Subcategories display */}
            {Object.keys(inventory[selectedSku]?.attributes || {}).length >
              0 && (
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black uppercase text-blue-700 mb-2">
                  Item Sub-Categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(inventory[selectedSku].attributes).map(
                    ([k, v]) => (
                      <span
                        key={k}
                        className="bg-white border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase"
                      >
                        {k}: {v}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
            {/* Per-Godown Stock Breakdown */}
            {(() => {
              const godownEntries = Object.entries(
                inventory[selectedSku]?.godowns || {},
              ).filter(([, v]) => Number(v) > 0);
              if (godownEntries.length === 0) return null;
              return (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100">
                  <p className="text-[10px] font-black uppercase text-amber-800 mb-2">
                    Stock by Godown
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {godownEntries.map(([g, v]) => (
                      <span
                        key={g}
                        className="bg-white border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-black"
                      >
                        {g}: <span className="text-amber-600">{v}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
              <div>
                <p className="text-[10px] font-black uppercase text-purple-900 ml-1">
                  Location
                </p>
                <select
                  value={targetG}
                  onChange={(e) => setTargetG(e.target.value)}
                  className="w-full border border-purple-200 rounded-2xl p-4 font-bold outline-none bg-white shadow-sm"
                >
                  {godowns.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-purple-900 ml-1">
                  Quantity
                </p>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full border border-purple-200 rounded-2xl p-4 font-black text-lg outline-none bg-white shadow-sm text-purple-700"
                  placeholder="0"
                />
              </div>
              <button
                type="button"
                onClick={handleTransfer}
                className="sm:col-span-2 bg-purple-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-purple-200 active:scale-95 transition-transform"
              >
                Execute Transfer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= HISTORY TAB ================= */
function HistoryTab({
  transactions,
  setConfirmDialog,
  setTransactions,
  activeBusinessId,
  currentUser,
  inventory,
  transitGoods,
  pendingParcels,
  categories,
  godowns,
  showNotification,
}: {
  transactions: Transaction[];
  setConfirmDialog: (
    d: { message: string; onConfirm: () => void } | null,
  ) => void;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  activeBusinessId: string;
  currentUser: AppUser;
  inventory: Record<string, InventoryItem>;
  transitGoods?: TransitRecord[];
  pendingParcels?: PendingParcel[];
  categories: Category[];
  godowns: string[];
  showNotification: (m: string, t?: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedBiltyForHistory, setSelectedBiltyForHistory] = useState<
    string | null
  >(null);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Aggregate all bilties (from transactions, transit, queue)
  const allBiltyNos = Array.from(
    new Set([
      ...transactions
        .filter((t) => !t.businessId || t.businessId === activeBusinessId)
        .filter((t) => t.biltyNo)
        .map((t) => t.biltyNo as string),
      ...(transitGoods || [])
        .filter((g) => !g.businessId || g.businessId === activeBusinessId)
        .map((g) => g.biltyNo),
      ...(pendingParcels || [])
        .filter((p) => !p.businessId || p.businessId === activeBusinessId)
        .map((p) => p.biltyNo),
    ]),
  );

  let filtered = transactions.filter((t) => {
    if (!(!t.businessId || t.businessId === activeBusinessId)) return false;
    if (
      search &&
      !t.biltyNo?.toLowerCase().includes(search.toLowerCase()) &&
      !t.type?.toLowerCase().includes(search.toLowerCase()) &&
      !t.itemName?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    const tDate = t.date?.split("T")[0] || "";
    if (filterDateFrom && tDate < filterDateFrom) return false;
    if (filterDateTo && tDate > filterDateTo) return false;
    return true;
  });
  filtered = [...filtered].sort((a, b) => {
    const da = a.date?.split("T")[0] || "";
    const db = b.date?.split("T")[0] || "";
    return sortOrder === "desc" ? db.localeCompare(da) : da.localeCompare(db);
  });

  const handleDelete = (id: number) => {
    setConfirmDialog({
      message: "Delete this record?",
      onConfirm: () =>
        setTransactions((prev) => prev.filter((t) => t.id !== id)),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-down">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" /> Tracking Log
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Bilty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold bg-white shadow-sm"
            />
          </div>
        </div>
      </div>
      {/* All-Source Bilty Status Panel */}
      {search.length > 2 && (
        <div className="bg-white border rounded-[2rem] overflow-hidden shadow-sm animate-fade-in-down">
          <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest">
              Bilty Tracker
            </span>
            <span className="text-gray-400 text-[10px]">Across all tabs</span>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {allBiltyNos
              .filter((b) => b.toLowerCase().includes(search.toLowerCase()))
              .map((bNo) => {
                const inTransit = (transitGoods || []).some(
                  (g) =>
                    g.biltyNo?.toLowerCase() === bNo.toLowerCase() &&
                    (!g.businessId || g.businessId === activeBusinessId),
                );
                const inQueue = (pendingParcels || []).some(
                  (p) =>
                    p.biltyNo?.toLowerCase() === bNo.toLowerCase() &&
                    (!p.businessId || p.businessId === activeBusinessId),
                );
                const processed = transactions.some(
                  (t) =>
                    t.biltyNo?.toLowerCase() === bNo.toLowerCase() &&
                    (!t.businessId || t.businessId === activeBusinessId),
                );
                let statusLabel = "Unknown";
                let statusColor = "bg-gray-100 text-gray-600";
                if (inTransit) {
                  statusLabel = "In Transit";
                  statusColor = "bg-indigo-100 text-indigo-700";
                } else if (inQueue) {
                  statusLabel = "In Queue";
                  statusColor = "bg-amber-100 text-amber-700";
                } else if (processed) {
                  statusLabel = "Processed";
                  statusColor = "bg-green-100 text-green-700";
                }
                return (
                  <button
                    key={bNo}
                    type="button"
                    onClick={() => setSelectedBiltyForHistory(bNo)}
                    className="w-full text-left px-6 py-3 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="font-black text-sm text-gray-900">
                      {bNo}
                    </span>
                    <span
                      className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                  </button>
                );
              })}
            {allBiltyNos.filter((b) =>
              b.toLowerCase().includes(search.toLowerCase()),
            ).length === 0 && (
              <p className="px-6 py-4 text-xs text-gray-400 font-bold">
                No bilty found matching "{search}"
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none"
        />
        <span className="text-gray-400 text-xs">–</span>
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        {(filterDateFrom || filterDateTo) && (
          <button
            type="button"
            onClick={() => {
              setFilterDateFrom("");
              setFilterDateTo("");
            }}
            className="text-xs text-red-500 font-bold bg-red-50 px-3 py-2 rounded-xl"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed rounded-[3rem]">
            <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
              No Records Found
            </p>
          </div>
        ) : (
          filtered.map((t) => {
            const isTransfer = t.type === "transfer";
            const isExpanded = expandedRows.has(t.id);
            return (
              <div
                key={t.id}
                className={`bg-white rounded-[2rem] border shadow-sm hover:shadow-md transition-shadow ${isTransfer ? "border-purple-100" : "border-gray-100"}`}
              >
                <div className="p-6 flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${isTransfer ? "bg-purple-600 text-white" : "bg-blue-600 text-white"}`}
                      >
                        {isTransfer ? "Transfer" : t.type}
                      </span>
                      {t.biltyNo && (
                        <button
                          type="button"
                          className="font-black text-gray-900 uppercase text-lg tracking-tight cursor-pointer hover:text-blue-600 hover:underline transition-colors bg-transparent border-0 p-0"
                          title="Click to view bilty journey"
                          onClick={() =>
                            setSelectedBiltyForHistory(t.biltyNo || null)
                          }
                        >
                          {t.biltyNo}
                        </button>
                      )}
                      {isTransfer && t.itemName && (
                        <span className="font-black text-gray-800 text-sm tracking-tight">
                          {t.itemName}
                        </span>
                      )}
                    </div>
                    {isTransfer ? (
                      <div className="text-[10px] font-bold text-gray-500 uppercase flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span>
                          By:{" "}
                          <b className="text-gray-800">
                            {t.transferredBy || t.user || "-"}
                          </b>
                        </span>
                        {t.fromLocation && t.toLocation && (
                          <span>
                            Route:{" "}
                            <b className="text-purple-700">
                              {t.fromLocation} → {t.toLocation}
                            </b>
                          </span>
                        )}
                        {t.subCategory && (
                          <span>
                            Specs:{" "}
                            <b className="text-gray-800">{t.subCategory}</b>
                          </span>
                        )}
                        {(t.itemsCount ?? 0) > 0 && (
                          <span>
                            Qty:{" "}
                            <b className="text-gray-800">{t.itemsCount} pcs</b>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-gray-500 uppercase flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span>
                          By: <b className="text-gray-800">{t.user || "-"}</b>
                        </span>
                        <span>
                          Transport:{" "}
                          <b className="text-gray-800">
                            {t.transportName || "-"}
                          </b>
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Right section - date + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`text-right p-3 rounded-2xl border ${isTransfer ? "bg-purple-50 border-purple-100" : "bg-gray-50 border-gray-100"}`}
                    >
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {t.date?.split("T")[0] || t.date}
                      </p>
                      {!isTransfer && (t.itemsCount ?? 0) > 0 && (
                        <p className="text-xs font-black text-blue-600 mt-1">
                          {t.itemsCount} Items
                        </p>
                      )}
                      {isTransfer && (t.itemsCount ?? 0) > 0 && (
                        <p className="text-xs font-black text-purple-600 mt-1">
                          {t.itemsCount} pcs
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleRow(t.id)}
                      className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                      title={isExpanded ? "Collapse" : "Expand details"}
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                    {currentUser.role === "admin" &&
                      (t.type === "INWARD" || t.type === "DIRECT_STOCK") && (
                        <button
                          type="button"
                          onClick={() => setEditingTx({ ...t })}
                          className="p-2 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-blue-500"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4 bg-gray-50/60 rounded-b-[2rem]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] font-bold uppercase">
                      {t.biltyNo && (
                        <div>
                          <p className="text-gray-400">Bilty No</p>
                          <p className="text-gray-800 font-black text-sm normal-case">
                            {t.biltyNo}
                          </p>
                        </div>
                      )}
                      {t.itemName && (
                        <div>
                          <p className="text-gray-400">Item</p>
                          <p className="text-gray-800 font-black text-sm normal-case">
                            {t.itemName}
                          </p>
                        </div>
                      )}
                      {t.category && (
                        <div>
                          <p className="text-gray-400">Category</p>
                          <p className="text-gray-800 font-black text-sm normal-case">
                            {t.category}
                          </p>
                        </div>
                      )}
                      {t.subCategory && (
                        <div>
                          <p className="text-gray-400">Sub-Category</p>
                          <p className="text-gray-800 font-black text-sm normal-case">
                            {t.subCategory}
                          </p>
                        </div>
                      )}
                      {t.fromLocation && (
                        <div>
                          <p className="text-gray-400">From</p>
                          <p className="text-gray-800 font-black text-sm normal-case">
                            {t.fromLocation}
                          </p>
                        </div>
                      )}
                      {t.toLocation && (
                        <div>
                          <p className="text-gray-400">To</p>
                          <p className="text-gray-800 font-black text-sm normal-case">
                            {t.toLocation}
                          </p>
                        </div>
                      )}
                      {t.transportName && (
                        <div>
                          <p className="text-gray-400">Transport</p>
                          <p className="text-gray-800 font-black text-sm normal-case">
                            {t.transportName}
                          </p>
                        </div>
                      )}
                      {t.itemsCount !== undefined && (
                        <div>
                          <p className="text-gray-400">Qty</p>
                          <p className="text-gray-800 font-black text-sm">
                            {t.itemsCount}
                          </p>
                        </div>
                      )}
                      {(t.transferredBy || t.user) && (
                        <div>
                          <p className="text-gray-400">By</p>
                          <p className="text-gray-800 font-black text-sm normal-case">
                            {t.transferredBy || t.user}
                          </p>
                        </div>
                      )}
                      {t.notes && (
                        <div className="col-span-2 sm:col-span-3">
                          <p className="text-gray-400">Notes</p>
                          <p className="text-gray-700 font-bold text-xs normal-case mt-1">
                            {t.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {editingTx && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-down">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Edit Inward Entry
                </p>
                <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">
                  {editingTx.biltyNo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {/* Header fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
                    Bilty No <span className="text-gray-300">(locked)</span>
                  </p>
                  <input
                    type="text"
                    value={editingTx.biltyNo || ""}
                    readOnly
                    className="w-full border rounded-xl p-3 font-bold bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
                    Transport
                  </p>
                  <input
                    type="text"
                    value={editingTx.transportName || ""}
                    onChange={(e) =>
                      setEditingTx({
                        ...editingTx,
                        transportName: e.target.value,
                      } as Transaction)
                    }
                    className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
                    Opened By
                  </p>
                  <input
                    type="text"
                    value={editingTx.user || ""}
                    onChange={(e) =>
                      setEditingTx({
                        ...editingTx,
                        user: e.target.value,
                      } as Transaction)
                    }
                    className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
                    Date
                  </p>
                  <input
                    type="date"
                    value={editingTx.date?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditingTx({
                        ...editingTx,
                        date: e.target.value,
                      } as Transaction)
                    }
                    className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
                    Total Qty in Bale
                  </p>
                  <input
                    type="number"
                    value={editingTx.totalQtyInBale ?? ""}
                    onChange={(e) =>
                      setEditingTx({
                        ...editingTx,
                        totalQtyInBale:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      } as Transaction)
                    }
                    className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* Bale Items */}
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 mb-3 mt-2">
                  Items in Bale
                </p>
                {(editingTx.baleItemsList || []).map((bi, idx) => (
                  <div
                    key={`${bi.itemName}-${idx}`}
                    className="border border-blue-100 rounded-2xl p-4 mb-3 bg-blue-50/40 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase text-blue-700">
                        Item {idx + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTx({
                            ...editingTx,
                            baleItemsList: (
                              editingTx.baleItemsList || []
                            ).filter((_, i) => i !== idx),
                          } as Transaction)
                        }
                        className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                          Category
                        </p>
                        <select
                          value={bi.category}
                          onChange={(e) => {
                            const updated = [
                              ...(editingTx.baleItemsList || []),
                            ];
                            updated[idx] = {
                              ...updated[idx],
                              category: e.target.value,
                              itemName: "",
                            };
                            setEditingTx({
                              ...editingTx,
                              baleItemsList: updated,
                            } as Transaction);
                          }}
                          className="w-full border rounded-xl p-3 font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          <option value="">Select</option>
                          {categories.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                          Item Name
                        </p>
                        <ItemNameCombo
                          category={bi.category}
                          value={bi.itemName}
                          onChange={(val) => {
                            const updated = [
                              ...(editingTx.baleItemsList || []),
                            ];
                            updated[idx] = { ...updated[idx], itemName: val };
                            setEditingTx({
                              ...editingTx,
                              baleItemsList: updated,
                            } as Transaction);
                          }}
                          inventory={inventory}
                          activeBusinessId={activeBusinessId}
                        />
                      </div>
                    </div>
                    {/* Attributes */}
                    {(() => {
                      const cat = categories.find(
                        (c) => c.name === bi.category,
                      );
                      if (!cat || !cat.fields.length) return null;
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          {cat.fields.map((f) => (
                            <div key={f.name}>
                              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                                {f.name}
                              </p>
                              {f.type === "select" ? (
                                <select
                                  value={bi.attributes?.[f.name] || ""}
                                  onChange={(e) => {
                                    const updated = [
                                      ...(editingTx.baleItemsList || []),
                                    ];
                                    updated[idx] = {
                                      ...updated[idx],
                                      attributes: {
                                        ...(updated[idx].attributes || {}),
                                        [f.name]: e.target.value,
                                      },
                                    };
                                    setEditingTx({
                                      ...editingTx,
                                      baleItemsList: updated,
                                    } as Transaction);
                                  }}
                                  className="w-full border rounded-xl p-3 font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                >
                                  <option value="">Select</option>
                                  {(f.options || []).map((o) => (
                                    <option key={o} value={o}>
                                      {o}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={bi.attributes?.[f.name] || ""}
                                  onChange={(e) => {
                                    const updated = [
                                      ...(editingTx.baleItemsList || []),
                                    ];
                                    updated[idx] = {
                                      ...updated[idx],
                                      attributes: {
                                        ...(updated[idx].attributes || {}),
                                        [f.name]: e.target.value,
                                      },
                                    };
                                    setEditingTx({
                                      ...editingTx,
                                      baleItemsList: updated,
                                    } as Transaction);
                                  }}
                                  className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    {/* Shop Qty */}
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                        Shop Qty
                      </p>
                      <input
                        type="number"
                        value={bi.shopQty ?? ""}
                        onChange={(e) => {
                          const updated = [...(editingTx.baleItemsList || [])];
                          updated[idx] = {
                            ...updated[idx],
                            shopQty: Number(e.target.value) || 0,
                          };
                          setEditingTx({
                            ...editingTx,
                            baleItemsList: updated,
                          } as Transaction);
                        }}
                        className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* Godown Qtys */}
                    {godowns.map((g) => (
                      <div key={g}>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                          {g}
                        </p>
                        <input
                          type="number"
                          value={bi.godownQuants?.[g] ?? ""}
                          onChange={(e) => {
                            const updated = [
                              ...(editingTx.baleItemsList || []),
                            ];
                            updated[idx] = {
                              ...updated[idx],
                              godownQuants: {
                                ...(updated[idx].godownQuants || {}),
                                [g]: Number(e.target.value) || 0,
                              },
                            };
                            setEditingTx({
                              ...editingTx,
                              baleItemsList: updated,
                            } as Transaction);
                          }}
                          className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                    {/* Per-item total */}
                    <p className="text-[10px] font-black text-blue-700">
                      Item Total:{" "}
                      {(bi.shopQty || 0) +
                        Object.values(bi.godownQuants || {}).reduce(
                          (a, b) => a + (b || 0),
                          0,
                        )}{" "}
                      pcs
                    </p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setEditingTx({
                      ...editingTx,
                      baleItemsList: [
                        ...(editingTx.baleItemsList || []),
                        {
                          itemName: "",
                          category: "",
                          attributes: {},
                          qty: 0,
                          shopQty: 0,
                          godownQuants: {},
                        },
                      ],
                    } as Transaction)
                  }
                  className="w-full border-2 border-dashed border-blue-300 text-blue-600 font-black text-[10px] uppercase py-3 rounded-2xl hover:bg-blue-50 transition-colors"
                >
                  + Add Item
                </button>
              </div>
              {/* Qty validation */}
              {editingTx.totalQtyInBale &&
                editingTx.baleItemsList &&
                editingTx.baleItemsList.length > 0 &&
                (() => {
                  const distributed = (editingTx.baleItemsList || []).reduce(
                    (sum, bi) =>
                      sum +
                      (bi.shopQty || 0) +
                      Object.values(bi.godownQuants || {}).reduce(
                        (a, b) => a + (b || 0),
                        0,
                      ),
                    0,
                  );
                  const expected = editingTx.totalQtyInBale;
                  return distributed === expected ? (
                    <p className="text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
                      ✓ Qty matches: {distributed}/{expected}
                    </p>
                  ) : (
                    <p className="text-[10px] font-black text-orange-700 bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl">
                      ⚠ Qty mismatch: {distributed}/{expected}
                    </p>
                  );
                })()}
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
                  Notes
                </p>
                <input
                  type="text"
                  value={editingTx.notes || ""}
                  onChange={(e) =>
                    setEditingTx({
                      ...editingTx,
                      notes: e.target.value,
                    } as Transaction)
                  }
                  className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="flex-1 bg-gray-100 text-gray-600 font-black py-3 rounded-2xl uppercase text-[10px] tracking-widest"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  // Recalculate itemsCount from baleItemsList
                  const updatedTx = {
                    ...editingTx,
                    itemsCount:
                      editingTx.totalQtyInBale ??
                      (editingTx.baleItemsList || []).reduce(
                        (sum, bi) =>
                          sum +
                          (bi.shopQty || 0) +
                          Object.values(bi.godownQuants || {}).reduce(
                            (a, b) => a + (b || 0),
                            0,
                          ),
                        0,
                      ),
                  };
                  setTransactions((prev) =>
                    prev.map((tx) => (tx.id === editingTx.id ? updatedTx : tx)),
                  );
                  setEditingTx(null);
                  showNotification("Entry updated successfully", "success");
                }}
                className="flex-1 bg-blue-600 text-white font-black py-3 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bilty Journey Modal - Enhanced Timeline */}
      {selectedBiltyForHistory &&
        (() => {
          const bNo = selectedBiltyForHistory;
          const baseBno = bNo.replace(/X\d+\(\d+\)$/i, "").toLowerCase();
          const transitEntry = (transitGoods || []).find(
            (g) =>
              (g.biltyNo?.toLowerCase() === bNo.toLowerCase() ||
                g.biltyNo?.toLowerCase() === baseBno) &&
              (!g.businessId || g.businessId === activeBusinessId),
          );
          const queueEntry = (pendingParcels || []).find(
            (p) =>
              (p.biltyNo?.toLowerCase() === bNo.toLowerCase() ||
                p.biltyNo?.toLowerCase() === baseBno) &&
              (!p.businessId || p.businessId === activeBusinessId),
          );
          // All inward transactions for this bilty (multi-bale each gets its own tx)
          const inwardEntries = transactions.filter(
            (t) =>
              t.biltyNo?.toLowerCase() === bNo.toLowerCase() &&
              (t.type === "INWARD" || t.type === "inward") &&
              (!t.businessId || t.businessId === activeBusinessId),
          );
          const inwardEntry = inwardEntries[0] || null;
          return (
            <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-down">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-5 flex justify-between items-center rounded-t-[2.5rem] z-10">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Bilty Journey
                    </p>
                    <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight">
                      {bNo}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBiltyForHistory(null)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                {/* Timeline */}
                <div className="p-6 space-y-0">
                  {/* --- TRANSIT CHECKPOINT --- */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-xs shadow-md ${transitEntry ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"}`}
                      >
                        1
                      </div>
                      <div className="w-0.5 bg-gray-200 flex-1 mt-1 mb-1 min-h-[32px]" />
                    </div>
                    <div
                      className={`flex-1 mb-4 p-4 rounded-2xl border ${transitEntry ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-dashed border-gray-200 opacity-60"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${transitEntry ? "bg-indigo-600 text-white" : "bg-gray-300 text-gray-500"}`}
                        >
                          Transit
                        </span>
                        {transitEntry?.date && (
                          <span className="text-[10px] font-bold text-indigo-600">
                            {transitEntry.date}
                          </span>
                        )}
                      </div>
                      {transitEntry ? (
                        <div className="text-[10px] font-bold text-gray-700 space-y-1">
                          <p>
                            Added by:{" "}
                            <b className="text-gray-900">
                              {transitEntry.addedBy || "—"}
                            </b>
                          </p>
                          {transitEntry.transportName && (
                            <p>
                              Transport:{" "}
                              <b className="text-gray-900">
                                {transitEntry.transportName}
                              </b>
                            </p>
                          )}
                          {transitEntry.supplierName && (
                            <p>
                              Supplier:{" "}
                              <b className="text-gray-900">
                                {transitEntry.supplierName}
                              </b>
                            </p>
                          )}
                          {transitEntry.itemCategory && (
                            <p>
                              Category:{" "}
                              <b className="text-gray-900">
                                {transitEntry.itemCategory}
                              </b>
                            </p>
                          )}
                          {transitEntry.itemName && (
                            <p>
                              Item:{" "}
                              <b className="text-gray-900">
                                {transitEntry.itemName}
                              </b>
                            </p>
                          )}
                          {transitEntry.packages &&
                            Number(transitEntry.packages) > 1 && (
                              <p>
                                Packages:{" "}
                                <b className="text-indigo-700">
                                  {transitEntry.packages}
                                </b>
                              </p>
                            )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 font-bold">
                          Not in Transit
                        </p>
                      )}
                    </div>
                  </div>
                  {/* --- QUEUE CHECKPOINT --- */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-xs shadow-md ${queueEntry ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-400"}`}
                      >
                        2
                      </div>
                      <div className="w-0.5 bg-gray-200 flex-1 mt-1 mb-1 min-h-[32px]" />
                    </div>
                    <div
                      className={`flex-1 mb-4 p-4 rounded-2xl border ${queueEntry ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-dashed border-gray-200 opacity-60"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${queueEntry ? "bg-amber-500 text-white" : "bg-gray-300 text-gray-500"}`}
                        >
                          Arrived / Queue
                        </span>
                        {(queueEntry?.arrivalDate ||
                          queueEntry?.dateReceived) && (
                          <span className="text-[10px] font-bold text-amber-600">
                            {queueEntry.arrivalDate || queueEntry.dateReceived}
                          </span>
                        )}
                      </div>
                      {queueEntry ? (
                        <div className="text-[10px] font-bold text-gray-700 space-y-1">
                          {queueEntry.supplier && (
                            <p>
                              Supplier:{" "}
                              <b className="text-gray-900">
                                {queueEntry.supplier}
                              </b>
                            </p>
                          )}
                          {queueEntry.transportName && (
                            <p>
                              Transport:{" "}
                              <b className="text-gray-900">
                                {queueEntry.transportName}
                              </b>
                            </p>
                          )}
                          {queueEntry.itemCategory && (
                            <p>
                              Category:{" "}
                              <b className="text-gray-900">
                                {queueEntry.itemCategory}
                              </b>
                            </p>
                          )}
                          {queueEntry.itemName && (
                            <p>
                              Item:{" "}
                              <b className="text-gray-900">
                                {queueEntry.itemName}
                              </b>
                            </p>
                          )}
                          {queueEntry.packages &&
                            Number(queueEntry.packages) > 1 && (
                              <p>
                                Packages:{" "}
                                <b className="text-amber-700">
                                  {queueEntry.packages}
                                </b>
                              </p>
                            )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 font-bold">
                          Not in Queue
                        </p>
                      )}
                    </div>
                  </div>
                  {/* --- INWARD CHECKPOINT --- */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-xs shadow-md ${inwardEntry ? "bg-green-600 text-white" : "bg-gray-200 text-gray-400"}`}
                      >
                        3
                      </div>
                    </div>
                    <div
                      className={`flex-1 mb-4 p-4 rounded-2xl border ${inwardEntry ? "bg-green-50 border-green-200" : "bg-gray-50 border-dashed border-gray-200 opacity-60"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${inwardEntry ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"}`}
                        >
                          Inward / Opened
                        </span>
                        {inwardEntry?.date && (
                          <span className="text-[10px] font-bold text-green-600">
                            {inwardEntry.date?.split("T")[0] ||
                              inwardEntry.date}
                          </span>
                        )}
                      </div>
                      {inwardEntry ? (
                        <div className="text-[10px] font-bold text-gray-700 space-y-2">
                          <p>
                            Opened by:{" "}
                            <b className="text-gray-900">{inwardEntry.user}</b>
                          </p>
                          {inwardEntry.transportName && (
                            <p>
                              Transport:{" "}
                              <b className="text-gray-900">
                                {inwardEntry.transportName}
                              </b>
                            </p>
                          )}
                          {(inwardEntry.itemsCount ?? 0) > 0 && (
                            <p>
                              Total Qty in Bale:{" "}
                              <b className="text-green-700">
                                {inwardEntry.itemsCount} pcs
                              </b>
                            </p>
                          )}
                          {/* Bale Items with storage distribution */}
                          {inwardEntry.baleItemsList &&
                            inwardEntry.baleItemsList.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-[10px] font-black uppercase text-green-800 tracking-widest">
                                  Items Received
                                </p>
                                {inwardEntry.baleItemsList.map((bi, biIdx) => (
                                  <div
                                    key={`${bi.itemName}-${bi.category}-${biIdx}`}
                                    className="bg-white border border-green-200 rounded-xl p-3 space-y-1"
                                  >
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-black text-gray-900">
                                        {bi.itemName}
                                      </span>
                                      <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                        {bi.category}
                                      </span>
                                      <span className="text-[9px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        Qty: {bi.qty}
                                      </span>
                                    </div>
                                    {Object.entries(bi.attributes || {})
                                      .filter(([, v]) => v)
                                      .map(([k, v]) => (
                                        <span
                                          key={k}
                                          className="inline-block mr-2 text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-full"
                                        >
                                          {k}: {v}
                                        </span>
                                      ))}
                                    {/* Storage distribution */}
                                    <div className="flex gap-2 flex-wrap mt-1">
                                      {(bi.shopQty || 0) > 0 && (
                                        <span className="text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg">
                                          🏪 Shop: {bi.shopQty}
                                        </span>
                                      )}
                                      {Object.entries(bi.godownQuants || {})
                                        .filter(([, v]) => (v || 0) > 0)
                                        .map(([g, v]) => (
                                          <span
                                            key={g}
                                            className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg"
                                          >
                                            🏭 {g}: {v}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 font-bold">
                          Not yet opened in Inward
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <button
                    type="button"
                    onClick={() => setSelectedBiltyForHistory(null)}
                    className="w-full bg-gray-100 text-gray-700 font-black py-3 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

/* ================= SETTINGS TAB ================= */
interface EditingCategory {
  originalName: string;
  name: string;
  fields: (CategoryField & { optionsStr?: string })[];
}

/* ================= STOCK OVERWRITE TABLE ================= */
function StockOverwriteTable({
  inventory,
  setInventory,
  godowns,
  activeBusinessId,
  setTransactions,
  currentUser,
  showNotification,
}: {
  inventory: Record<string, InventoryItem>;
  setInventory: React.Dispatch<
    React.SetStateAction<Record<string, InventoryItem>>
  >;
  godowns: string[];
  activeBusinessId: string;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  currentUser: AppUser;
  showNotification: (m: string, t?: string) => void;
}) {
  const items = Object.values(inventory).filter(
    (item) => !item.businessId || item.businessId === activeBusinessId,
  );

  const [edits, setEdits] = useState<
    Record<string, { shop: number; godowns: Record<string, number> }>
  >(() => {
    const initial: Record<
      string,
      { shop: number; godowns: Record<string, number> }
    > = {};
    for (const item of items) {
      initial[item.sku] = {
        shop: item.shop,
        godowns: { ...item.godowns },
      };
    }
    return initial;
  });

  const handleOverwrite = (sku: string) => {
    const edit = edits[sku];
    if (!edit) return;
    const oldItem = inventory[sku];
    setInventory((prev) => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        shop: edit.shop,
        godowns: { ...edit.godowns },
      },
    }));
    setTransactions((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "STOCK_OVERWRITE",
        sku,
        itemName: oldItem.itemName,
        category: oldItem.category,
        notes: `Overwrite: shop=${edit.shop}, godowns=${JSON.stringify(edit.godowns)}`,
        date: new Date().toISOString(),
        user: currentUser.username,
        businessId: activeBusinessId,
      } as Transaction,
    ]);
    showNotification(`Stock overwritten for ${oldItem.itemName}`);
  };

  const handleOverwriteAll = () => {
    const updates: Record<string, InventoryItem> = {};
    const newTxns: Transaction[] = [];
    for (const item of items) {
      const edit = edits[item.sku];
      if (!edit) return;
      updates[item.sku] = {
        ...item,
        shop: edit.shop,
        godowns: { ...edit.godowns },
      };
      newTxns.push({
        id: Date.now() + Math.random(),
        type: "STOCK_OVERWRITE",
        sku: item.sku,
        itemName: item.itemName,
        category: item.category,
        notes: `Bulk overwrite: shop=${edit.shop}, godowns=${JSON.stringify(edit.godowns)}`,
        date: new Date().toISOString(),
        user: currentUser.username,
        businessId: activeBusinessId,
      } as Transaction);
    }
    setInventory((prev) => ({ ...prev, ...updates }));
    setTransactions((prev) => [...prev, ...newTxns]);
    showNotification("All stock values overwritten");
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={handleOverwriteAll}
          data-ocid="stock.overwrite_all.button"
          className="bg-orange-600 text-white font-black py-2 px-6 rounded-xl text-[10px] uppercase tracking-widest shadow-md hover:bg-orange-700 transition-colors"
        >
          Overwrite All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-bold">
          <thead>
            <tr className="border-b text-gray-400 uppercase tracking-widest text-[10px]">
              <th className="text-left py-2 pr-4">Item</th>
              <th className="text-left py-2 pr-4">Shop Qty</th>
              {godowns.map((g) => (
                <th key={g} className="text-left py-2 pr-4">
                  {g}
                </th>
              ))}
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const edit = edits[item.sku] ?? {
                shop: item.shop,
                godowns: { ...item.godowns },
              };
              return (
                <tr
                  key={item.sku}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 pr-4">
                    <div>{item.itemName}</div>
                    <div className="text-[9px] text-gray-400 font-mono">
                      {item.category}
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      min={0}
                      value={edit.shop}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [item.sku]: {
                            ...prev[item.sku],
                            shop: Number(e.target.value),
                          },
                        }))
                      }
                      className="border rounded-lg p-1.5 w-20 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center"
                    />
                  </td>
                  {godowns.map((g) => (
                    <td key={g} className="py-2 pr-2">
                      <input
                        type="number"
                        min={0}
                        value={edit.godowns[g] ?? 0}
                        onChange={(e) =>
                          setEdits((prev) => ({
                            ...prev,
                            [item.sku]: {
                              ...prev[item.sku],
                              godowns: {
                                ...prev[item.sku].godowns,
                                [g]: Number(e.target.value),
                              },
                            },
                          }))
                        }
                        className="border rounded-lg p-1.5 w-20 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center"
                      />
                    </td>
                  ))}
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => handleOverwrite(item.sku)}
                      data-ocid="stock.overwrite.button"
                      className="bg-blue-600 text-white font-black py-1.5 px-4 rounded-xl text-[10px] uppercase tracking-widest shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      Overwrite
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= OPENING STOCK TAB ================= */
function OpeningStockTab({
  inventory,
  setInventory,
  categories,
  godowns,
  setTransactions,
  activeBusinessId,
  currentUser,
  showNotification,
}: {
  inventory: Record<string, InventoryItem>;
  setInventory: React.Dispatch<
    React.SetStateAction<Record<string, InventoryItem>>
  >;
  categories: Category[];
  godowns: string[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  activeBusinessId: string;
  currentUser: AppUser;
  showNotification: (m: string, t?: string) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [refNote, setRefNote] = useState("");
  const [date, setDate] = useState(today);
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.name || "",
  );
  const [itemName, setItemName] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [shopQty, setShopQty] = useState(0);
  const [saleRate, setSaleRate] = useState(0);
  const [purchaseRate, setPurchaseRate] = useState(0);
  const [priceSuggestions, setPriceSuggestions] = useState<
    { sale: number; purchase: number }[]
  >([]);
  const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
  const [godownQtys, setGodownQtys] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const g of godowns) {
      init[g] = 0;
    }
    return init;
  });

  const currentCategory = categories.find((c) => c.name === selectedCategory);

  const resetForm = () => {
    setRefNote("");
    setDate(today);
    setItemName("");
    setAttributes({});
    setShopQty(0);
    setSaleRate(0);
    setPurchaseRate(0);
    setPriceSuggestions([]);
    const init: Record<string, number> = {};
    for (const g of godowns) {
      init[g] = 0;
    }
    setGodownQtys(init);
  };

  const handleItemNameChange = (name: string) => {
    setItemName(name);
    // Auto-suggest prices from existing inventory
    const term = name.toLowerCase().trim();
    if (term.length > 1) {
      const matches = Object.values(inventory).filter(
        (i) =>
          i.itemName?.toLowerCase().includes(term) &&
          (!i.businessId || i.businessId === activeBusinessId),
      );
      const unique: { sale: number; purchase: number }[] = [];
      for (const m of matches) {
        if (
          !unique.some(
            (u) => u.sale === m.saleRate && u.purchase === m.purchaseRate,
          )
        ) {
          unique.push({ sale: m.saleRate, purchase: m.purchaseRate });
        }
      }
      setPriceSuggestions(unique.slice(0, 5));
      setShowPriceSuggestions(unique.length > 0);
    } else {
      setPriceSuggestions([]);
      setShowPriceSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !selectedCategory) {
      showNotification("Item name and category are required", "error");
      return;
    }
    const sku = `SKU_${selectedCategory}_${itemName.trim()}_${Date.now()}`;
    // Check if similar item exists (same category + itemName + attrs)
    const existing = Object.values(inventory).find(
      (item) =>
        item.businessId === activeBusinessId &&
        item.category === selectedCategory &&
        item.itemName.toLowerCase() === itemName.trim().toLowerCase(),
    );
    if (existing) {
      // Merge quantities
      setInventory((prev) => ({
        ...prev,
        [existing.sku]: {
          ...prev[existing.sku],
          shop: (prev[existing.sku].shop || 0) + shopQty,
          godowns: Object.fromEntries(
            godowns.map((g) => [
              g,
              (prev[existing.sku].godowns?.[g] || 0) + (godownQtys[g] || 0),
            ]),
          ),
        },
      }));
      setTransactions((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "OPENING_STOCK",
          sku: existing.sku,
          itemName: existing.itemName,
          category: existing.category,
          notes: `Opening stock entry. Ref: ${refNote || "N/A"}. Date: ${date}. shop+${shopQty}, ${godowns.map((g) => `${g}+${godownQtys[g] || 0}`).join(", ")}`,
          date: new Date().toISOString(),
          user: currentUser.username,
          businessId: activeBusinessId,
        } as Transaction,
      ]);
      showNotification(
        `Opening stock added to existing item: ${existing.itemName}`,
      );
    } else {
      const newItem: InventoryItem = {
        sku,
        category: selectedCategory,
        itemName: itemName.trim(),
        attributes,
        shop: shopQty,
        godowns: { ...godownQtys },
        saleRate: saleRate,
        purchaseRate: purchaseRate,
        businessId: activeBusinessId,
      };
      setInventory((prev) => ({ ...prev, [sku]: newItem }));
      setTransactions((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "OPENING_STOCK",
          sku,
          itemName: itemName.trim(),
          category: selectedCategory,
          notes: `Opening stock entry. Ref: ${refNote || "N/A"}. Date: ${date}. shop=${shopQty}, ${godowns.map((g) => `${g}=${godownQtys[g] || 0}`).join(", ")}`,
          date: new Date().toISOString(),
          user: currentUser.username,
          businessId: activeBusinessId,
        } as Transaction,
      ]);
      showNotification(`Opening stock entered: ${itemName.trim()}`);
    }
    resetForm();
  };

  return (
    <div className="space-y-6 animate-fade-in-down">
      <div className="flex items-center gap-3 mb-2">
        <PackagePlus className="text-emerald-600" size={28} />
        <div>
          <h2 className="text-2xl font-black text-gray-900">Opening Stock</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Enter pre-existing stock without bilty number
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          type="button"
          onClick={() => {
            const headers = [
              "Category",
              "ItemName",
              "RefNote",
              "Date",
              "ShopQty",
              "SaleRate",
              "PurchaseRate",
              ...godowns,
            ];
            const sample = [
              categories[0]?.name || "Safi",
              "Sample Item",
              "Opening Balance",
              new Date().toISOString().split("T")[0],
              "10",
              "100",
              "80",
              ...godowns.map(() => "5"),
            ];
            const csv = [headers.join(","), sample.join(",")].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "opening_stock_template.csv";
            a.click();
          }}
          className="flex items-center gap-2 bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-200"
        >
          <Download size={14} /> Download Template
        </button>
        <label
          htmlFor="opening-stock-csv"
          className="flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer hover:bg-blue-200"
        >
          <Upload size={14} /> Upload Stock CSV
        </label>
        <input
          id="opening-stock-csv"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              const csv = ev.target?.result as string;
              const rows = csv.split(/\r?\n/).filter((l) => l.trim());
              // header row skipped
              let count = 0;
              for (let i = 1; i < rows.length; i++) {
                const cols = rows[i].split(",").map((c) => c.trim());
                if (!cols[0] || !cols[1]) continue;
                const cat = cols[0];
                const iName = cols[1];
                const ref = cols[2] || "";
                const dt = cols[3] || new Date().toISOString().split("T")[0];
                const shopQ = Number(cols[4] || 0);
                const sale = Number(cols[5] || 0);
                const purch = Number(cols[6] || 0);
                const gQtys: Record<string, number> = {};
                for (let j = 0; j < godowns.length; j++) {
                  gQtys[godowns[j]] = Number(cols[7 + j] || 0);
                }
                const sku = `SKU_${cat}_${iName.trim()}_${Date.now()}_${i}`;
                const existing = Object.values(inventory).find(
                  (x) =>
                    (!x.businessId || x.businessId === activeBusinessId) &&
                    x.category === cat &&
                    x.itemName.toLowerCase() === iName.trim().toLowerCase(),
                );
                if (existing) {
                  setInventory((prev) => ({
                    ...prev,
                    [existing.sku]: {
                      ...prev[existing.sku],
                      shop: (prev[existing.sku].shop || 0) + shopQ,
                      godowns: Object.fromEntries(
                        godowns.map((g) => [
                          g,
                          (prev[existing.sku].godowns?.[g] || 0) +
                            (gQtys[g] || 0),
                        ]),
                      ),
                    },
                  }));
                } else {
                  setInventory((prev) => ({
                    ...prev,
                    [sku]: {
                      sku,
                      category: cat,
                      itemName: iName.trim(),
                      attributes: {},
                      shop: shopQ,
                      godowns: { ...gQtys },
                      saleRate: sale,
                      purchaseRate: purch,
                      businessId: activeBusinessId,
                    },
                  }));
                }
                setTransactions((prev) => [
                  ...prev,
                  {
                    id: Date.now() + i,
                    type: "OPENING_STOCK",
                    sku: existing?.sku || sku,
                    itemName: iName.trim(),
                    category: cat,
                    notes: `CSV import. Ref: ${ref}. Date: ${dt}`,
                    date: new Date().toISOString(),
                    user: currentUser.username,
                    businessId: activeBusinessId,
                  } as Transaction,
                ]);
                count++;
              }
              showNotification(`Imported ${count} items`, "success");
            };
            reader.readAsText(file);
            e.target.value = "";
          }}
        />
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm max-w-2xl">
        <h4 className="font-black text-xs uppercase tracking-widest text-emerald-900 mb-6">
          Add Stock Entry
        </h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Reference Note (optional)
              </p>
              <input
                type="text"
                value={refNote}
                onChange={(e) => setRefNote(e.target.value)}
                placeholder="e.g. Opening balance Apr 2025"
                data-ocid="opening.ref_note.input"
                className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Date
              </p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-ocid="opening.date.input"
                className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
              Category
            </p>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setAttributes({});
              }}
              data-ocid="opening.category.select"
              className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
            >
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <ItemNameComboOpening
              categories={categories}
              selectedCategory={selectedCategory}
              value={itemName}
              onChange={(val) => handleItemNameChange(val)}
              inventory={inventory}
              activeBusinessId={activeBusinessId}
              showPriceSuggestions={showPriceSuggestions}
              priceSuggestions={priceSuggestions}
              onSelectPrice={(sale, purchase) => {
                setSaleRate(sale);
                setPurchaseRate(purchase);
                setShowPriceSuggestions(false);
              }}
            />
          </div>

          {currentCategory?.fields.map((field) => (
            <div key={field.name}>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                {field.name}
              </p>
              {field.type === "select" ? (
                <select
                  value={attributes[field.name] || ""}
                  onChange={(e) =>
                    setAttributes((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
                >
                  <option value="">-- Select --</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  value={attributes[field.name] || ""}
                  onChange={(e) =>
                    setAttributes((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
                />
              )}
            </div>
          ))}

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
              Quantities
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1">
                  Shop
                </p>
                <input
                  type="number"
                  min={0}
                  value={shopQty}
                  onChange={(e) => setShopQty(Number(e.target.value))}
                  data-ocid="opening.shop_qty.input"
                  className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-center"
                />
              </div>
              {godowns.map((g) => (
                <div key={g}>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest block mb-1">
                    {g}
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={godownQtys[g] ?? 0}
                    onChange={(e) =>
                      setGodownQtys((prev) => ({
                        ...prev,
                        [g]: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Sale Rate (₹)
              </p>
              <input
                type="number"
                value={saleRate}
                onChange={(e) => setSaleRate(Number(e.target.value))}
                min={0}
                className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Purchase Rate (₹)
              </p>
              <input
                type="number"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(Number(e.target.value))}
                min={0}
                className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            data-ocid="opening.submit_button"
            className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg hover:bg-emerald-700 transition-colors"
          >
            Add to Stock
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsTab({
  users,
  setUsers,
  categories,
  setCategories,
  customColumns,
  setCustomColumns,
  setPromptDialog,
  setConfirmDialog,
  exportDatabase,
  importDatabase,
  showNotification,
  businesses,
  setBusinesses,
  activeBusinessId,
  setActiveBusinessId,
  inventory,
  setInventory,
  godowns,
  setGodowns,
  minStockThreshold,
  setMinStockThreshold,
  setTransactions,
  currentUser: settingsCurrentUser,
  transportTracking,
  setTransportTracking,
  tabNames,
  setTabNames,
  fieldLabels,
  setFieldLabels,
  requiredFields,
  setRequiredFields,
  fieldOrder,
  setFieldOrder,
  thresholdExcludedItems = [],
  setThresholdExcludedItems,
}: {
  users: AppUser[];
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  customColumns: CustomColumns;
  setCustomColumns: React.Dispatch<React.SetStateAction<CustomColumns>>;
  setPromptDialog: (
    d: {
      message: string;
      defaultValue?: string;
      onConfirm: (v: string) => void;
    } | null,
  ) => void;
  setConfirmDialog: (
    d: { message: string; onConfirm: () => void } | null,
  ) => void;
  exportDatabase: () => void;
  importDatabase: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showNotification: (m: string, t?: string) => void;
  businesses: Business[];
  setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>;
  activeBusinessId: string;
  setActiveBusinessId: (id: string) => void;
  inventory: Record<string, InventoryItem>;
  setInventory: React.Dispatch<
    React.SetStateAction<Record<string, InventoryItem>>
  >;
  godowns: string[];
  setGodowns: React.Dispatch<React.SetStateAction<string[]>>;
  minStockThreshold: number;
  setMinStockThreshold: React.Dispatch<React.SetStateAction<number>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  currentUser: AppUser;
  transportTracking: Record<string, string>;
  setTransportTracking: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  tabNames: Record<string, string>;
  setTabNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  fieldLabels: Record<string, Record<string, string>>;
  setFieldLabels: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, string>>>
  >;
  requiredFields: Record<string, Record<string, boolean>>;
  setRequiredFields: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, boolean>>>
  >;
  fieldOrder: Record<string, string[]>;
  setFieldOrder: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  thresholdExcludedItems?: string[];
  setThresholdExcludedItems?: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [activeSub, setActiveSub] = useState("users");
  const [selectedFieldTab, setSelectedFieldTab] = useState("transit");
  const [newUser, setNewUser] = useState<AppUser>({
    username: "",
    password: "",
    role: "staff",
  });
  const [editUser, setEditUser] = useState<{ oldName: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{
    tab: keyof CustomColumns;
    oldName: string;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("text");
  const [editingCategoryFull, setEditingCategoryFull] =
    useState<EditingCategory | null>(null);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      setUsers((prev) =>
        prev.map((u) => (u.username === editUser.oldName ? { ...newUser } : u)),
      );
      setEditUser(null);
      showNotification("User Updated");
    } else {
      setUsers((prev) => [...prev, newUser]);
      showNotification("User Created");
    }
    setNewUser({ username: "", password: "", role: "staff" });
  };

  const handleUpdateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editTarget) return;
    const { tab, oldName } = editTarget;
    setCustomColumns((prev) => ({
      ...prev,
      [tab]: prev[tab].map((c) =>
        c.name === oldName ? { name: editName, type: editType } : c,
      ),
    }));
    setEditTarget(null);
    showNotification("Column Updated");
  };

  const handleSaveCategory = () => {
    if (!editingCategoryFull?.name.trim())
      return showNotification("Name required", "error");
    const fieldsToSave: CategoryField[] = editingCategoryFull.fields.map(
      (f) => ({
        name: f.name.trim(),
        type: f.type,
        options:
          f.type === "select"
            ? (f.optionsStr || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
      }),
    );
    setCategories((prev) =>
      prev.map((c) =>
        c.name === editingCategoryFull.originalName
          ? { name: editingCategoryFull.name.trim(), fields: fieldsToSave }
          : c,
      ),
    );
    setEditingCategoryFull(null);
    showNotification("Category Settings Saved");
  };

  return (
    <div className="space-y-6 animate-fade-in-down relative">
      <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-inner overflow-x-auto scrollbar-hide">
        {(
          [
            "businesses",
            "stock",
            "godowns",
            "tracking",
            "tabnames",
            "fieldlabels",
            "users",
            "columns",
            "threshold",
            "data",
          ] as const
        ).map((sub) => (
          <button
            type="button"
            key={sub}
            onClick={() => setActiveSub(sub as string)}
            className={`flex-none py-3 px-4 rounded-2xl transition-all whitespace-nowrap text-[10px] ${activeSub === sub ? "bg-blue-600 text-white shadow-lg" : "text-gray-500"}`}
          >
            {sub === "businesses"
              ? "Business"
              : sub === "stock"
                ? "Stock Control"
                : sub === "godowns"
                  ? "Godowns"
                  : sub === "tracking"
                    ? "Tracking"
                    : sub === "tabnames"
                      ? "Tab Names"
                      : sub === "fieldlabels"
                        ? "Field Labels"
                        : sub === "users"
                          ? "Logins"
                          : sub === "columns"
                            ? "Forms"
                            : sub === "threshold"
                              ? "Thresholds"
                              : "System Data"}
          </button>
        ))}
      </div>

      {editTarget && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm animate-fade-in-down">
            <h3 className="font-black uppercase tracking-widest text-xs mb-6 text-blue-900 border-b pb-2">
              Edit Column
            </h3>
            <form onSubmit={handleUpdateColumn} className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full border rounded-xl p-3 outline-none font-bold bg-gray-50"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="flex-1 bg-gray-100 text-gray-600 font-black py-3 rounded-xl uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSub === "businesses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-black text-xs uppercase tracking-widest text-blue-900">
                Business Profiles
              </h4>
              <button
                type="button"
                onClick={() =>
                  setPromptDialog({
                    message: "New Business Name?",
                    onConfirm: (name) => {
                      if (name) {
                        const newId = `biz_${Date.now()}`;
                        setBusinesses((prev) => [...prev, { id: newId, name }]);
                        setActiveBusinessId(newId);
                      }
                    },
                  })
                }
                className="bg-blue-100 text-blue-700 p-2 rounded-xl"
              >
                <PlusCircle size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {businesses.map((b) => (
                <div
                  key={b.id}
                  className="flex justify-between items-center bg-gray-50 border p-4 rounded-2xl font-bold text-sm hover:border-blue-200 transition-colors"
                >
                  <span>
                    {b.name}{" "}
                    {activeBusinessId === b.id && (
                      <span className="text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase ml-2">
                        Active
                      </span>
                    )}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPromptDialog({
                          message: "Edit Business Name:",
                          defaultValue: b.name,
                          onConfirm: (name) => {
                            if (name)
                              setBusinesses((prev) =>
                                prev.map((x) =>
                                  x.id === b.id ? { ...x, name } : x,
                                ),
                              );
                          },
                        })
                      }
                      className="text-blue-500 bg-white p-2 rounded-lg shadow-sm hover:bg-blue-50"
                    >
                      <Edit size={14} />
                    </button>
                    {businesses.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDialog({
                            message: "Delete Business Profile?",
                            onConfirm: () => {
                              const fallback = businesses.find(
                                (x) => x.id !== b.id,
                              );
                              setBusinesses((prev) =>
                                prev.filter((x) => x.id !== b.id),
                              );
                              if (activeBusinessId === b.id && fallback)
                                setActiveBusinessId(fallback.id);
                            },
                          })
                        }
                        className="text-red-400 bg-white p-2 rounded-lg shadow-sm hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSub === "stock" && (
        <div className="space-y-8">
          {/* Global Threshold */}
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <h4 className="font-black text-xs uppercase tracking-widest text-blue-900 mb-2">
              Global Low Stock Threshold
            </h4>
            <p className="text-xs text-gray-500 font-bold mb-4">
              Items below this total quantity are flagged as low stock (unless
              overridden per item)
            </p>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={0}
                value={minStockThreshold}
                onChange={(e) => setMinStockThreshold(Number(e.target.value))}
                className="border rounded-xl p-3 font-black text-lg w-28 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center"
              />
              <span className="text-xs font-bold text-gray-400">units</span>
            </div>
          </div>

          {/* Per-Item Threshold Overrides */}
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <h4 className="font-black text-xs uppercase tracking-widest text-blue-900 mb-4">
              Per-Item Threshold Overrides
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-bold">
                <thead>
                  <tr className="border-b text-gray-400 uppercase tracking-widest">
                    <th className="text-left py-2 pr-4">Item Name</th>
                    <th className="text-left py-2 pr-4">Category</th>
                    <th className="text-left py-2 pr-4">SKU</th>
                    <th className="text-left py-2 pr-4">Current Threshold</th>
                    <th className="text-left py-2 pr-4">Override</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {Object.values(inventory)
                    .filter(
                      (item) =>
                        !item.businessId ||
                        item.businessId === activeBusinessId,
                    )
                    .map((item) => (
                      <tr
                        key={item.sku}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 pr-4">{item.itemName}</td>
                        <td className="py-2 pr-4">{item.category}</td>
                        <td className="py-2 pr-4 text-gray-400 font-mono text-[10px]">
                          {item.sku.substring(0, 16)}...
                        </td>
                        <td className="py-2 pr-4">
                          {item.minThreshold != null ? (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {item.minThreshold}
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              Global ({minStockThreshold})
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            placeholder="Override..."
                            defaultValue={item.minThreshold ?? ""}
                            className="border rounded-lg p-1.5 w-24 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-center"
                            onChange={(e) => {
                              const val =
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value);
                              setInventory((prev) => ({
                                ...prev,
                                [item.sku]: {
                                  ...prev[item.sku],
                                  minThreshold: val,
                                },
                              }));
                            }}
                          />
                        </td>
                        <td className="py-2">
                          {item.minThreshold != null && (
                            <button
                              type="button"
                              onClick={() =>
                                setInventory((prev) => {
                                  const copy = {
                                    ...prev,
                                    [item.sku]: { ...prev[item.sku] },
                                  };
                                  copy[item.sku].minThreshold = undefined;
                                  return copy;
                                })
                              }
                              className="text-red-400 hover:text-red-600 text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-lg hover:bg-red-50"
                            >
                              Clear
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  {Object.values(inventory).filter(
                    (item) =>
                      !item.businessId || item.businessId === activeBusinessId,
                  ).length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-400"
                      >
                        No inventory items yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Overwrite Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <h4 className="font-black text-xs uppercase tracking-widest text-blue-900 mb-1">
              Direct Stock Overwrite
            </h4>
            <p className="text-xs text-gray-500 font-bold mb-4">
              Set exact quantity values for any item — overwrites current stock
              and logs to history.
            </p>
            {Object.values(inventory).filter(
              (item) =>
                !item.businessId || item.businessId === activeBusinessId,
            ).length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-xs font-bold">
                No inventory items yet
              </p>
            ) : (
              <StockOverwriteTable
                inventory={inventory}
                setInventory={setInventory}
                godowns={godowns}
                activeBusinessId={activeBusinessId}
                setTransactions={setTransactions}
                currentUser={settingsCurrentUser}
                showNotification={showNotification}
              />
            )}
          </div>
        </div>
      )}

      {activeSub === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
            <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6">
              {editUser ? "Edit User" : "Create User"}
            </h4>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <input
                required
                type="text"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                className="w-full border rounded-2xl p-4 outline-none font-bold bg-gray-50"
                placeholder="Username"
              />
              <input
                required
                type="text"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full border rounded-2xl p-4 outline-none font-bold bg-gray-50"
                placeholder="Password"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value as AppUser["role"],
                  })
                }
                className="w-full border rounded-2xl p-4 font-black uppercase text-xs tracking-widest bg-gray-50"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="supplier">Supplier</option>
              </select>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-lg hover:bg-blue-700"
              >
                {editUser ? "Save Updates" : "Activate Login"}
              </button>
              {editUser && (
                <button
                  type="button"
                  onClick={() => {
                    setEditUser(null);
                    setNewUser({ username: "", password: "", role: "staff" });
                  }}
                  className="w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest py-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.username}
                className="bg-white border p-5 rounded-[2rem] flex justify-between items-center font-bold shadow-sm"
              >
                <div>
                  <p className="text-lg font-black tracking-tight text-gray-800">
                    {u.username}
                  </p>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">
                    {u.role}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditUser({ oldName: u.username });
                      setNewUser({
                        username: u.username,
                        password: u.password,
                        role: u.role,
                      });
                    }}
                    className="text-blue-500 bg-blue-50 p-3 hover:bg-blue-100 rounded-xl"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDialog({
                        message: "Delete Account?",
                        onConfirm: () =>
                          setUsers((prev) =>
                            prev.filter((x) => x.username !== u.username),
                          ),
                      })
                    }
                    className="text-red-400 bg-red-50 p-3 hover:bg-red-100 rounded-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSub === "columns" && (
        <div>
          {editingCategoryFull ? (
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h4 className="font-black text-lg uppercase tracking-widest text-blue-900">
                  Edit: {editingCategoryFull.originalName}
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingCategoryFull(null)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase text-gray-400">
                  Category Name
                </p>
                <input
                  type="text"
                  value={editingCategoryFull.name}
                  onChange={(e) =>
                    setEditingCategoryFull({
                      ...editingCategoryFull,
                      name: e.target.value,
                    })
                  }
                  className="w-full border-2 border-blue-100 focus:border-blue-500 rounded-xl p-4 font-black text-lg outline-none mt-1 bg-gray-50"
                />
              </div>
              <div className="space-y-4 mb-6">
                {editingCategoryFull.fields.map((f, i) => (
                  <div
                    key={`field-${i}-${f.name}`}
                    className="bg-gray-50 p-5 rounded-2xl border relative"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCategoryFull((prev) => {
                          if (!prev) return null;
                          const nf = [...prev.fields];
                          nf.splice(i, 1);
                          return { ...prev, fields: nf };
                        })
                      }
                      className="absolute top-4 right-4 text-red-400 bg-red-50 p-1.5 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="pr-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-400 ml-1">
                          Field Name
                        </p>
                        <input
                          type="text"
                          value={f.name}
                          onChange={(e) => {
                            const nf = [...editingCategoryFull.fields];
                            nf[i] = { ...nf[i], name: e.target.value };
                            setEditingCategoryFull({
                              ...editingCategoryFull,
                              fields: nf,
                            });
                          }}
                          className="w-full border rounded-xl p-3 text-sm font-bold mt-1 outline-none"
                        />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-400 ml-1">
                          Type
                        </p>
                        <select
                          value={f.type}
                          onChange={(e) => {
                            const nf = [...editingCategoryFull.fields];
                            nf[i] = { ...nf[i], type: e.target.value };
                            setEditingCategoryFull({
                              ...editingCategoryFull,
                              fields: nf,
                            });
                          }}
                          className="w-full border rounded-xl p-3 text-sm font-bold mt-1 outline-none bg-white"
                        >
                          <option value="text">Text</option>
                          <option value="select">Dropdown</option>
                        </select>
                      </div>
                      {f.type === "select" && (
                        <div className="sm:col-span-2">
                          <p className="text-[9px] font-black uppercase text-blue-500 ml-1">
                            Options (comma separated)
                          </p>
                          <input
                            type="text"
                            value={f.optionsStr || ""}
                            onChange={(e) => {
                              const nf = [...editingCategoryFull.fields];
                              nf[i] = { ...nf[i], optionsStr: e.target.value };
                              setEditingCategoryFull({
                                ...editingCategoryFull,
                                fields: nf,
                              });
                            }}
                            className="w-full border-2 border-blue-100 rounded-xl p-3 text-sm font-bold mt-1 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setEditingCategoryFull((prev) =>
                      prev
                        ? {
                            ...prev,
                            fields: [
                              ...prev.fields,
                              {
                                name: "New Field",
                                type: "text",
                                optionsStr: "",
                              },
                            ],
                          }
                        : prev,
                    )
                  }
                  className="bg-blue-100 text-blue-700 px-5 py-3 rounded-xl text-xs font-black uppercase"
                >
                  + Add Field
                </button>
              </div>
              <div className="flex gap-3 border-t pt-6">
                <button
                  type="button"
                  onClick={() => setEditingCategoryFull(null)}
                  className="flex-1 bg-gray-100 text-gray-600 font-black py-4 rounded-2xl uppercase tracking-widest text-xs"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-lg"
                >
                  Save Category
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-xs uppercase tracking-widest text-blue-900">
                    Categories
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setPromptDialog({
                        message: "New Category Name?",
                        onConfirm: (name) => {
                          if (name)
                            setCategories((prev) => [
                              ...prev,
                              { name, fields: [] },
                            ]);
                        },
                      })
                    }
                    className="bg-blue-100 text-blue-700 p-2 rounded-xl"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      const csv =
                        "CategoryName,ItemName\nSafi,Sample Item\nLungi,Sample Lungi";
                      const blob = new Blob([csv], { type: "text/csv" });
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = "items_template.csv";
                      a.click();
                    }}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black"
                  >
                    <Download size={12} /> Template
                  </button>
                  <label
                    htmlFor="items-csv-upload"
                    className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer"
                  >
                    <Upload size={12} /> Upload Items
                  </label>
                  <input
                    id="items-csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const rows = (ev.target?.result as string)
                          .split(/\r?\n/)
                          .filter((l) => l.trim());
                        let count = 0;
                        for (let i = 1; i < rows.length; i++) {
                          const [catName, iName] = rows[i]
                            .split(",")
                            .map((s) => s.trim());
                          if (!catName || !iName) continue;
                          const catExists = categories.find(
                            (c) => c.name === catName,
                          );
                          if (!catExists)
                            setCategories((prev) => [
                              ...prev,
                              { name: catName, fields: [] },
                            ]);
                          const newSku = `SKU_${catName}_${iName}_${Date.now()}_${i}`;
                          const exists = Object.values(inventory).some(
                            (x) =>
                              (!x.businessId ||
                                x.businessId === activeBusinessId) &&
                              x.category === catName &&
                              x.itemName.toLowerCase() === iName.toLowerCase(),
                          );
                          if (!exists) {
                            setInventory((prev) => ({
                              ...prev,
                              [newSku]: {
                                sku: newSku,
                                category: catName,
                                itemName: iName,
                                attributes: {},
                                shop: 0,
                                godowns: {},
                                saleRate: 0,
                                purchaseRate: 0,
                                businessId: activeBusinessId,
                              },
                            }));
                            count++;
                          }
                        }
                        showNotification(`Added ${count} new items`, "success");
                      };
                      reader.readAsText(file);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="space-y-3 overflow-y-auto max-h-80">
                  {categories.map((c) => (
                    <div
                      key={c.name}
                      className="flex justify-between items-center bg-gray-50 border p-4 rounded-2xl font-bold text-sm"
                    >
                      <span>{c.name}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingCategoryFull({
                              originalName: c.name,
                              name: c.name,
                              fields: c.fields.map((f) => ({
                                ...f,
                                optionsStr: (f.options || []).join(", "),
                              })),
                            })
                          }
                          className="text-blue-500 bg-white p-2 rounded-lg shadow-sm"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDialog({
                              message: "Delete Category?",
                              onConfirm: () =>
                                setCategories((prev) =>
                                  prev.filter((x) => x.name !== c.name),
                                ),
                            })
                          }
                          className="text-red-400 bg-white p-2 rounded-lg shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {(["transit", "warehouse", "inward"] as const).map((tab) => (
                <div
                  key={tab}
                  className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-black text-xs uppercase tracking-widest text-amber-600">
                      {tab} Columns
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        setPromptDialog({
                          message: "Column Name?",
                          onConfirm: (name) => {
                            if (name)
                              setCustomColumns((prev) => ({
                                ...prev,
                                [tab]: [...prev[tab], { name, type: "text" }],
                              }));
                          },
                        })
                      }
                      className="bg-amber-100 text-amber-700 p-2 rounded-xl"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>
                  <div className="space-y-3 overflow-y-auto max-h-80">
                    {customColumns[tab].map((col) => (
                      <div
                        key={col.name}
                        className="flex justify-between items-center bg-gray-50 border p-4 rounded-2xl font-bold text-xs uppercase text-gray-700"
                      >
                        <span>
                          {col.name}{" "}
                          <span className="opacity-40 text-[9px] lowercase">
                            ({col.type})
                          </span>
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditTarget({ tab, oldName: col.name });
                              setEditName(col.name);
                              setEditType(col.type || "text");
                            }}
                            className="text-amber-500 bg-white p-2 rounded-lg shadow-sm"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDialog({
                                message: "Delete Column?",
                                onConfirm: () =>
                                  setCustomColumns((prev) => ({
                                    ...prev,
                                    [tab]: prev[tab].filter(
                                      (c) => c.name !== col.name,
                                    ),
                                  })),
                              })
                            }
                            className="text-red-400 bg-white p-2 rounded-lg shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSub === "godowns" && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-xs uppercase tracking-widest text-blue-900">
              Godown Locations
            </h4>
            <button
              type="button"
              onClick={() => {
                const name = prompt("New Godown Name:");
                if (name?.trim() && !godowns.includes(name.trim())) {
                  setGodowns((prev) => [...prev, name.trim()]);
                }
              }}
              className="bg-blue-100 text-blue-700 p-2 rounded-xl"
            >
              <PlusCircle size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {godowns.map((g, i) => (
              <div
                key={g}
                className="flex justify-between items-center bg-gray-50 border p-4 rounded-2xl font-bold text-sm"
              >
                <span>{g}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newName = prompt("Rename godown:", g);
                      if (
                        newName?.trim() &&
                        !godowns.includes(newName.trim())
                      ) {
                        setGodowns((prev) =>
                          prev.map((x, j) => (j === i ? newName.trim() : x)),
                        );
                      }
                    }}
                    className="text-blue-500 bg-white p-2 rounded-lg shadow-sm hover:bg-blue-50"
                  >
                    <Edit size={14} />
                  </button>
                  {godowns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete godown "${g}"?`)) {
                          setGodowns((prev) => prev.filter((_, j) => j !== i));
                        }
                      }}
                      className="text-red-400 bg-white p-2 rounded-lg shadow-sm hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSub === "tracking" && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-blue-900">
                Transport Tracking URLs
              </h4>
              <p className="text-[10px] text-gray-400 font-bold mt-1">
                Map transport names to tracking URLs. A Track button appears in
                the Queue tab.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const transport = prompt("Transport Name (e.g. DRTC):");
                if (!transport) return;
                const url = prompt(`Tracking URL for ${transport}:`);
                if (url)
                  setTransportTracking((prev) => ({
                    ...prev,
                    [transport.trim()]: url.trim(),
                  }));
              }}
              className="bg-blue-100 text-blue-700 p-2 rounded-xl"
            >
              <PlusCircle size={18} />
            </button>
          </div>
          Object.keys(transportTracking).length === 0 ? (
          <p className="text-gray-400 font-bold text-xs text-center py-8">
            No tracking URLs configured yet.
          </p>
          ) : (
          <div className="space-y-3">
            {Object.entries(transportTracking).map(([transport, url]) => (
              <div
                key={transport}
                className="flex justify-between items-center bg-gray-50 border p-4 rounded-2xl font-bold text-sm"
              >
                <div>
                  <p className="font-black">{transport}</p>
                  <p className="text-[10px] text-blue-600 font-bold truncate max-w-xs">
                    {url}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newUrl = prompt("Edit URL:", url);
                      if (newUrl)
                        setTransportTracking((prev) => ({
                          ...prev,
                          [transport]: newUrl.trim(),
                        }));
                    }}
                    className="text-blue-500 bg-white p-2 rounded-lg shadow-sm"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remove tracking for ${transport}?`)) {
                        setTransportTracking((prev) => {
                          const c = { ...prev };
                          delete c[transport];
                          return c;
                        });
                      }
                    }}
                    className="text-red-400 bg-white p-2 rounded-lg shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )
        </div>
      )}

      {activeSub === "fieldlabels" &&
        (() => {
          const TAB_FIELDS: Record<string, { key: string; default: string }[]> =
            {
              transit: [
                { key: "biltyNo", default: "Bilty No" },
                { key: "transport", default: "Transport" },
                { key: "supplier", default: "Supplier" },
                { key: "itemCategory", default: "Item Category" },
                { key: "itemInfo", default: "Item Info" },
                { key: "packages", default: "Packages" },
                { key: "date", default: "Bilty Date" },
              ],
              queue: [
                { key: "biltyNo", default: "Bilty No" },
                { key: "transport", default: "Transport" },
                { key: "supplier", default: "Supplier" },
                { key: "itemCategory", default: "Item Category" },
                { key: "itemName", default: "Item Name" },
                { key: "packages", default: "Total Packages" },
                { key: "arrivalDate", default: "Arrival Date" },
              ],
              inward: [
                { key: "biltyNo", default: "Bilty No" },
                { key: "packages", default: "Packages" },
                { key: "category", default: "Category" },
                { key: "itemName", default: "Item Name" },
                { key: "totalQty", default: "Total Qty in Bale" },
                { key: "shopQty", default: "Shop Qty" },
                { key: "saleRate", default: "Sale Rate" },
                { key: "purchaseRate", default: "Purchase Rate" },
              ],
            };

          const defaultOrder =
            TAB_FIELDS[selectedFieldTab]?.map((f) => f.key) || [];
          const currentOrder = fieldOrder[selectedFieldTab] || defaultOrder;
          const fieldsByKey = Object.fromEntries(
            (TAB_FIELDS[selectedFieldTab] || []).map((f) => [f.key, f]),
          );
          const orderedFields = currentOrder
            .map((k) => fieldsByKey[k])
            .filter(Boolean);

          const moveField = (idx: number, dir: -1 | 1) => {
            const order = [...currentOrder];
            const newIdx = idx + dir;
            if (newIdx < 0 || newIdx >= order.length) return;
            [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
            setFieldOrder((prev) => ({ ...prev, [selectedFieldTab]: order }));
          };

          const tabLabels = fieldLabels[selectedFieldTab] || {};
          const tabRequired = requiredFields[selectedFieldTab] || {};
          return (
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm max-w-2xl">
              <h4 className="font-black text-xs uppercase tracking-widest text-blue-900 mb-6">
                Field Labels & Required Fields
              </h4>
              <div className="flex gap-2 mb-6 flex-wrap">
                {Object.keys(TAB_FIELDS).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedFieldTab(tab)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-colors ${selectedFieldTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {orderedFields.map((f, idx) => (
                  <div
                    key={f.key}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                  >
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveField(idx, -1)}
                        className="p-1 rounded-lg bg-white border hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === orderedFields.length - 1}
                        onClick={() => moveField(idx, 1)}
                        className="p-1 rounded-lg bg-white border hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase text-gray-400 mb-1">
                        {f.default}
                      </p>
                      <input
                        type="text"
                        placeholder={f.default}
                        value={tabLabels[f.key] || ""}
                        onChange={(e) =>
                          setFieldLabels((prev) => ({
                            ...prev,
                            [selectedFieldTab]: {
                              ...(prev[selectedFieldTab] || {}),
                              [f.key]: e.target.value,
                            },
                          }))
                        }
                        className="w-full border rounded-xl p-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <p className="text-[9px] font-black uppercase text-gray-400">
                        Required
                      </p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!tabRequired[f.key]}
                          onChange={(e) =>
                            setRequiredFields((prev) => ({
                              ...prev,
                              [selectedFieldTab]: {
                                ...(prev[selectedFieldTab] || {}),
                                [f.key]: e.target.checked,
                              },
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-4">
                Label changes apply immediately. Use arrows to reorder fields.
                Required fields block form submission if empty.
              </p>
            </div>
          );
        })()}

      {activeSub === "tabnames" && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm max-w-lg">
          <h4 className="font-black text-xs uppercase tracking-widest text-blue-900 mb-6">
            Rename Navigation Tabs
          </h4>
          <div className="space-y-4">
            {Object.entries(tabNames).map(([key, name]) => (
              <div key={key} className="flex items-center gap-4">
                <p className="text-[10px] font-black uppercase text-gray-400 w-28 shrink-0">
                  {key}
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setTabNames((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="flex-1 border rounded-xl p-3 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
            ))}
            <p className="text-[10px] text-gray-400 font-bold">
              Changes apply immediately to navigation.
            </p>
          </div>
        </div>
      )}

      {activeSub === "threshold" && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm max-w-2xl">
          <h4 className="font-black text-xs uppercase tracking-widest text-blue-900 mb-2">
            Threshold Exclusions
          </h4>
          <p className="text-[10px] text-gray-400 font-bold mb-6">
            Items toggled here will be excluded from low stock alerts on the
            dashboard.
          </p>
          {Object.keys(inventory).filter(
            (sku) =>
              !inventory[sku].businessId ||
              inventory[sku].businessId === activeBusinessId,
          ).length === 0 ? (
            <p className="text-gray-400 font-bold text-sm text-center py-8">
              No inventory items yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {Object.keys(inventory)
                .filter(
                  (sku) =>
                    !inventory[sku].businessId ||
                    inventory[sku].businessId === activeBusinessId,
                )
                .map((sku) => {
                  const item = inventory[sku];
                  const excluded = (thresholdExcludedItems || []).includes(sku);
                  return (
                    <div
                      key={sku}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"
                    >
                      <div>
                        <p className="font-black text-sm text-gray-800">
                          {item.itemName}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                          {item.category}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer gap-2">
                        <span
                          className={`text-[10px] font-black uppercase ${excluded ? "text-red-500" : "text-green-600"}`}
                        >
                          {excluded ? "Excluded" : "Alerting"}
                        </span>
                        <input
                          type="checkbox"
                          checked={excluded}
                          onChange={(e) => {
                            if (setThresholdExcludedItems) {
                              setThresholdExcludedItems((prev) =>
                                e.target.checked
                                  ? [...prev, sku]
                                  : prev.filter((s) => s !== sku),
                              );
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500 relative" />
                      </label>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {activeSub === "data" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col items-center text-center gap-4">
            <div className="bg-green-100 text-green-600 p-5 rounded-[2rem]">
              <Download size={32} />
            </div>
            <div>
              <h4 className="font-black text-lg text-gray-800">
                Secure Backup
              </h4>
              <p className="text-xs text-gray-400 font-bold mt-2">
                Export a complete JSON snapshot
              </p>
            </div>
            <button
              type="button"
              onClick={exportDatabase}
              data-ocid="admin.primary_button"
              className="w-full bg-green-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm shadow-xl mt-4 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Backup Now
            </button>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col items-center text-center gap-4">
            <div className="bg-orange-100 text-orange-600 p-5 rounded-[2rem]">
              <Upload size={32} />
            </div>
            <div>
              <h4 className="font-black text-lg text-gray-800">
                System Restore
              </h4>
              <p className="text-xs text-gray-400 font-bold mt-2">
                Load data from a JSON backup file
              </p>
            </div>
            <label
              htmlFor="system-restore-input"
              className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-lg mt-4 cursor-pointer block text-center"
            >
              Select File
            </label>
            <input
              id="system-restore-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={importDatabase}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= ITEM NAME COMBO (OPENING STOCK) ================= */
function ItemNameComboOpening({
  categories: _categories,
  selectedCategory,
  value,
  onChange,
  inventory,
  activeBusinessId,
  showPriceSuggestions,
  priceSuggestions,
  onSelectPrice,
}: {
  categories: Category[];
  selectedCategory: string;
  value: string;
  onChange: (val: string) => void;
  inventory: Record<string, InventoryItem>;
  activeBusinessId: string;
  showPriceSuggestions: boolean;
  priceSuggestions: { sale: number; purchase: number }[];
  onSelectPrice: (sale: number, purchase: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  const suggestions = Array.from(
    new Set(
      Object.values(inventory)
        .filter(
          (i) =>
            (!selectedCategory || i.category === selectedCategory) &&
            (!i.businessId || i.businessId === activeBusinessId) &&
            (!inputVal ||
              i.itemName.toLowerCase().includes(inputVal.toLowerCase())),
        )
        .map((i) => i.itemName),
    ),
  );

  return (
    <div className="relative">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
        Item Name *
      </p>
      <input
        required
        type="text"
        value={inputVal}
        onChange={(e) => {
          setInputVal(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Type or select item name"
        data-ocid="opening.item_name.input"
        className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 left-0 right-0 bg-white border rounded-xl shadow-2xl mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((name) => (
            <button
              type="button"
              key={name}
              onMouseDown={() => {
                onChange(name);
                setInputVal(name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-sm font-bold border-b last:border-0"
            >
              {name}
            </button>
          ))}
        </div>
      )}
      {showPriceSuggestions && priceSuggestions.length > 0 && (
        <div className="absolute z-20 left-0 right-0 bg-white border rounded-xl shadow-xl mt-1">
          <p className="text-[9px] font-black uppercase text-gray-400 px-3 pt-2">
            Known prices for this item
          </p>
          {priceSuggestions.map((s, i) => (
            <button
              type="button"
              key={`price-${s.sale}-${s.purchase}-${i}`}
              onMouseDown={() => onSelectPrice(s.sale, s.purchase)}
              className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-xs font-bold border-b last:border-0"
            >
              Sale: ₹{s.sale} · Purchase: ₹{s.purchase}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= SALES TAB ================= */
function SalesTab({
  inventory,
  updateStock,
  setTransactions,
  showNotification,
  currentUser,
  godowns: _godowns,
  activeBusinessId,
  categories,
}: {
  inventory: Record<string, InventoryItem>;
  updateStock: (
    sku: string,
    details: Partial<InventoryItem>,
    shopDelta: number,
    godownDelta: number,
    targetGodown?: string,
  ) => void;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  showNotification: (m: string, t?: string) => void;
  currentUser: AppUser;
  godowns: string[];
  activeBusinessId: string;
  categories: Category[];
}) {
  const [saleLines, setSaleLines] = useState<
    { sku: string; itemName: string; category: string; qty: number }[]
  >([]);
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [saleRef, setSaleRef] = useState("");
  const [lineCategory, setLineCategory] = useState(categories[0]?.name || "");
  const [lineItemName, setLineItemName] = useState("");
  const [lineQty, setLineQty] = useState("");

  const addLine = () => {
    if (!lineItemName || !lineQty) return;
    const sku = Object.keys(inventory).find(
      (s) =>
        (!inventory[s].businessId ||
          inventory[s].businessId === activeBusinessId) &&
        inventory[s].itemName.toLowerCase() === lineItemName.toLowerCase() &&
        inventory[s].category === lineCategory,
    );
    if (!sku) {
      showNotification("Item not found in inventory", "error");
      return;
    }
    const item = inventory[sku];
    const qty = Number(lineQty);
    if ((item.shop || 0) < qty) {
      showNotification(`Only ${item.shop || 0} available in Shop`, "error");
      return;
    }
    setSaleLines((prev) => [
      ...prev,
      { sku, itemName: item.itemName, category: lineCategory, qty },
    ]);
    setLineItemName("");
    setLineQty("");
  };

  const confirmSale = () => {
    if (saleLines.length === 0) return;
    for (const line of saleLines) {
      updateStock(line.sku, inventory[line.sku], -line.qty, 0, "Main Godown");
      setTransactions((prev) => [
        {
          id: Date.now() + Math.random(),
          type: "SALE",
          sku: line.sku,
          itemName: line.itemName,
          category: line.category,
          itemsCount: line.qty,
          fromLocation: "Shop",
          toLocation: "Customer",
          date: saleDate,
          user: currentUser.username,
          notes: `Sale Ref: ${saleRef || "N/A"}`,
          businessId: activeBusinessId,
        },
        ...prev,
      ]);
    }
    showNotification(`Sale of ${saleLines.length} item(s) recorded`, "success");
    setSaleLines([]);
    setSaleRef("");
  };

  return (
    <div className="space-y-6 animate-fade-in-down max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b pb-4">
        <ShoppingCart className="text-rose-600" size={28} />
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">
            Sales
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Record sales from shop stock
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-[2rem] border shadow-sm space-y-4">
        <h3 className="font-black text-xs uppercase tracking-widest text-rose-900">
          Add Sale Item
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
              Category
            </p>
            <select
              value={lineCategory}
              onChange={(e) => {
                setLineCategory(e.target.value);
                setLineItemName("");
              }}
              className="w-full border rounded-xl p-2.5 font-bold bg-gray-50 outline-none"
            >
              {categories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <ItemNameCombo
              category={lineCategory}
              value={lineItemName}
              onChange={setLineItemName}
              inventory={inventory}
              activeBusinessId={activeBusinessId}
            />
            {lineItemName &&
              (() => {
                const sku = Object.keys(inventory).find(
                  (s) =>
                    (!inventory[s].businessId ||
                      inventory[s].businessId === activeBusinessId) &&
                    inventory[s].itemName.toLowerCase() ===
                      lineItemName.toLowerCase() &&
                    inventory[s].category === lineCategory,
                );
                const shopQty = sku ? inventory[sku].shop || 0 : null;
                if (shopQty === null) return null;
                return (
                  <p
                    className={`text-[10px] font-black mt-1 ml-1 ${shopQty === 0 ? "text-red-600" : "text-green-700"}`}
                  >
                    Shop stock: <span className="text-sm">{shopQty}</span> pcs
                    available
                  </p>
                );
              })()}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
              Qty (from Shop)
            </p>
            <input
              type="number"
              min="1"
              value={lineQty}
              onChange={(e) => setLineQty(e.target.value)}
              className="w-full border rounded-xl p-2.5 font-bold bg-gray-50 outline-none"
              placeholder="0"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addLine}
          className="bg-rose-600 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest shadow-md"
        >
          Add to Sale
        </button>
      </div>
      {saleLines.length > 0 && (
        <div className="bg-white rounded-[2rem] border overflow-hidden shadow-xl animate-fade-in-down">
          <div className="bg-rose-700 text-white px-6 py-4 flex justify-between items-center">
            <h3 className="font-black uppercase tracking-widest text-xs">
              Pending Sale Items
            </h3>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">
              {saleLines.length} ITEMS
            </span>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {saleLines.map((line, idx) => (
                <tr key={`${line.sku}-${idx}`}>
                  <td className="px-6 py-4 font-bold">
                    {line.itemName}
                    <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">
                      {line.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-rose-700">
                    {line.qty} pcs
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setSaleLines((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-red-400 p-2 bg-red-50 rounded-xl"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 bg-gray-50 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Date of Sale
                </p>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Sale Reference
                </p>
                <input
                  type="text"
                  value={saleRef}
                  onChange={(e) => setSaleRef(e.target.value)}
                  placeholder="e.g. Invoice #001"
                  className="w-full border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={confirmSale}
              className="w-full bg-rose-700 text-white font-black py-5 rounded-2xl uppercase tracking-[0.3em] shadow-xl hover:bg-rose-800 transition-transform active:scale-95 text-sm"
            >
              Confirm Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= ITEM HISTORY PANEL ================= */
function ItemHistoryPanel({
  sku,
  inventory,
  transactions,
  activeBusinessId,
  onClose,
}: {
  sku: string | null;
  inventory: Record<string, InventoryItem>;
  transactions: Transaction[];
  activeBusinessId: string;
  onClose: () => void;
}) {
  if (!sku) return null;
  const item = inventory[sku];
  if (!item) return null;

  const itemTxs = transactions
    .filter((tx) => {
      if (!(!tx.businessId || tx.businessId === activeBusinessId)) return false;
      if (tx.sku === sku) return true;
      if (
        tx.itemName?.toLowerCase() === item.itemName?.toLowerCase() &&
        (!tx.category || tx.category === item.category)
      )
        return true;
      // Also catch transactions where baleItemsList contains this item
      if (
        tx.baleItemsList?.some(
          (bi: { itemName?: string; category?: string }) =>
            bi.itemName?.toLowerCase() === item.itemName?.toLowerCase() &&
            (!bi.category || bi.category === item.category),
        )
      )
        return true;
      return false;
    })
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const dotColor = (type: string) => {
    if (
      type === "INWARD" ||
      type === "OPENING_STOCK" ||
      type === "DIRECT_STOCK"
    )
      return "bg-green-500";
    if (type === "transfer") return "bg-purple-500";
    if (type === "SALE") return "bg-red-500";
    return "bg-gray-400";
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-xl md:rounded-[2.5rem] rounded-t-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-down">
        <div className="sticky top-0 bg-white border-b px-6 py-5 flex justify-between items-start z-10 rounded-t-[2rem]">
          <div>
            <h3 className="font-black text-xl text-gray-900">
              {item.itemName}
            </h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
              {item.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={() => {
              let msg = `📦 *${item.itemName}* (${item.category})\n`;
              const attrs = Object.entries(item.attributes || {})
                .filter(([, v]) => v)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ");
              if (attrs) msg += `📝 ${attrs}\n`;
              msg += "\n📊 *Current Stock*\n";
              msg += `🏪 Shop: ${item.shop || 0} pcs\n`;
              for (const [g, v] of Object.entries(item.godowns || {})) {
                msg += `🏭 ${g}: ${v || 0} pcs\n`;
              }
              msg += "\n📅 *Transaction Timeline*\n";
              for (const tx of itemTxs) {
                const d = tx.date?.split("T")[0] || tx.date;
                if (
                  tx.type === "INWARD" ||
                  tx.type === "OPENING_STOCK" ||
                  tx.type === "DIRECT_STOCK"
                ) {
                  msg += `✅ Added ${tx.itemsCount ?? "?"} pcs on ${d}`;
                  if (tx.biltyNo) msg += ` (Bilty: ${tx.biltyNo})`;
                  msg += ` by ${tx.user || "?"}\n`;
                  if (tx.baleItemsList) {
                    for (const bi of tx.baleItemsList) {
                      if ((bi.shopQty || 0) > 0)
                        msg += `   🏪 Shop: ${bi.shopQty} pcs\n`;
                      for (const [g2, v2] of Object.entries(
                        bi.godownQuants || {},
                      ).filter(([, val]) => val > 0)) {
                        msg += `   🏭 ${g2}: ${v2} pcs\n`;
                      }
                    }
                  }
                } else if (tx.type === "transfer") {
                  msg += `🔄 Transferred ${tx.itemsCount ?? "?"} pcs: ${tx.fromLocation} → ${tx.toLocation} on ${d} by ${tx.transferredBy || tx.user || "?"}\n`;
                } else if (tx.type === "SALE") {
                  msg += `💰 Sold ${tx.itemsCount ?? "?"} pcs on ${d} by ${tx.user || "?"}\n`;
                }
              }
              msg += "\n_Shared from StockFlow_";
              window.open(
                `https://wa.me/?text=${encodeURIComponent(msg)}`,
                "_blank",
              );
            }}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest shadow-md transition-colors"
          >
            <Share2 size={16} />
            Share on WhatsApp
          </button>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center">
              <p className="text-[10px] font-black uppercase text-green-600">
                Shop
              </p>
              <p className="text-2xl font-black text-green-700">
                {Number(item.shop || 0)}
              </p>
            </div>
            {Object.entries(item.godowns || {}).map(([g, v]) => (
              <div
                key={g}
                className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center"
              >
                <p className="text-[10px] font-black uppercase text-amber-600 truncate">
                  {g}
                </p>
                <p className="text-2xl font-black text-amber-700">
                  {Number(v || 0)}
                </p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-gray-500 mb-4">
              Transaction Timeline
            </h4>
            {itemTxs.length === 0 ? (
              <p className="text-gray-400 font-bold text-xs text-center py-8">
                No transactions recorded yet
              </p>
            ) : (
              <div className="space-y-4">
                {/* Fix 8: Group inward entries by bilty number */}
                {(() => {
                  const inwardTxs = itemTxs.filter(
                    (tx) =>
                      tx.type === "INWARD" ||
                      tx.type === "OPENING_STOCK" ||
                      tx.type === "DIRECT_STOCK",
                  );
                  const transferTxs = itemTxs.filter(
                    (tx) => tx.type === "transfer",
                  );
                  const otherTxs = itemTxs.filter(
                    (tx) =>
                      tx.type !== "INWARD" &&
                      tx.type !== "OPENING_STOCK" &&
                      tx.type !== "DIRECT_STOCK" &&
                      tx.type !== "transfer",
                  );
                  return (
                    <>
                      {inwardTxs.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black uppercase text-green-600 tracking-widest mb-2">
                            Stock Receipts by Bilty
                          </p>
                          <div className="space-y-3">
                            {inwardTxs.map((tx) => (
                              <div key={tx.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 bg-green-500" />
                                  <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                                </div>
                                <div className="pb-4 flex-1">
                                  <div className="bg-green-50 border border-green-100 rounded-2xl p-3 space-y-2">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <div>
                                        <p className="font-black text-sm text-green-700">
                                          ✅ {tx.itemsCount ?? "?"} pcs added
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                          By{" "}
                                          <b className="text-gray-600">
                                            {tx.user || "?"}
                                          </b>{" "}
                                          · {tx.date?.split("T")[0] || tx.date}
                                        </p>
                                      </div>
                                      {tx.biltyNo && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-800 px-2.5 py-1 rounded-full border border-green-200">
                                          📦 {tx.biltyNo}
                                        </span>
                                      )}
                                    </div>
                                    {tx.baleItemsList &&
                                      tx.baleItemsList.length > 0 && (
                                        <div className="space-y-1 pt-1 border-t border-green-200">
                                          {tx.baleItemsList.map(
                                            (
                                              bi: {
                                                itemName?: string;
                                                category?: string;
                                                qty?: number;
                                                shopQty?: number;
                                                godownQuants?: Record<
                                                  string,
                                                  number
                                                >;
                                              },
                                              biIdx: number,
                                            ) => (
                                              <div
                                                key={`${bi.itemName}-${biIdx}`}
                                                className="text-[10px] font-bold text-gray-700"
                                              >
                                                <span className="text-gray-900">
                                                  {bi.itemName}
                                                </span>
                                                <span className="text-gray-400 ml-1">
                                                  ({bi.category})
                                                </span>
                                                <span className="ml-2 text-green-700">
                                                  Qty: {bi.qty}
                                                </span>
                                                <div className="flex gap-1 flex-wrap mt-1">
                                                  {(bi.shopQty || 0) > 0 && (
                                                    <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md border border-blue-100">
                                                      🏪 Shop: {bi.shopQty}
                                                    </span>
                                                  )}
                                                  {Object.entries(
                                                    bi.godownQuants || {},
                                                  )
                                                    .filter(
                                                      ([, v]) => (v || 0) > 0,
                                                    )
                                                    .map(([g, v]) => (
                                                      <span
                                                        key={g}
                                                        className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md border border-amber-100"
                                                      >
                                                        🏭 {g}: {v}
                                                      </span>
                                                    ))}
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {transferTxs.length > 0 && (
                        <div>
                          <p className="text-[9px] font-black uppercase text-purple-600 tracking-widest mb-2">
                            Transfers
                          </p>
                          <div className="space-y-3">
                            {transferTxs.map((tx) => (
                              <div key={tx.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 bg-purple-500" />
                                  <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                                </div>
                                <div className="pb-4 flex-1">
                                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3">
                                    <p className="font-black text-sm text-purple-700">
                                      🔄 {tx.itemsCount ?? "?"} pcs transferred
                                    </p>
                                    <p className="text-[11px] font-bold text-purple-600">
                                      {tx.fromLocation} → {tx.toLocation}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                      By{" "}
                                      <b className="text-gray-600">
                                        {tx.transferredBy || tx.user || "?"}
                                      </b>{" "}
                                      · {tx.date?.split("T")[0] || tx.date}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {otherTxs.map((tx) => (
                        <div key={tx.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${dotColor(tx.type)}`}
                            />
                            <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                          </div>
                          <div className="pb-4 flex-1">
                            {tx.type === "SALE" && (
                              <p className="font-black text-sm text-red-700">
                                💰 Sold {tx.itemsCount ?? "?"} pcs from Shop
                              </p>
                            )}
                            {tx.type === "STOCK_OVERWRITE" && (
                              <p className="font-black text-sm text-gray-600">
                                ⚙️ Stock adjusted
                              </p>
                            )}
                            <p className="text-[10px] font-bold text-gray-400 mt-1">
                              By{" "}
                              <b className="text-gray-600">
                                {tx.transferredBy || tx.user || "?"}
                              </b>{" "}
                              · {tx.date?.split("T")[0] || tx.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= SIDEBAR / NAV ================= */
/* ================= INWARD SAVED TAB ================= */
function InwardSavedTab({
  inwardSaved,
  setInwardSaved,
  currentUser,
  transactions,
  activeBusinessId,
  showNotification,
}: {
  inwardSaved: InwardSavedEntry[];
  setInwardSaved: React.Dispatch<React.SetStateAction<InwardSavedEntry[]>>;
  currentUser: AppUser;
  transactions: Transaction[];
  activeBusinessId: string;
  showNotification: (m: string, t?: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedBilty, setSelectedBilty] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<InwardSavedEntry | null>(
    null,
  );

  const filtered = inwardSaved.filter(
    (e) =>
      (!e.businessId || e.businessId === activeBusinessId) &&
      (!search ||
        e.biltyNumber.toLowerCase().includes(search.toLowerCase()) ||
        e.savedBy.toLowerCase().includes(search.toLowerCase()) ||
        e.transporter.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6 animate-fade-in-down">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="bg-green-600 p-2 rounded-2xl text-white shadow-lg">
          <CheckCircle size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
            Inward Saved
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {filtered.length} completed bilties
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bilty number, transporter, saved by..."
          className="flex-1 border rounded-2xl p-3 font-bold bg-white outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-black uppercase text-sm">
            No completed bilties yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-[1.5rem] border border-green-100 shadow-sm overflow-hidden"
            >
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedBilty(entry.biltyNumber)}
                      className="font-black text-green-700 text-sm hover:text-green-900 hover:underline"
                    >
                      {entry.biltyNumber}
                    </button>
                    <span className="text-[9px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">
                      Completed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                    {entry.transporter && (
                      <p className="text-[10px] font-bold text-gray-500 uppercase">
                        <span className="text-gray-400">Transport:</span>{" "}
                        {entry.transporter}
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-gray-500 uppercase">
                      <span className="text-gray-400">By:</span> {entry.savedBy}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">
                      <span className="text-gray-400">On:</span>{" "}
                      {entry.savedAt
                        ? new Date(entry.savedAt).toLocaleDateString("en-IN")
                        : "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.items.map((itm, i) => (
                      <span
                        key={`${entry.id}-item-${i}`}
                        className="text-[9px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {itm.itemName} ({itm.qty})
                      </span>
                    ))}
                  </div>
                </div>
                {currentUser.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => setEditingEntry(entry)}
                    className="shrink-0 p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    title="Edit entry (Admin only)"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bilty History Panel */}
      {selectedBilty &&
        (() => {
          const bNo = selectedBilty;
          const inwardEntries = transactions.filter(
            (t) =>
              t.biltyNo?.toLowerCase() === bNo.toLowerCase() &&
              (t.type === "INWARD" || t.type === "inward") &&
              (!t.businessId || t.businessId === activeBusinessId),
          );
          const inwardEntry = inwardEntries[0] || null;
          const entry = inwardSaved.find(
            (e) => e.biltyNumber.toLowerCase() === bNo.toLowerCase(),
          );
          return (
            <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-down">
                <div className="sticky top-0 bg-white border-b px-6 py-5 flex justify-between items-center rounded-t-[2.5rem] z-10">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                      Inward Saved Detail
                    </p>
                    <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight">
                      {bNo}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBilty(null)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {entry && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-1">
                        <p className="text-[10px] font-black uppercase text-green-800 mb-2">
                          Inward Details
                        </p>
                        <p className="text-xs font-bold text-gray-700">
                          Saved by: <b>{entry.savedBy}</b>
                        </p>
                        <p className="text-xs font-bold text-gray-700">
                          Date:{" "}
                          <b>
                            {entry.savedAt
                              ? new Date(entry.savedAt).toLocaleDateString(
                                  "en-IN",
                                )
                              : "—"}
                          </b>
                        </p>
                        {entry.transporter && (
                          <p className="text-xs font-bold text-gray-700">
                            Transporter: <b>{entry.transporter}</b>
                          </p>
                        )}
                        {entry.supplier && (
                          <p className="text-xs font-bold text-gray-700">
                            Supplier: <b>{entry.supplier}</b>
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-gray-500">
                          Items Received
                        </p>
                        {entry.items.map((itm) => (
                          <div
                            key={`${itm.itemName}-${itm.category}`}
                            className="bg-gray-50 border rounded-xl p-3 text-xs"
                          >
                            <p className="font-black text-gray-800">
                              {itm.itemName}{" "}
                              <span className="text-gray-400">
                                ({itm.category})
                              </span>
                            </p>
                            <div className="flex gap-3 mt-1 text-gray-600">
                              <span>
                                Total Qty:{" "}
                                <b className="text-gray-900">{itm.qty}</b>
                              </span>
                              {itm.shopQty > 0 && (
                                <span>
                                  Shop:{" "}
                                  <b className="text-green-700">
                                    {itm.shopQty}
                                  </b>
                                </span>
                              )}
                              {itm.godownQty > 0 && (
                                <span>
                                  Godown:{" "}
                                  <b className="text-amber-700">
                                    {itm.godownQty}
                                  </b>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {inwardEntry?.baleItemsList &&
                    inwardEntry.baleItemsList.length > 0 &&
                    !entry && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-gray-500">
                          Items (from transaction record)
                        </p>
                        {inwardEntry.baleItemsList.map((bi) => (
                          <div
                            key={`${bi.itemName}-${bi.category}`}
                            className="bg-gray-50 border rounded-xl p-3 text-xs"
                          >
                            <p className="font-black">
                              {bi.itemName} ({bi.category})
                            </p>
                            <p className="text-gray-600 mt-0.5">
                              Qty: {bi.qty}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Admin Edit Modal */}
      {editingEntry && currentUser.role === "admin" && (
        <div className="fixed inset-0 bg-gray-900/60 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-down">
            <div className="sticky top-0 bg-white border-b px-6 py-5 flex justify-between items-center rounded-t-[2.5rem]">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-600">
                  Admin Edit — Inward Saved
                </p>
                <h3 className="font-black text-gray-900 text-lg">
                  {editingEntry.biltyNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase text-amber-700">
                  Bilty number is locked
                </p>
                <p className="font-black text-amber-900">
                  {editingEntry.biltyNumber}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                    Transporter
                  </p>
                  <input
                    type="text"
                    value={editingEntry.transporter}
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        transporter: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3 font-bold text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                    Supplier
                  </p>
                  <input
                    type="text"
                    value={editingEntry.supplier}
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        supplier: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3 font-bold text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                    Saved By
                  </p>
                  <input
                    type="text"
                    value={editingEntry.savedBy}
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        savedBy: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3 font-bold text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
                    Date
                  </p>
                  <input
                    type="date"
                    value={
                      editingEntry.savedAt
                        ? editingEntry.savedAt.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        savedAt: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3 font-bold text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500 mb-3 mt-2">
                  Items
                </p>
                {editingEntry.items.map((itm, idx) => (
                  <div
                    key={`edit-itm-${itm.itemName || idx}-${itm.category || idx}`}
                    className="border border-blue-100 rounded-2xl p-4 mb-3 bg-blue-50/40 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase text-blue-700">
                        Item {idx + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingEntry({
                            ...editingEntry,
                            items: editingEntry.items.filter(
                              (_, i) => i !== idx,
                            ),
                          })
                        }
                        className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                          Category
                        </p>
                        <input
                          type="text"
                          value={itm.category}
                          onChange={(e) => {
                            const upd = [...editingEntry.items];
                            upd[idx] = {
                              ...upd[idx],
                              category: e.target.value,
                            };
                            setEditingEntry({ ...editingEntry, items: upd });
                          }}
                          className="w-full border rounded-xl p-3 font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                          Item Name
                        </p>
                        <input
                          type="text"
                          value={itm.itemName}
                          onChange={(e) => {
                            const upd = [...editingEntry.items];
                            upd[idx] = {
                              ...upd[idx],
                              itemName: e.target.value,
                            };
                            setEditingEntry({ ...editingEntry, items: upd });
                          }}
                          className="w-full border rounded-xl p-3 font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                          Shop Qty
                        </p>
                        <input
                          type="number"
                          value={itm.shopQty}
                          onChange={(e) => {
                            const upd = [...editingEntry.items];
                            const sq = Number(e.target.value) || 0;
                            upd[idx] = {
                              ...upd[idx],
                              shopQty: sq,
                              qty: sq + upd[idx].godownQty,
                            };
                            setEditingEntry({ ...editingEntry, items: upd });
                          }}
                          className="w-full border rounded-xl p-3 font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                          Godown Qty
                        </p>
                        <input
                          type="number"
                          value={itm.godownQty}
                          onChange={(e) => {
                            const upd = [...editingEntry.items];
                            const gq = Number(e.target.value) || 0;
                            upd[idx] = {
                              ...upd[idx],
                              godownQty: gq,
                              qty: upd[idx].shopQty + gq,
                            };
                            setEditingEntry({ ...editingEntry, items: upd });
                          }}
                          className="w-full border rounded-xl p-3 font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                          Sale Rate (₹)
                        </p>
                        <input
                          type="number"
                          value={itm.saleRate}
                          onChange={(e) => {
                            const upd = [...editingEntry.items];
                            upd[idx] = {
                              ...upd[idx],
                              saleRate: Number(e.target.value) || 0,
                            };
                            setEditingEntry({ ...editingEntry, items: upd });
                          }}
                          className="w-full border rounded-xl p-3 font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">
                          Purchase Rate (₹)
                        </p>
                        <input
                          type="number"
                          value={itm.purchaseRate}
                          onChange={(e) => {
                            const upd = [...editingEntry.items];
                            upd[idx] = {
                              ...upd[idx],
                              purchaseRate: Number(e.target.value) || 0,
                            };
                            setEditingEntry({ ...editingEntry, items: upd });
                          }}
                          className="w-full border rounded-xl p-3 font-bold text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-blue-700">
                      Total: {itm.shopQty + itm.godownQty} pcs
                    </p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setEditingEntry({
                      ...editingEntry,
                      items: [
                        ...editingEntry.items,
                        {
                          category: "",
                          itemName: "",
                          qty: 0,
                          shopQty: 0,
                          godownQty: 0,
                          saleRate: 0,
                          purchaseRate: 0,
                          attributes: {},
                        },
                      ],
                    })
                  }
                  className="w-full border-2 border-dashed border-blue-300 text-blue-600 font-black text-[10px] uppercase py-3 rounded-2xl hover:bg-blue-50"
                >
                  + Add Item
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setInwardSaved((prev) =>
                      prev.map((e) =>
                        e.id === editingEntry.id ? editingEntry : e,
                      ),
                    );
                    setEditingEntry(null);
                    showNotification("Entry updated", "success");
                  }}
                  className="flex-1 bg-blue-600 text-white font-black py-3 rounded-2xl text-xs uppercase shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-6 border font-black py-3 rounded-2xl text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left ${active ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-200" : "text-gray-500 hover:bg-gray-100"}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm tracking-tight">{label}</span>
    </button>
  );
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center min-w-[64px] py-1 px-2 ${active ? "text-blue-600 scale-110 transition-transform" : "text-gray-400"}`}
    >
      <Icon className="w-5 h-5 mb-0.5" />
      <span className="text-[9px] font-black uppercase tracking-tighter">
        {label}
      </span>
    </button>
  );
}

/* ================= LOGIN SCREEN ================= */
function LoginScreen({
  users,
  onLogin,
  showNotification,
}: {
  users: AppUser[];
  onLogin: (u: AppUser) => void;
  showNotification: (m: string, t?: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password,
    );
    if (user) {
      localStorage.setItem("stockflow_user", JSON.stringify(user));
      onLogin(user);
      showNotification(`Welcome back, ${user.username}!`, "success");
    } else {
      showNotification("Invalid credentials", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 text-white">
            <Package size={40} />
          </div>
        </div>
        <h1 className="text-3xl font-black text-center text-gray-900 mb-2 tracking-tighter">
          StockManager
        </h1>
        <p className="text-center text-gray-500 mb-8 text-xs font-bold uppercase tracking-widest">
          Inventory System
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              placeholder="Username"
            />
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
            placeholder="••••••••"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg transition-transform active:scale-95 uppercase tracking-widest text-xs mt-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

function GodownStockTab({
  inventory,
  godowns,
  activeBusinessId,
}: {
  inventory: Record<string, InventoryItem>;
  godowns: string[];
  activeBusinessId: string;
}) {
  const [selectedGodown, setSelectedGodown] = useState(godowns[0] || "");

  const items = Object.values(inventory).filter(
    (item) =>
      (!item.businessId || item.businessId === activeBusinessId) &&
      (item.godowns[selectedGodown] || 0) > 0,
  );

  const grouped = items.reduce<Record<string, InventoryItem[]>>((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in-down">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
          Godown Stock
        </h2>
        <select
          value={selectedGodown}
          onChange={(e) => setSelectedGodown(e.target.value)}
          className="border rounded-xl p-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {godowns.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center text-gray-400 font-bold py-16">
          No stock in {selectedGodown}
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div
            key={cat}
            className="bg-white rounded-3xl border shadow-sm overflow-hidden"
          >
            <div className="bg-blue-50 px-6 py-3 border-b">
              <h3 className="font-black text-blue-800 text-xs uppercase tracking-widest">
                {cat}
              </h3>
            </div>
            <div className="divide-y">
              {catItems.map((item) => {
                const attrStr = Object.entries(item.attributes || {})
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ");
                return (
                  <div
                    key={item.sku}
                    className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-black text-gray-800">
                        {item.itemName}
                      </p>
                      {attrStr && (
                        <p className="text-xs text-gray-500 font-bold mt-0.5">
                          {attrStr}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-gray-400">
                          Sale Rate
                        </p>
                        <p className="font-black text-gray-800">
                          ₹{item.saleRate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-gray-400">
                          Qty in Godown
                        </p>
                        <p className="font-black text-green-700 text-lg">
                          {item.godowns[selectedGodown] || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AnalyticsTab({
  transactions,
  activeBusinessId,
  godowns,
}: {
  transactions: Transaction[];
  activeBusinessId: string;
  godowns: string[];
}) {
  const [viewMode, setViewMode] = useState<"chart" | "leaderboard">(
    "leaderboard",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [movementType, setMovementType] = useState<
    "inward" | "outward" | "both"
  >("inward");
  const [selectedGodown, setSelectedGodown] = useState("all");

  // Always compute both inward and outward maps
  const inwardFiltered = transactions.filter((t) => {
    if (!(!t.businessId || t.businessId === activeBusinessId)) return false;
    if (t.type !== "INWARD") return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  });

  const outwardFiltered = transactions.filter((t) => {
    if (!(!t.businessId || t.businessId === activeBusinessId)) return false;
    if (t.type !== "TRANSFER") return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    if (selectedGodown !== "all" && t.fromLocation !== selectedGodown)
      return false;
    return true;
  });

  const buildInwardMap = () => {
    const map: Record<
      string,
      {
        itemName: string;
        category: string;
        subCategory: string;
        inwardQty: number;
        outwardQty: number;
      }
    > = {};
    for (const t of inwardFiltered) {
      if (t.baleItemsList) {
        for (const item of t.baleItemsList) {
          if (selectedGodown !== "all") {
            const godownQty = item.godownQuants?.[selectedGodown] || 0;
            if (godownQty <= 0) continue;
          }
          const sub = Object.entries(item.attributes || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(", ");
          const key = `${item.category}||${item.itemName}||${sub}`;
          if (!map[key])
            map[key] = {
              itemName: item.itemName,
              category: item.category,
              subCategory: sub,
              inwardQty: 0,
              outwardQty: 0,
            };
          map[key].inwardQty += item.qty || 0;
        }
      }
    }
    return map;
  };

  const buildOutwardMap = () => {
    const map: Record<
      string,
      {
        itemName: string;
        category: string;
        subCategory: string;
        inwardQty: number;
        outwardQty: number;
      }
    > = {};
    for (const t of outwardFiltered) {
      if (t.itemName) {
        const key = `${t.category || ""}||${t.itemName || ""}||`;
        if (!map[key])
          map[key] = {
            itemName: t.itemName || "",
            category: t.category || "",
            subCategory: "",
            inwardQty: 0,
            outwardQty: 0,
          };
        map[key].outwardQty += t.itemsCount || 0;
      }
    }
    return map;
  };

  const mergedMap = () => {
    const inMap = buildInwardMap();
    const outMap = buildOutwardMap();
    const combined: Record<
      string,
      {
        itemName: string;
        category: string;
        subCategory: string;
        inwardQty: number;
        outwardQty: number;
      }
    > = {};
    for (const [k, v] of Object.entries(inMap)) {
      combined[k] = { ...v };
    }
    for (const [k, v] of Object.entries(outMap)) {
      if (combined[k]) {
        combined[k].outwardQty = v.outwardQty;
      } else {
        combined[k] = { ...v };
      }
    }
    return combined;
  };

  let itemMap: Record<
    string,
    {
      itemName: string;
      category: string;
      subCategory: string;
      inwardQty: number;
      outwardQty: number;
    }
  > = {};
  if (movementType === "inward") {
    itemMap = buildInwardMap();
  } else if (movementType === "outward") {
    itemMap = buildOutwardMap();
  } else {
    itemMap = mergedMap();
  }

  const sortFn = (
    a: { inwardQty: number; outwardQty: number },
    b: { inwardQty: number; outwardQty: number },
  ) => {
    if (movementType === "inward") return b.inwardQty - a.inwardQty;
    if (movementType === "outward") return b.outwardQty - a.outwardQty;
    return b.inwardQty + b.outwardQty - (a.inwardQty + a.outwardQty);
  };

  const sorted = Object.values(itemMap).sort(sortFn);
  const _top20 = sorted.slice(0, 20);

  // Group by category for display
  const categoryGroups: Record<string, typeof sorted> = {};
  for (const item of sorted) {
    const cat = item.category || "Uncategorized";
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(item);
  }
  const categoryOrder = Object.keys(categoryGroups).sort((a, b) => {
    const sumA = categoryGroups[a].reduce(
      (s, i) => s + i.inwardQty + i.outwardQty,
      0,
    );
    const sumB = categoryGroups[b].reduce(
      (s, i) => s + i.inwardQty + i.outwardQty,
      0,
    );
    return sumB - sumA;
  });

  return (
    <div className="space-y-6 animate-fade-in-down">
      <div className="flex flex-col gap-4 border-b pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
          Analytics
        </h2>
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setMovementType("inward")}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${movementType === "inward" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Inward
            </button>
            <button
              type="button"
              onClick={() => setMovementType("outward")}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${movementType === "outward" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Outward (to Shop)
            </button>
            <button
              type="button"
              onClick={() => setMovementType("both")}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${movementType === "both" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Both
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode("leaderboard")}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${viewMode === "leaderboard" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase ${viewMode === "chart" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Chart
            </button>
          </div>
          <select
            value={selectedGodown}
            onChange={(e) => setSelectedGodown(e.target.value)}
            className="border rounded-xl p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Godowns</option>
            {godowns.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border rounded-xl p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border rounded-xl p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center text-gray-400 font-bold py-16">
          No movement data for selected filters
        </div>
      ) : viewMode === "leaderboard" ? (
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-500">
                    Sub-Cat
                  </th>
                  {(movementType === "inward" || movementType === "both") && (
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-blue-600">
                      Inward
                    </th>
                  )}
                  {(movementType === "outward" || movementType === "both") && (
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-red-500">
                      Outward
                    </th>
                  )}
                  {movementType === "both" && (
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-gray-500">
                      Total
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {categoryOrder.map((cat) => {
                  const catItems = categoryGroups[cat].sort(sortFn);
                  const catInward = catItems.reduce(
                    (s, i) => s + i.inwardQty,
                    0,
                  );
                  const catOutward = catItems.reduce(
                    (s, i) => s + i.outwardQty,
                    0,
                  );
                  const _globalRank = sorted.findIndex(
                    (i) => i === catItems[0],
                  );
                  return (
                    <>
                      <tr key={`cat-${cat}`} className="bg-blue-50">
                        <td
                          className="px-4 py-2 font-black text-blue-700 text-xs"
                          colSpan={2}
                        >
                          📦 {cat}
                        </td>
                        <td
                          className="px-4 py-2 text-xs text-gray-400 font-bold"
                          colSpan={2}
                        >
                          {catItems.length} items
                        </td>
                        {(movementType === "inward" ||
                          movementType === "both") && (
                          <td className="px-4 py-2 text-right font-black text-blue-700 text-xs">
                            {catInward}
                          </td>
                        )}
                        {(movementType === "outward" ||
                          movementType === "both") && (
                          <td className="px-4 py-2 text-right font-black text-red-600 text-xs">
                            {catOutward}
                          </td>
                        )}
                        {movementType === "both" && (
                          <td className="px-4 py-2 text-right font-black text-gray-700 text-xs">
                            {catInward + catOutward}
                          </td>
                        )}
                      </tr>
                      {catItems.map((item, i) => {
                        const rank = sorted.indexOf(item);
                        return (
                          <tr
                            key={`${item.category}-${item.itemName}-${item.subCategory}-${i}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 font-black text-gray-400">
                              #{rank + 1}
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-600">
                              {item.category}
                            </td>
                            <td className="px-4 py-3 font-black text-gray-800">
                              {item.itemName}
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-gray-500">
                              {item.subCategory || "-"}
                            </td>
                            {(movementType === "inward" ||
                              movementType === "both") && (
                              <td className="px-4 py-3 text-right font-black text-blue-700">
                                {item.inwardQty}
                              </td>
                            )}
                            {(movementType === "outward" ||
                              movementType === "both") && (
                              <td className="px-4 py-3 text-right font-black text-red-600">
                                {item.outwardQty}
                              </td>
                            )}
                            {movementType === "both" && (
                              <td className="px-4 py-3 text-right font-black text-gray-700">
                                {item.inwardQty + item.outwardQty}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border shadow-sm p-6 overflow-x-auto">
          {(() => {
            const ITEM_COLORS = [
              "#2563eb",
              "#dc2626",
              "#16a34a",
              "#d97706",
              "#7c3aed",
              "#0891b2",
              "#db2777",
              "#65a30d",
              "#ea580c",
              "#0f766e",
              "#4f46e5",
              "#be185d",
              "#15803d",
              "#b45309",
              "#1d4ed8",
            ];
            // Build per-category chart data: one bar per category, colored segments per item
            const chartCats = categoryOrder.map((cat) => {
              const catItems = categoryGroups[cat];
              const row: Record<string, string | number> = { category: cat };
              for (const item of catItems) {
                const key = `${item.itemName}||${item.subCategory}`;
                const qty =
                  movementType === "inward"
                    ? item.inwardQty
                    : movementType === "outward"
                      ? item.outwardQty
                      : item.inwardQty + item.outwardQty;
                row[key] = (Number(row[key]) || 0) + qty;
              }
              return row;
            });
            // Collect all unique item keys across all categories for legend
            const allItemKeys: string[] = [];
            for (const cat of categoryOrder) {
              for (const item of categoryGroups[cat]) {
                const key = `${item.itemName}||${item.subCategory}`;
                if (!allItemKeys.includes(key)) allItemKeys.push(key);
              }
            }
            return (
              <>
                <div
                  style={{
                    minWidth: `${Math.max(400, chartCats.length * 80)}px`,
                  }}
                >
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={chartCats}
                      margin={{ top: 10, right: 10, left: 0, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="category"
                        angle={-45}
                        textAnchor="end"
                        tick={{ fontSize: 10, fontWeight: 700 }}
                      />
                      <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
                      <Tooltip />
                      {allItemKeys.map((key, idx) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          name={key.split("||")[0]}
                          stackId="a"
                          fill={ITEM_COLORS[idx % ITEM_COLORS.length]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {allItemKeys.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {allItemKeys.map((key, idx) => {
                      const [itemName, sub] = key.split("||");
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600"
                        >
                          <div
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{
                              backgroundColor:
                                ITEM_COLORS[idx % ITEM_COLORS.length],
                            }}
                          />
                          {itemName}
                          {sub ? ` (${sub})` : ""}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/* ================= MAIN APP ================= */
export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [minStockThreshold, setMinStockThreshold] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [promptDialog, setPromptDialog] = useState<{
    message: string;
    defaultValue?: string;
    onConfirm: (v: string) => void;
  } | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([
    { id: "default", name: "StockFlow Default" },
  ]);
  const [activeBusinessId, setActiveBusinessId] = useState("default");
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingParcels, setPendingParcels] = useState<PendingParcel[]>([]);
  const [transitGoods, setTransitGoods] = useState<TransitRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [godowns, setGodowns] = useState<string[]>([
    "Main Godown",
    "Side Godown",
  ]);
  const [biltyPrefixes] = useState<string[]>(["sola", "erob", "cheb", "0"]);
  const [customColumns, setCustomColumns] = useState<CustomColumns>({
    transit: [],
    warehouse: [],
    inward: [],
  });
  const [users, setUsers] = useState<AppUser[]>([
    { username: "admin", password: "password", role: "admin" },
    { username: "staff", password: "password", role: "staff" },
    { username: "supplier", password: "password", role: "supplier" },
  ]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem("stockflow_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [openingParcel, setOpeningParcel] = useState<PendingParcel | null>(
    null,
  );
  const [transportTracking, setTransportTracking] = useState<
    Record<string, string>
  >({});
  const [fieldLabels, setFieldLabels] = useState<
    Record<string, Record<string, string>>
  >({});
  const [requiredFields, setRequiredFields] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [fieldOrder, setFieldOrder] = useState<Record<string, string[]>>({});
  const [tabNames, setTabNames] = useState<Record<string, string>>({
    dashboard: "Inventory Hub",
    transit: "Transit Ledger",
    warehouse: "Arrival Queue",
    inward: "Inward Processing",
    opening: "Opening Stock",
    transfer: "Transfers",
    sales: "Sales",
    history: "History Log",
    inwardSaved: "Inward Saved",
    godownStock: "Godown Stock",
    analytics: "Analytics",
    settings: "Admin Settings",
  });
  const [_inwardRecords, _setInwardRecords] = useState<InwardRecord[]>([]);
  const [inwardSaved, setInwardSaved] = useState<InwardSavedEntry[]>([]);
  const [thresholdExcludedItems, setThresholdExcludedItems] = useState<
    string[]
  >([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(
    null,
  );
  const [moveToQueueData, setMoveToQueueData] = useState<TransitRecord | null>(
    null,
  );

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeInDown { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
      .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (currentUser?.role === "supplier" && activeTab !== "transit")
      setActiveTab("transit");
  }, [currentUser, activeTab]);

  // Morning backup reminder for admin
  useEffect(() => {
    if (currentUser?.role === "admin") {
      const today = new Date().toDateString();
      const lastReminder = localStorage.getItem("stockflow_backup_reminder");
      if (lastReminder !== today) {
        localStorage.setItem("stockflow_backup_reminder", today);
        setTimeout(() => {
          setNotification({
            message: "Reminder: Please download a data backup today!",
            type: "warning",
          });
          setTimeout(() => setNotification(null), 6000);
        }, 1500);
      }
    }
  }, [currentUser]);

  const showNotification = (message: string, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const generateSku = (
    category: string,
    itemName: string,
    attributes: Record<string, string>,
    saleRate: string,
    businessId: string,
  ) => {
    const attrStr = Object.entries(attributes || {})
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
    const baseSku = btoa(
      encodeURIComponent(
        `${category}|${formatItemName(itemName)}|${attrStr}|${saleRate || 0}`,
      ),
    );
    return businessId ? `${businessId}_${baseSku}` : baseSku;
  };

  const updateStock = (
    sku: string,
    details: Partial<InventoryItem>,
    shopDelta: number,
    godownDelta: number,
    targetGodown = "Main Godown",
  ) => {
    setInventory((prev) => {
      const current: InventoryItem = prev[sku] || {
        sku,
        category: details.category || "",
        itemName: formatItemName(details.itemName || ""),
        attributes: details.attributes || {},
        shop: 0,
        godowns: {},
        saleRate: details.saleRate || 0,
        purchaseRate: details.purchaseRate || 0,
        businessId: activeBusinessId,
      };
      const nextGodowns = { ...current.godowns };
      nextGodowns[targetGodown] =
        (Number(nextGodowns[targetGodown]) || 0) + Number(godownDelta);
      return {
        ...prev,
        [sku]: {
          ...current,
          shop: (Number(current.shop) || 0) + Number(shopDelta),
          godowns: nextGodowns,
          saleRate: details.saleRate ?? current.saleRate,
          purchaseRate: details.purchaseRate ?? current.purchaseRate,
        },
      };
    });
  };

  const exportDatabase = () => {
    const data = {
      inventory,
      transactions,
      pendingParcels,
      transitGoods,
      fieldLabels,
      requiredFields,
      fieldOrder,
      categories,
      godowns,
      biltyPrefixes,
      customColumns,
      users,
      minStockThreshold,
      businesses,
      activeBusinessId,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `StockFlow_Backup_${Date.now()}.json`;
    link.click();
  };

  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.inventory) setInventory(data.inventory);
        if (data.transactions) setTransactions(data.transactions);
        if (data.pendingParcels) setPendingParcels(data.pendingParcels);
        if (data.transitGoods) setTransitGoods(data.transitGoods);
        if (data.fieldLabels) setFieldLabels(data.fieldLabels);
        if (data.requiredFields) setRequiredFields(data.requiredFields);
        if (data.fieldOrder) setFieldOrder(data.fieldOrder);
        if (data.customColumns) setCustomColumns(data.customColumns);
        if (data.categories) setCategories(data.categories);
        if (data.users) setUsers(data.users);
        if (data.businesses) setBusinesses(data.businesses);
        if (data.activeBusinessId) setActiveBusinessId(data.activeBusinessId);
        showNotification("System Restore Complete");
      } catch {
        showNotification("Corrupt Backup File", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!currentUser)
    return (
      <>
        <LoginScreen
          users={users}
          onLogin={setCurrentUser}
          showNotification={showNotification}
        />
        {notification && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-4 rounded-3xl shadow-2xl animate-fade-in-down w-[90%] max-w-sm text-white font-black uppercase text-[10px] tracking-widest bg-gray-900 border border-gray-700">
            {notification.type === "success" ? (
              <CheckCircle className="text-green-400" />
            ) : (
              <AlertCircle className="text-red-400" />
            )}
            {notification.message}
          </div>
        )}
      </>
    );

  const activeBusiness =
    businesses.find((b) => b.id === activeBusinessId) || businesses[0];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-24 md:pb-0 md:pl-64 flex flex-col">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-md">
            <Package size={18} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black uppercase tracking-tighter text-sm leading-none">
              StockFlow
            </h1>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
              {activeBusiness?.name}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("stockflow_user");
            setCurrentUser(null);
          }}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen fixed left-0 top-0 shadow-sm z-20">
        <div className="p-8 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-2xl text-white shadow-xl shadow-blue-100">
              <Package size={24} />
            </div>
            <h1 className="font-black uppercase tracking-tighter text-lg leading-none">
              Stock
              <br />
              <span className="text-blue-600">Flow</span>
            </h1>
          </div>
        </div>
        <div className="px-6 py-4 border-b bg-gray-50/50">
          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest block mb-1">
            Business Profile
          </p>
          <select
            value={activeBusinessId}
            onChange={(e) => setActiveBusinessId(e.target.value)}
            className="w-full border rounded-xl p-2 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto scrollbar-hide">
          {currentUser.role !== "supplier" && (
            <SidebarButton
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
              icon={LayoutDashboard}
              label={tabNames.dashboard}
            />
          )}
          <SidebarButton
            active={activeTab === "transit"}
            onClick={() => setActiveTab("transit")}
            icon={Navigation}
            label={tabNames.transit}
          />
          {currentUser.role !== "supplier" && (
            <>
              <SidebarButton
                active={activeTab === "warehouse"}
                onClick={() => setActiveTab("warehouse")}
                icon={Warehouse}
                label={tabNames.warehouse}
              />
              <SidebarButton
                active={activeTab === "inward"}
                onClick={() => setActiveTab("inward")}
                icon={PlusCircle}
                label={tabNames.inward}
              />
              {currentUser.role === "admin" && (
                <SidebarButton
                  active={activeTab === "opening"}
                  onClick={() => setActiveTab("opening")}
                  icon={PackagePlus}
                  label={tabNames.opening}
                />
              )}
              <SidebarButton
                active={activeTab === "transfer"}
                onClick={() => setActiveTab("transfer")}
                icon={ArrowRightLeft}
                label={tabNames.transfer}
              />
              {currentUser.role === "admin" && (
                <SidebarButton
                  active={activeTab === "sales"}
                  onClick={() => setActiveTab("sales")}
                  icon={ShoppingCart}
                  label={tabNames.sales}
                />
              )}
              <SidebarButton
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                icon={History}
                label={tabNames.history}
              />
              <SidebarButton
                active={activeTab === "inwardSaved"}
                onClick={() => setActiveTab("inwardSaved")}
                icon={CheckCircle}
                label={tabNames.inwardSaved}
              />
              <SidebarButton
                active={activeTab === "godownStock"}
                onClick={() => setActiveTab("godownStock")}
                icon={Warehouse}
                label={tabNames.godownStock}
              />
              {currentUser.role === "admin" && (
                <SidebarButton
                  active={activeTab === "analytics"}
                  onClick={() => setActiveTab("analytics")}
                  icon={BarChart2}
                  label={tabNames.analytics}
                />
              )}
            </>
          )}
          {currentUser.role === "admin" && (
            <SidebarButton
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              icon={Settings}
              label={tabNames.settings}
            />
          )}
        </nav>
        <div className="p-6 border-t bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-200 p-2 rounded-full text-gray-500">
              <User size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-none truncate w-24">
                {currentUser.username}
              </p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                {currentUser.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("stockflow_user");
              setCurrentUser(null);
            }}
            className="w-full bg-white border border-red-100 text-red-500 font-bold py-2 rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
        <div className="p-3 border-t bg-gray-100/50 text-center">
          <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
            Powered by JPS
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-10 max-w-6xl mx-auto flex-1 w-full relative">
        {activeTab === "dashboard" && currentUser.role !== "supplier" && (
          <DashboardTab
            inventory={inventory}
            minStockThreshold={minStockThreshold}
            activeBusinessId={activeBusinessId}
            transactions={transactions}
            onItemClick={(sku) => setSelectedHistoryItem(sku)}
            thresholdExcludedItems={thresholdExcludedItems}
          />
        )}
        {activeTab === "transit" && (
          <TransitTab
            transitGoods={transitGoods}
            setTransitGoods={setTransitGoods}
            biltyPrefixes={biltyPrefixes}
            showNotification={showNotification}
            currentUser={currentUser}
            customColumns={customColumns.transit}
            setConfirmDialog={setConfirmDialog}
            activeBusinessId={activeBusinessId}
            allTransitGoods={transitGoods}
            categories={categories}
            transportTracking={transportTracking}
            setMoveToQueueData={setMoveToQueueData}
            setActiveTabFromTransit={setActiveTab}
            pendingParcels={pendingParcels}
            transactions={transactions}
            inwardSaved={inwardSaved}
            fieldLabels={fieldLabels}
          />
        )}
        {activeTab === "warehouse" && currentUser.role !== "supplier" && (
          <WarehouseTab
            pendingParcels={pendingParcels}
            setPendingParcels={setPendingParcels}
            setOpeningParcel={setOpeningParcel}
            setActiveTab={setActiveTab}
            setTransitGoods={setTransitGoods}
            inventory={inventory}
            biltyPrefixes={biltyPrefixes}
            customColumns={customColumns.warehouse}
            showNotification={showNotification}
            setConfirmDialog={setConfirmDialog}
            activeBusinessId={activeBusinessId}
            transportTracking={transportTracking}
            categories={categories}
            transitGoods={transitGoods}
            moveToQueueData={moveToQueueData}
            clearMoveToQueueData={() => setMoveToQueueData(null)}
            existingQueueBiltyNos={pendingParcels
              .filter((p) => !p.businessId || p.businessId === activeBusinessId)
              .map((p) => p.biltyNo)}
            transactions={transactions}
            inwardSaved={inwardSaved}
            fieldLabels={fieldLabels}
          />
        )}
        {activeTab === "inward" && currentUser.role !== "supplier" && (
          <InwardTab
            inventory={inventory}
            categories={categories}
            updateStock={updateStock}
            setTransactions={setTransactions}
            showNotification={showNotification}
            currentUser={currentUser}
            generateSku={generateSku}
            openingParcel={openingParcel}
            setOpeningParcel={setOpeningParcel}
            pendingParcels={pendingParcels}
            setPendingParcels={setPendingParcels}
            transitGoods={transitGoods}
            setTransitGoods={setTransitGoods}
            godowns={godowns}
            biltyPrefixes={biltyPrefixes}
            customColumns={customColumns.inward}
            activeBusinessId={activeBusinessId}
            transactions={transactions}
            setInventory={setInventory}
            setConfirmDialog={setConfirmDialog}
            setInwardSaved={setInwardSaved}
            inwardSaved={inwardSaved}
            fieldLabels={fieldLabels}
          />
        )}
        {activeTab === "opening" && currentUser.role === "admin" && (
          <OpeningStockTab
            inventory={inventory}
            setInventory={setInventory}
            categories={categories}
            godowns={godowns}
            setTransactions={setTransactions}
            activeBusinessId={activeBusinessId}
            currentUser={currentUser}
            showNotification={showNotification}
          />
        )}
        {activeTab === "transfer" && currentUser.role !== "supplier" && (
          <TransferTab
            inventory={inventory}
            updateStock={updateStock}
            showNotification={showNotification}
            godowns={godowns}
            activeBusinessId={activeBusinessId}
            setTransactions={setTransactions}
            currentUser={currentUser}
          />
        )}
        {activeTab === "sales" && currentUser.role === "admin" && (
          <SalesTab
            inventory={inventory}
            updateStock={updateStock}
            setTransactions={setTransactions}
            showNotification={showNotification}
            currentUser={currentUser}
            godowns={godowns}
            activeBusinessId={activeBusinessId}
            categories={categories}
          />
        )}
        {activeTab === "history" && currentUser.role !== "supplier" && (
          <HistoryTab
            transactions={transactions}
            setConfirmDialog={setConfirmDialog}
            setTransactions={setTransactions}
            activeBusinessId={activeBusinessId}
            currentUser={currentUser}
            inventory={inventory}
            transitGoods={transitGoods}
            pendingParcels={pendingParcels}
            categories={categories}
            godowns={godowns}
            showNotification={showNotification}
          />
        )}
        {activeTab === "inwardSaved" && currentUser.role !== "supplier" && (
          <InwardSavedTab
            inwardSaved={inwardSaved}
            setInwardSaved={setInwardSaved}
            currentUser={currentUser}
            transactions={transactions}
            activeBusinessId={activeBusinessId}
            showNotification={showNotification}
          />
        )}
        {activeTab === "godownStock" && currentUser.role !== "supplier" && (
          <GodownStockTab
            inventory={inventory}
            godowns={godowns}
            activeBusinessId={activeBusinessId}
          />
        )}
        {activeTab === "analytics" && currentUser.role === "admin" && (
          <AnalyticsTab
            transactions={transactions}
            activeBusinessId={activeBusinessId}
            godowns={godowns}
          />
        )}
        {activeTab === "settings" && currentUser.role === "admin" && (
          <SettingsTab
            users={users}
            setUsers={setUsers}
            categories={categories}
            setCategories={setCategories}
            customColumns={customColumns}
            setCustomColumns={setCustomColumns}
            exportDatabase={exportDatabase}
            importDatabase={importDatabase}
            showNotification={showNotification}
            setPromptDialog={setPromptDialog}
            setConfirmDialog={setConfirmDialog}
            businesses={businesses}
            setBusinesses={setBusinesses}
            activeBusinessId={activeBusinessId}
            setActiveBusinessId={setActiveBusinessId}
            inventory={inventory}
            setInventory={setInventory}
            godowns={godowns}
            setGodowns={setGodowns}
            minStockThreshold={minStockThreshold}
            setMinStockThreshold={setMinStockThreshold}
            setTransactions={setTransactions}
            currentUser={currentUser}
            transportTracking={transportTracking}
            setTransportTracking={setTransportTracking}
            tabNames={tabNames}
            setTabNames={setTabNames}
            fieldLabels={fieldLabels}
            setFieldLabels={setFieldLabels}
            requiredFields={requiredFields}
            setRequiredFields={setRequiredFields}
            fieldOrder={fieldOrder}
            setFieldOrder={setFieldOrder}
            thresholdExcludedItems={thresholdExcludedItems}
            setThresholdExcludedItems={setThresholdExcludedItems}
          />
        )}

        {/* Item History Panel */}
        <ItemHistoryPanel
          sku={selectedHistoryItem}
          inventory={inventory}
          transactions={transactions}
          activeBusinessId={activeBusinessId}
          onClose={() => setSelectedHistoryItem(null)}
        />

        {/* Confirm Dialog */}
        {confirmDialog && (
          <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full animate-fade-in-down">
              <h3 className="text-xl font-black text-gray-800 mb-4">
                Confirm Action
              </h3>
              <p className="text-sm font-bold text-gray-500 mb-6">
                {confirmDialog.message}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Dialog */}
        {promptDialog && (
          <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = (e.target as HTMLFormElement).promptInput.value;
                promptDialog.onConfirm(val);
                setPromptDialog(null);
              }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full animate-fade-in-down"
            >
              <h3 className="text-xl font-black text-gray-800 mb-2">
                Input Required
              </h3>
              <p className="text-xs font-bold text-gray-500 mb-4">
                {promptDialog.message}
              </p>
              <input
                name="promptInput"
                type="text"
                defaultValue={promptDialog.defaultValue || ""}
                className="w-full border rounded-xl p-4 outline-none font-bold focus:ring-2 focus:ring-blue-500 mb-6 bg-gray-50"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPromptDialog(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t flex overflow-x-auto scrollbar-hide items-center p-2 z-10 gap-0.5">
        {currentUser.role !== "supplier" && (
          <NavButton
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
            icon={LayoutDashboard}
            label={tabNames.dashboard}
          />
        )}
        <NavButton
          active={activeTab === "transit"}
          onClick={() => setActiveTab("transit")}
          icon={Navigation}
          label={tabNames.transit}
        />
        {currentUser.role !== "supplier" && (
          <>
            <NavButton
              active={activeTab === "warehouse"}
              onClick={() => setActiveTab("warehouse")}
              icon={Warehouse}
              label="Queue"
            />
            <NavButton
              active={activeTab === "inward"}
              onClick={() => setActiveTab("inward")}
              icon={PlusCircle}
              label="Inward"
            />
            <NavButton
              active={activeTab === "opening"}
              onClick={() => setActiveTab("opening")}
              icon={PackagePlus}
              label="Opening"
            />
            <NavButton
              active={activeTab === "transfer"}
              onClick={() => setActiveTab("transfer")}
              icon={ArrowRightLeft}
              label="Move"
            />
            {currentUser.role === "admin" && (
              <NavButton
                active={activeTab === "sales"}
                onClick={() => setActiveTab("sales")}
                icon={ShoppingCart}
                label="Sales"
              />
            )}
            <NavButton
              active={activeTab === "inwardSaved"}
              onClick={() => setActiveTab("inwardSaved")}
              icon={CheckCircle}
              label="Saved"
            />
            <NavButton
              active={activeTab === "godownStock"}
              onClick={() => setActiveTab("godownStock")}
              icon={Warehouse}
              label="Stock"
            />
            {currentUser.role === "admin" && (
              <NavButton
                active={activeTab === "analytics"}
                onClick={() => setActiveTab("analytics")}
                icon={BarChart2}
                label="Analytics"
              />
            )}
          </>
        )}
        {currentUser.role === "admin" && (
          <NavButton
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            icon={Settings}
            label="Admin"
          />
        )}
      </nav>

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 md:top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-6 py-4 rounded-3xl shadow-2xl animate-fade-in-down w-[90%] max-w-sm text-white font-black uppercase text-[10px] tracking-widest bg-gray-900 border border-gray-700">
          {notification.type === "success" ? (
            <CheckCircle className="text-green-400" />
          ) : (
            <AlertCircle className="text-red-400" />
          )}
          {notification.message}
        </div>
      )}
    </div>
  );
}
