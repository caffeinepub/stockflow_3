import {
  AlertCircle,
  ArrowRightLeft,
  BarChart2,
  CheckCircle,
  History,
  LayoutDashboard,
  LogOut,
  Navigation,
  Package,
  PackagePlus,
  PlusCircle,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  User,
  Warehouse,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { DashboardTab, ItemHistoryPanel } from "./components/DashboardTab";
import { DeliveryTab } from "./components/DeliveryTab";
import { GodownStockTab } from "./components/GodownStockTab";
import { HistoryTab } from "./components/HistoryTab";
import { InwardSavedTab } from "./components/InwardSavedTab";
import { InwardTab } from "./components/InwardTab";
import {
  LoginScreen,
  NavButton,
  SidebarButton,
} from "./components/LoginScreen";
import { OpeningStockTab } from "./components/OpeningStockTab";
import { SalesRecordTab } from "./components/SalesRecordTab";
import { SalesTab } from "./components/SalesTab";
import { SettingsTab } from "./components/SettingsTab";
import { TransferTab } from "./components/TransferTab";
import { TransitTab } from "./components/TransitTab";
import { WarehouseTab } from "./components/WarehouseTab";
import { INITIAL_CATEGORIES, formatItemName } from "./constants";
import type {
  AppUser,
  Business,
  Category,
  CustomColumns,
  DeliveryRecord,
  InventoryItem,
  InwardRecord,
  InwardSavedEntry,
  PendingParcel,
  Transaction,
  TransitRecord,
} from "./types";

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
  const [biltyPrefixes, setBiltyPrefixes] = useState<string[]>([
    "sola",
    "erob",
    "cheb",
    "0",
  ]);
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
  const [fieldTypes, setFieldTypes] = useState<
    Record<string, Record<string, "text" | "combo" | "drop">>
  >({});
  const [fieldComboOptions, setFieldComboOptions] = useState<
    Record<string, Record<string, string[]>>
  >({});
  const [customTabFields, setCustomTabFields] = useState<
    Record<string, { key: string; label: string }[]>
  >({});
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
    delivery: "Delivery",
    salesRecord: "Sales Record",
    settings: "Admin Settings",
  });
  const [_inwardRecords, _setInwardRecords] = useState<InwardRecord[]>([]);
  const [inwardSaved, setInwardSaved] = useState<InwardSavedEntry[]>([]);
  const [thresholdExcludedItems, setThresholdExcludedItems] = useState<
    string[]
  >([]);
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecord[]>([]);
  const [deliveredBilties, setDeliveredBilties] = useState<string[]>([]);
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
      fieldTypes,
      fieldComboOptions,
      categories,
      godowns,
      biltyPrefixes,
      customColumns,
      users,
      minStockThreshold,
      businesses,
      activeBusinessId,
      deliveryRecords,
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
        if (data.fieldTypes) setFieldTypes(data.fieldTypes);
        if (data.fieldComboOptions)
          setFieldComboOptions(data.fieldComboOptions);
        if (data.customColumns) setCustomColumns(data.customColumns);
        if (data.categories) setCategories(data.categories);
        if (data.users) setUsers(data.users);
        if (data.businesses) setBusinesses(data.businesses);
        if (data.activeBusinessId) setActiveBusinessId(data.activeBusinessId);
        if (data.deliveryRecords) setDeliveryRecords(data.deliveryRecords);
        showNotification("System Restore Complete");
      } catch {
        showNotification("Corrupt Backup File", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const allSuppliers = useMemo(() => {
    const fromTransit = transitGoods
      .filter((r) => r.businessId === activeBusinessId)
      .map((r) => r.supplierName);
    const fromQueue = pendingParcels
      .filter((r) => !r.businessId || r.businessId === activeBusinessId)
      .map((r) => r.supplier);
    const fromTxns = transactions
      .filter((r) => r.businessId === activeBusinessId)
      .map((r) => (r as any).supplier || (r as any).supplierName || "")
      .filter(Boolean);
    const all = [...new Set([...fromTransit, ...fromQueue, ...fromTxns])]
      .filter(Boolean)
      .sort();
    if (currentUser?.role === "supplier") {
      const mine = new Set(
        [
          ...transitGoods
            .filter(
              (r) =>
                r.addedBy === currentUser.username &&
                r.businessId === activeBusinessId,
            )
            .map((r) => r.supplierName),
          ...pendingParcels
            .filter(
              (r) =>
                (r as any).addedBy === currentUser.username &&
                (!r.businessId || r.businessId === activeBusinessId),
            )
            .map((r) => r.supplier),
        ].filter(Boolean) as string[],
      );
      return all.filter((s) => mine.has(s));
    }
    return all;
  }, [
    transitGoods,
    pendingParcels,
    transactions,
    activeBusinessId,
    currentUser,
  ]);

  const allTransporters = useMemo(() => {
    const fromTransit = transitGoods
      .filter((r) => r.businessId === activeBusinessId)
      .map((r) => r.transportName);
    const fromQueue = pendingParcels
      .filter((r) => !r.businessId || r.businessId === activeBusinessId)
      .map((r) => r.transportName);
    const fromTxns = transactions
      .filter((r) => r.businessId === activeBusinessId)
      .map((r) => (r as any).transportName || "")
      .filter(Boolean);
    const all = [...new Set([...fromTransit, ...fromQueue, ...fromTxns])]
      .filter(Boolean)
      .sort();
    if (currentUser?.role === "supplier") {
      const mine = new Set(
        [
          ...transitGoods
            .filter(
              (r) =>
                r.addedBy === currentUser.username &&
                r.businessId === activeBusinessId,
            )
            .map((r) => r.transportName),
          ...pendingParcels
            .filter(
              (r) =>
                (r as any).addedBy === currentUser.username &&
                (!r.businessId || r.businessId === activeBusinessId),
            )
            .map((r) => r.transportName),
        ].filter(Boolean) as string[],
      );
      return all.filter((t) => mine.has(t));
    }
    return all;
  }, [
    transitGoods,
    pendingParcels,
    transactions,
    activeBusinessId,
    currentUser,
  ]);

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
        <div className="flex items-center gap-2">
          {businesses.filter((b) => {
            if (currentUser.role === "admin") return true;
            if (
              !currentUser.assignedBusinessIds ||
              currentUser.assignedBusinessIds.length === 0
            )
              return true;
            return currentUser.assignedBusinessIds.includes(b.id);
          }).length > 1 && (
            <select
              value={activeBusinessId}
              onChange={(e) => setActiveBusinessId(e.target.value)}
              className="border rounded-lg p-1.5 text-[10px] font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500 max-w-[110px]"
            >
              {businesses
                .filter((b) => {
                  if (currentUser.role === "admin") return true;
                  if (
                    !currentUser.assignedBusinessIds ||
                    currentUser.assignedBusinessIds.length === 0
                  )
                    return true;
                  return currentUser.assignedBusinessIds.includes(b.id);
                })
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          )}
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
        </div>
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
            {businesses
              .filter((b) => {
                if (currentUser.role === "admin") return true;
                if (
                  !currentUser.assignedBusinessIds ||
                  currentUser.assignedBusinessIds.length === 0
                )
                  return true;
                return currentUser.assignedBusinessIds.includes(b.id);
              })
              .map((b) => (
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
              {currentUser.role === "admin" && (
                <SidebarButton
                  active={activeTab === "salesRecord"}
                  onClick={() => setActiveTab("salesRecord")}
                  icon={Receipt}
                  label={tabNames.salesRecord || "Sales Record"}
                />
              )}
              <SidebarButton
                active={activeTab === "delivery"}
                onClick={() => setActiveTab("delivery")}
                icon={Truck}
                label={tabNames.delivery || "Delivery"}
              />
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
            supplierOptions={allSuppliers}
            transportOptions={allTransporters}
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
            supplierOptions={allSuppliers}
            transportOptions={allTransporters}
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
            deliveredBilties={deliveredBilties}
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
        {activeTab === "delivery" && currentUser.role !== "supplier" && (
          <DeliveryTab
            inventory={inventory}
            setInventory={setInventory}
            pendingParcels={pendingParcels}
            setPendingParcels={setPendingParcels}
            godowns={godowns}
            categories={categories}
            currentUser={currentUser}
            activeBusinessId={activeBusinessId}
            deliveryRecords={deliveryRecords}
            setDeliveryRecords={setDeliveryRecords}
            transactions={transactions}
            setTransactions={setTransactions}
            updateStock={updateStock}
            showNotification={showNotification}
            onDeliveredBilty={(biltyNo) =>
              setDeliveredBilties((prev) => [...new Set([...prev, biltyNo])])
            }
          />
        )}
        {activeTab === "analytics" && currentUser.role === "admin" && (
          <AnalyticsTab
            transactions={transactions}
            activeBusinessId={activeBusinessId}
            godowns={godowns}
          />
        )}
        {activeTab === "salesRecord" && currentUser.role === "admin" && (
          <SalesRecordTab
            transactions={transactions}
            activeBusinessId={activeBusinessId}
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
            setTransitGoods={setTransitGoods}
            setPendingParcels={setPendingParcels}
            setInwardSaved={setInwardSaved}
            setDeliveryRecords={setDeliveryRecords}
            setDeliveredBilties={setDeliveredBilties}
            biltyPrefixes={biltyPrefixes}
            setBiltyPrefixes={setBiltyPrefixes}
            fieldTypes={fieldTypes}
            setFieldTypes={setFieldTypes}
            fieldComboOptions={fieldComboOptions}
            setFieldComboOptions={setFieldComboOptions}
            customTabFields={customTabFields}
            setCustomTabFields={setCustomTabFields}
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
            {currentUser.role === "admin" && (
              <NavButton
                active={activeTab === "salesRecord"}
                onClick={() => setActiveTab("salesRecord")}
                icon={Receipt}
                label="Rec"
              />
            )}
            <NavButton
              active={activeTab === "delivery"}
              onClick={() => setActiveTab("delivery")}
              icon={Truck}
              label="Delivery"
            />
            <NavButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
              icon={History}
              label="History"
            />
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
