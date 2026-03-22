import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Box,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  History,
  Key,
  LayoutDashboard,
  Loader2,
  LogOut,
  Navigation,
  Package,
  PackagePlus,
  Pencil,
  PlusCircle,
  Search,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  User,
  Warehouse,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

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

const callGemini = async (prompt: string, isJson = false): Promise<unknown> => {
  const apiKey = localStorage.getItem("geminiApiKey") || "";
  if (!apiKey)
    return isJson
      ? {}
      : "AI API Key missing. Please provide a valid Gemini API Key.";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload: Record<string, unknown> = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (isJson)
    payload.generationConfig = { responseMimeType: "application/json" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return isJson ? JSON.parse(text) : text;
  } catch (err) {
    console.error(err);
    return isJson ? {} : "AI Request Failed.";
  }
};

/* ================= SHARED COMPONENTS ================= */
function BiltyInput({
  prefixOptions,
  prefix,
  setPrefix,
  number,
  setNumber,
  onSearch,
}: {
  prefixOptions?: string[];
  prefix: string;
  setPrefix: (v: string) => void;
  number: string;
  setNumber: (v: string) => void;
  onSearch?: (p: string, n: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
        Bilty Number *
      </p>
      <div className="flex gap-2">
        <select
          value={prefix}
          onChange={(e) => {
            setPrefix(e.target.value);
            if (onSearch) onSearch(e.target.value, number);
          }}
          className="w-1/3 border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold bg-gray-50 uppercase"
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
          className="w-2/3 border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
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
  // biome-ignore lint/correctness/noUnusedVariables: used in shareWhatsApp
  transactions,
}: {
  inventory: Record<string, InventoryItem>;
  minStockThreshold: number;
  activeBusinessId: string;
  transactions: Transaction[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    const item = inventory[sku];
    const threshold = item.minThreshold ?? minStockThreshold;
    return getTotalGodownStock(item) < threshold;
  });

  const handleGetInsights = async () => {
    setIsAnalyzing(true);
    const res = await callGemini(
      `Analyze this inventory data briefly and give 2 business insights: ${JSON.stringify(inventory)}`,
      false,
    );
    setAiInsight(String(res));
    setIsAnalyzing(false);
  };

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
          <button
            type="button"
            onClick={handleGetInsights}
            disabled={isAnalyzing}
            className="bg-indigo-600 p-3 rounded-2xl text-white hover:bg-indigo-700 transition-all shadow-md"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl shadow-sm relative animate-fade-in-down">
          <button
            type="button"
            onClick={() => setAiInsight(null)}
            className="absolute top-3 right-3 text-indigo-400 hover:text-indigo-600"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-800 mb-1">
            AI Insights
          </h3>
          <p className="text-xs text-indigo-900 leading-relaxed font-bold">
            {aiInsight}
          </p>
        </div>
      )}

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
                          className={`transition-colors ${isCritical ? "bg-red-50 hover:bg-red-100/60" : "hover:bg-blue-50/30"}`}
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
}) {
  const [showForm, setShowForm] = useState(false);
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
    showNotification("Saved Transit Entry", "success");
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
    if (filterDateFrom && g.date < filterDateFrom) return false;
    if (filterDateTo && g.date > filterDateTo) return false;
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
              <p className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer hover:bg-indigo-100 transition-colors">
                <Upload size={14} /> Import CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </p>
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
                Date
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
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="From"
          />
          <span className="text-gray-400 text-xs font-bold">–</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="border rounded-xl p-2.5 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="To"
          />
        </div>
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
  allBiltyNos,
  existingQueueBiltyNos,
  transitGoods,
  categories,
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
  allBiltyNos?: string[];
  existingQueueBiltyNos?: string[];
  transitGoods?: TransitRecord[];
  categories?: Category[];
}) {
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

  // Auto-fill from Transit when bilty matches
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on bilty change
  useEffect(() => {
    if (!biltyNumber || !transitGoods) return;
    const bNo =
      biltyPrefix === "0" ? biltyNumber : `${biltyPrefix}-${biltyNumber}`;
    const transitMatch = (transitGoods || []).find(
      (g) =>
        (!g.businessId || g.businessId === activeBusinessId) &&
        g.biltyNo?.toLowerCase() === bNo.toLowerCase(),
    );
    if (transitMatch) {
      setForm((prev) => ({
        ...prev,
        transportName: transitMatch.transportName || prev.transportName,
        supplier: transitMatch.supplierName || prev.supplier,
        itemCategory:
          transitMatch.itemCategory ||
          transitMatch.category ||
          prev.itemCategory,
        itemName: transitMatch.itemName || prev.itemName,
      }));
      showNotification("Auto-filled from Transit entry.", "success");
    }
  }, [biltyNumber, biltyPrefix]);

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biltyNumber) return showNotification("Bilty number required", "error");
    const bNo =
      biltyPrefix === "0" ? biltyNumber : `${biltyPrefix}-${biltyNumber}`;
    const queueBiltyList = existingQueueBiltyNos ?? allBiltyNos ?? [];
    if (queueBiltyList.some((b) => b.toLowerCase() === bNo.toLowerCase())) {
      return showNotification(`Bilty ${bNo} already exists in Queue!`, "error");
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
    if (filterDateFrom && pDate < filterDateFrom) return false;
    if (filterDateTo && pDate > filterDateTo) return false;
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
            <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
              Item Name
            </p>
            <input
              type="text"
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              className="w-full border rounded-xl p-2.5 outline-none font-bold bg-gray-50 focus:bg-white"
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
          Log Arrival to Queue
        </button>
      </form>
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
        {(filterDateFrom ||
          filterDateTo ||
          filterCategory ||
          filterItemName) && (
          <button
            type="button"
            onClick={() => {
              setFilterDateFrom("");
              setFilterDateTo("");
              setFilterCategory("");
              setFilterItemName("");
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

/* ================= AI SETTINGS PANEL ================= */
function AISettingsPanel() {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("geminiApiKey") || "",
  );
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("geminiApiKey", apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
          <Key size={20} />
        </div>
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest text-gray-800">
            AI / Gemini Settings
          </h4>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
            Enter your Google Gemini API key to enable AI features.
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
            Gemini API Key
          </p>
          <div className="flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="flex-1 border rounded-2xl p-4 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="bg-gray-100 hover:bg-gray-200 px-4 rounded-2xl font-bold text-xs text-gray-600 transition-colors"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className={`w-full font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-lg transition-colors ${saved ? "bg-green-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
        >
          {saved ? "Saved!" : "Save API Key"}
        </button>
        <p className="text-[10px] text-gray-400 font-bold text-center">
          Get a free API key at{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline"
          >
            aistudio.google.com
          </a>
        </p>
      </div>
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
}) {
  const [biltyPrefix, setBiltyPrefix] = useState(biltyPrefixes?.[0] || "0");
  const [biltyNumber, setBiltyNumber] = useState("");
  const [baleItems, setBaleItems] = useState<BaleItem[]>([]);
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
  const [rawMessage, setRawMessage] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
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

  const handleLookup = (pPrefix: string, pNumber: string) => {
    const bNo = pPrefix === "0" ? pNumber : `${pPrefix}-${pNumber}`;
    const searchStr = bNo.toLowerCase();
    const transitMatch = transitGoods.find(
      (g) => g.biltyNo?.toLowerCase() === searchStr,
    );
    const queueMatch = pendingParcels.find(
      (p) => p.biltyNo?.toLowerCase() === searchStr,
    );
    const match = queueMatch || transitMatch;
    if (match) {
      setMatchedDetails(match);
      setItemForm((prev) => ({
        ...prev,
        itemName: (match as TransitRecord).itemName || prev.itemName,
        category: (match as TransitRecord).category || prev.category || "",
      }));
      showNotification("Found Bilty! Data auto-filled.", "success");
    } else {
      setMatchedDetails(null);
    }
  };

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
    // Auto-create new inventory items typed in combo box
    for (const item of baleItems) {
      if (item.itemName && item.category) {
        const exists = Object.values(inventory).some(
          (inv) =>
            (!inv.businessId || inv.businessId === activeBusinessId) &&
            inv.category === item.category &&
            inv.itemName.toLowerCase() === item.itemName.toLowerCase(),
        );
        if (!exists) {
          const newSku = generateSku(
            item.category,
            item.itemName,
            {},
            "0",
            activeBusinessId,
          );
          setInventory((prev) => ({
            ...prev,
            [newSku]: {
              sku: newSku,
              category: item.category,
              itemName: item.itemName,
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
        itemsCount: baleItems.length,
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
    }
    setBaleItems([]);
    setBiltyNumber("");
    setMatchedDetails(null);
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

  const extractAI = async () => {
    setIsExtracting(true);
    const data = (await callGemini(
      `Extract item info from this text into JSON format matching: { "items": [ { "itemName": "str", "category": "str", "shopQty": num, "saleRate": num } ] }. Text: ${rawMessage}`,
      true,
    )) as {
      items?: {
        itemName?: string;
        category?: string;
        shopQty?: number;
        saleRate?: number;
      }[];
    };
    if (data?.items) {
      const mapped: BaleItem[] = data.items.map((i, idx) => ({
        ...itemForm,
        itemName: i.itemName || "",
        category: i.category || "",
        shopQty: String(i.shopQty || 0),
        saleRate: String(i.saleRate || ""),
        id: Date.now() + idx,
        sku: generateSku(
          i.category || "",
          i.itemName || "",
          {},
          String(i.saleRate || 0),
          activeBusinessId,
        ),
      }));
      setBaleItems((prev) => [...prev, ...mapped]);
      showNotification("AI Extraction Complete!");
    } else {
      showNotification("AI couldn't extract data.", "error");
    }
    setIsExtracting(false);
  };

  const selectedCat = categories.find((c) => c.name === itemForm.category);
  const showItemForm = biltyNumber.length > 0 || openingParcel || isDirectEntry;

  return (
    <div className="space-y-6 animate-fade-in-down">
      <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2 border-b pb-4">
        <PlusCircle className="text-green-600" /> Process Inward
      </h2>

      {!openingParcel && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-5 shadow-sm text-sm">
          <p className="block font-black text-indigo-900 mb-2 uppercase tracking-widest text-[10px]">
            <Sparkles className="w-4 h-4 inline mr-1" /> AI Auto-Fill via Text
            Message
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              value={rawMessage}
              onChange={(e) => setRawMessage(e.target.value)}
              placeholder="Paste WhatsApp message from supplier..."
              className="w-full border border-indigo-100 rounded-2xl p-4 bg-white outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-14"
            />
            <button
              type="button"
              onClick={extractAI}
              disabled={isExtracting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl shadow-md transition-colors uppercase text-[10px] tracking-widest"
            >
              {isExtracting ? "Parsing..." : "Extract"}
            </button>
          </div>
        </div>
      )}

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
            <div className="flex gap-2 items-end mt-2">
              <BiltyInput
                prefixOptions={biltyPrefixes}
                prefix={biltyPrefix}
                setPrefix={setBiltyPrefix}
                number={biltyNumber}
                setNumber={setBiltyNumber}
                onSearch={handleLookup}
              />
            </div>
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

      {showItemForm && (
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
            <ItemNameCombo
              category={itemForm.category}
              value={itemForm.itemName}
              onChange={(val) => setItemForm({ ...itemForm, itemName: val })}
              inventory={inventory}
              activeBusinessId={activeBusinessId}
            />
          </div>
          {selectedCat && (
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedCat.fields.map((f) => (
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

      {baleItems.length > 0 && (
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
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
                  Total Qty (Expected)
                </p>
                <input
                  type="number"
                  value={totalQty}
                  onChange={(e) => setTotalQty(e.target.value)}
                  placeholder="Expected total"
                  className="w-full border rounded-xl p-2.5 font-bold outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
                />
                {totalQty &&
                  (() => {
                    const actual = baleItems.reduce(
                      (sum, i) =>
                        sum +
                        (Number(i.shopQty) || 0) +
                        Object.values(i.godownQuants).reduce(
                          (a, b) => a + Number(b || 0),
                          0,
                        ),
                      0,
                    );
                    return Number(totalQty) !== actual ? (
                      <p className="text-orange-600 text-[10px] font-bold mt-1">
                        ⚠ Expected {totalQty}, entered {actual}
                      </p>
                    ) : (
                      <p className="text-green-600 text-[10px] font-bold mt-1">
                        ✓ Totals match
                      </p>
                    );
                  })()}
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
          <p className="text-[10px] font-black uppercase text-gray-400 ml-1">
            Search Product
          </p>
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
}: {
  transactions: Transaction[];
  setConfirmDialog: (
    d: { message: string; onConfirm: () => void } | null,
  ) => void;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  activeBusinessId: string;
  currentUser: AppUser;
}) {
  const [search, setSearch] = useState("");
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const runAIAuditor = async () => {
    setIsAuditing(true);
    const res = await callGemini(
      `Audit these last few transactions for anomalies or supply chain notes: ${JSON.stringify(transactions.slice(0, 10))}`,
    );
    setAuditReport(String(res));
    setIsAuditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-down">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" /> Tracking Log
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={runAIAuditor}
            disabled={isAuditing}
            className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors"
          >
            {isAuditing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}{" "}
            AI Auditor
          </button>
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
      {auditReport && (
        <div className="bg-purple-50 border border-purple-200 p-5 rounded-3xl shadow-sm relative animate-fade-in-down">
          <button
            type="button"
            onClick={() => setAuditReport(null)}
            className="absolute top-4 right-4 text-purple-400 hover:text-purple-600"
          >
            <X size={18} />
          </button>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-800 mb-2">
            Audit Report
          </h3>
          <p className="text-sm text-purple-900 leading-relaxed font-bold">
            {auditReport}
          </p>
        </div>
      )}
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
                        <span className="font-black text-gray-900 uppercase text-lg tracking-tight">
                          {t.biltyNo}
                        </span>
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
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in-down">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-gray-800 uppercase text-sm tracking-wider">
                Edit Entry
              </h3>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {(
                [
                  { label: "Bilty No", key: "biltyNo" },
                  { label: "Item Name", key: "itemName" },
                  { label: "Category", key: "category" },
                  { label: "Transport", key: "transportName" },
                  { label: "Opened By / User", key: "user" },
                  { label: "Notes", key: "notes" },
                  { label: "From Location", key: "fromLocation" },
                  { label: "To Location", key: "toLocation" },
                ] as const
              ).map(({ label, key }) => (
                <div key={key}>
                  <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
                    {label}
                  </p>
                  <input
                    type="text"
                    value={
                      (editingTx[key as keyof Transaction] as string) || ""
                    }
                    onChange={(e) =>
                      setEditingTx({
                        ...editingTx,
                        [key]: e.target.value,
                      } as Transaction)
                    }
                    className="w-full border rounded-xl p-3 font-bold bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 ml-1 mb-1">
                  Qty Count
                </p>
                <input
                  type="number"
                  value={editingTx.itemsCount ?? ""}
                  onChange={(e) =>
                    setEditingTx({
                      ...editingTx,
                      itemsCount:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
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
                    setEditingTx({ ...editingTx, date: e.target.value })
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
                  setTransactions((prev) =>
                    prev.map((tx) => (tx.id === editingTx.id ? editingTx : tx)),
                  );
                  setEditingTx(null);
                }}
                className="flex-1 bg-blue-600 text-white font-black py-3 rounded-2xl uppercase text-[10px] tracking-widest shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
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
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
              Item Name
            </p>
            <div className="relative">
              <input
                type="text"
                value={itemName}
                onChange={(e) => handleItemNameChange(e.target.value)}
                onBlur={() =>
                  setTimeout(() => setShowPriceSuggestions(false), 200)
                }
                placeholder="Enter item name"
                required
                data-ocid="opening.item_name.input"
                className="w-full border rounded-xl p-3 outline-none font-bold focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-sm"
              />
              {showPriceSuggestions && priceSuggestions.length > 0 && (
                <div className="absolute z-10 left-0 right-0 bg-white border rounded-xl shadow-xl mt-1">
                  <p className="text-[9px] font-black uppercase text-gray-400 px-3 pt-2">
                    Known prices for this item
                  </p>
                  {priceSuggestions.map((s, i) => (
                    <button
                      type="button"
                      key={`price-${s.sale}-${s.purchase}-${i}`}
                      onClick={() => {
                        setSaleRate(s.sale);
                        setPurchaseRate(s.purchase);
                        setShowPriceSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-xs font-bold border-b last:border-0"
                    >
                      Sale: ₹{s.sale} · Purchase: ₹{s.purchase}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
}) {
  const [activeSub, setActiveSub] = useState("users");
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
            "users",
            "columns",
            "ai",
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
                      : sub === "users"
                        ? "Logins"
                        : sub === "columns"
                          ? "Forms"
                          : sub === "ai"
                            ? "AI Settings"
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
                <div className="flex justify-between items-center mb-6">
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
          {Object.keys(transportTracking).length === 0 ? (
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
                        if (
                          window.confirm(`Remove tracking for ${transport}?`)
                        ) {
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
          )}
        </div>
      )}

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

      {activeSub === "ai" && <AISettingsPanel />}

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
              className="w-full bg-green-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-lg mt-4"
            >
              Download Data
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
            <p className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-lg mt-4 cursor-pointer block text-center">
              Select File
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importDatabase}
              />
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SIDEBAR / NAV ================= */
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
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [openingParcel, setOpeningParcel] = useState<PendingParcel | null>(
    null,
  );
  const [transportTracking, setTransportTracking] = useState<
    Record<string, string>
  >({});
  const [tabNames, setTabNames] = useState<Record<string, string>>({
    dashboard: "Inventory Hub",
    transit: "Transit Ledger",
    warehouse: "Arrival Queue",
    inward: "Inward Processing",
    opening: "Opening Stock",
    transfer: "Transfers",
    history: "History Log",
    settings: "Admin Settings",
  });
  const [_inwardRecords, _setInwardRecords] = useState<InwardRecord[]>([]);

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
          onClick={() => setCurrentUser(null)}
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
            label="Transit Ledger"
          />
          {currentUser.role !== "supplier" && (
            <>
              <SidebarButton
                active={activeTab === "warehouse"}
                onClick={() => setActiveTab("warehouse")}
                icon={Warehouse}
                label="Arrival Queue"
              />
              <SidebarButton
                active={activeTab === "inward"}
                onClick={() => setActiveTab("inward")}
                icon={PlusCircle}
                label="Inward Processing"
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
                label="Transfers"
              />
              <SidebarButton
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                icon={History}
                label="History Ledger"
              />
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
            onClick={() => setCurrentUser(null)}
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
          />
        )}
        {activeTab === "warehouse" && currentUser.role !== "supplier" && (
          <WarehouseTab
            pendingParcels={pendingParcels}
            setPendingParcels={setPendingParcels}
            setOpeningParcel={setOpeningParcel}
            setActiveTab={setActiveTab}
            biltyPrefixes={biltyPrefixes}
            customColumns={customColumns.warehouse}
            showNotification={showNotification}
            setConfirmDialog={setConfirmDialog}
            activeBusinessId={activeBusinessId}
            transportTracking={transportTracking}
            categories={categories}
            transitGoods={transitGoods}
            existingQueueBiltyNos={pendingParcels
              .filter((p) => !p.businessId || p.businessId === activeBusinessId)
              .map((p) => p.biltyNo)}
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
        {activeTab === "history" && currentUser.role !== "supplier" && (
          <HistoryTab
            transactions={transactions}
            setConfirmDialog={setConfirmDialog}
            setTransactions={setTransactions}
            activeBusinessId={activeBusinessId}
            currentUser={currentUser}
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
          />
        )}

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
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t flex justify-around items-center p-2 z-10">
        {currentUser.role !== "supplier" && (
          <NavButton
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
            icon={LayoutDashboard}
            label="Stock"
          />
        )}
        <NavButton
          active={activeTab === "transit"}
          onClick={() => setActiveTab("transit")}
          icon={Navigation}
          label="Transit"
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
