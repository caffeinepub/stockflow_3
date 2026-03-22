import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Int "mo:core/Int";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // TYPES
  type CategoryField = {
    name : Text;
    fieldType : Text; // "Text", "Number", "Dropdown"
    options : [Text];
  };

  // DATA TYPES
  type Business = {
    id : Text;
    name : Text;
  };

  type Category = {
    name : Text;
    fields : [CategoryField];
  };

  type GodownStock = {
    name : Text;
    quantity : Int;
  };

  type InventoryItem = {
    sku : Text;
    category : Text;
    itemName : Text;
    attributes : [(Text, Text)];
    shop : Int;
    godowns : [GodownStock];
    saleRate : Float;
    purchaseRate : Float;
    businessId : Text;
    minThreshold : ?Int;
  };

  type TransitRecord = {
    id : Nat;
    biltyNo : Text;
    transportName : Text;
    supplierName : Text;
    itemName : Text;
    packages : Text;
    date : Text;
    addedBy : Text;
    businessId : Text;
    customData : [(Text, Text)];
  };

  type PendingParcel = {
    id : Nat;
    biltyNo : Text;
    transportName : Text;
    packages : Text;
    dateReceived : Text;
    businessId : Text;
    customData : [(Text, Text)];
  };

  type Transaction = {
    id : Nat;
    txType : Text;
    biltyNo : Text;
    businessId : Text;
    date : Text;
    user : Text;
    transportName : Text;
    itemsCount : Nat;
  };

  public type UserRole = {
    #admin;
    #user;
    #guest;
    #supplier;
  };

  type StockFlowUser = {
    id : Principal;
    username : Text;
    businessId : Text;
    role : UserRole;
    registered : Time.Time;
    isActive : Bool;
  };

  public type UserProfile = {
    username : Text;
    businessId : Text;
    role : UserRole;
    registered : Time.Time;
    isActive : Bool;
  };

  module StockFlowUser {
    public func compareByUsername(user1 : StockFlowUser, user2 : StockFlowUser) : Order.Order {
      Text.compare(user1.username, user2.username);
    };
  };

  type ColumnDef = {
    name : Text;
    colType : Text;
  };

  type CustomColumns = {
    transit : [ColumnDef];
    warehouse : [ColumnDef];
    inward : [ColumnDef];
  };

  type Settings = {
    godowns : [Text];
    biltyPrefixes : [Text];
    minStockThreshold : Int;
  };

  type StockDelta = {
    shopDelta : Int;
    godownDeltas : [GodownStock];
  };

  type StockTransfer = {
    from : Text;
    to : Text;
    quantity : Int;
  };

  // INIT DATA
  let emptyTransitColumns : [ColumnDef] = [];
  let emptyWarehouseColumns : [ColumnDef] = [];
  let emptyInwardColumns : [ColumnDef] = [];

  let defaultGodowns : [Text] = ["Main Godown", "Side Godown"];
  let defaultBiltyPrefixes : [Text] = ["sola", "erob", "cheb", "0"];

  let defaultCategoryFields = [ #categoryField({ name = "category"; fieldType = "Text"; options = [] }) ];

  let defaultColumns : CustomColumns = {
    transit = emptyTransitColumns;
    warehouse = emptyWarehouseColumns;
    inward = emptyInwardColumns;
  };

  let defaultSettings : Settings = {
    godowns = defaultGodowns;
    biltyPrefixes = defaultBiltyPrefixes;
    minStockThreshold = 10;
  };

  // MODULE STORAGE
  let categories = Map.empty<Text, Category>();
  let businesses = Map.empty<Text, Business>();
  let inventory = Map.empty<Text, InventoryItem>();
  let transits = Map.empty<Nat, TransitRecord>();
  let pendingParcels = Map.empty<Nat, PendingParcel>();
  let transactions = Map.empty<Nat, Transaction>();
  let users = Map.empty<Principal, StockFlowUser>();

  // Single mutable module state
  var nextId = 1;
  var moduleData = (
    defaultColumns,
    defaultSettings,
  );

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module IdUtils {
    public func getNextId() : Nat {
      let id = nextId;
      nextId += 1;
      if (nextId == 0) {
        Runtime.trap("Out of range: 0 is not allowed as ID")
      };
      id;
    };
  };

  module InventoryItem {
    public func compareBySku(item1 : InventoryItem, item2 : InventoryItem) : Order.Order {
      Text.compare(item1.sku, item2.sku);
    };

    public func compareByItemName(item1 : InventoryItem, item2 : InventoryItem) : Order.Order {
      Text.compare(item1.itemName, item2.itemName);
    };

    public func compareByShopStock(item1 : InventoryItem, item2 : InventoryItem) : Order.Order {
      Int.compare(item2.shop, item1.shop);
    };

    public func compareByPurchaseRate(item1 : InventoryItem, item2 : InventoryItem) : Order.Order {
      Float.compare(item1.purchaseRate, item2.purchaseRate);
    };

    public func compareBySaleRate(item1 : InventoryItem, item2 : InventoryItem) : Order.Order {
      Float.compare(item1.saleRate, item2.saleRate);
    };
  };

  // HELPER FUNCTIONS
  func getUserBusinessId(caller : Principal) : ?Text {
    switch (users.get(caller)) {
      case (null) { null };
      case (?user) { ?user.businessId };
    };
  };

  func verifyBusinessAccess(caller : Principal, businessId : Text) : Bool {
    switch (users.get(caller)) {
      case (null) { false };
      case (?user) { user.businessId == businessId };
    };
  };

  // USER PROFILE MANAGEMENT
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (users.get(caller)) {
      case (null) { null };
      case (?user) {
        ?{
          username = user.username;
          businessId = user.businessId;
          role = user.role;
          registered = user.registered;
          isActive = user.isActive;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (users.get(user)) {
      case (null) { null };
      case (?u) {
        ?{
          username = u.username;
          businessId = u.businessId;
          role = u.role;
          registered = u.registered;
          isActive = u.isActive;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (users.get(caller)) {
      case (null) {
        Runtime.trap("User not registered");
      };
      case (?existingUser) {
        let updatedUser : StockFlowUser = {
          id = caller;
          username = profile.username;
          businessId = profile.businessId;
          role = profile.role;
          registered = existingUser.registered;
          isActive = profile.isActive;
        };
        users.add(caller, updatedUser);
      };
    };
  };

  // CATEGORY MANAGEMENT
  public shared ({ caller }) func addCategory(name : Text, fields : [CategoryField]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };

    if (categories.containsKey(name)) {
      Runtime.trap("Category already exists");
    };
    categories.add(name, { name; fields });
  };

  public shared ({ caller }) func deleteCategory(name : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: This action requires admin permissions");
    };

    categories.remove(name);
  };

  // USER REGISTRATION
  public shared ({ caller }) func register(userPrincipal : Principal, username : Text, businessId : Text, role : UserRole) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can register users");
    };

    if (users.containsKey(userPrincipal)) {
      Runtime.trap("User is already registered.");
    };

    let user : StockFlowUser = {
      id = userPrincipal;
      username;
      businessId;
      role;
      registered = Time.now();
      isActive = true;
    };

    users.add(userPrincipal, user);

    // Add new business if business does not exist
    if (not businesses.containsKey(businessId)) {
      let business : Business = {
        id = businessId;
        name = businessId;
      };
      businesses.add(businessId, business);
    };
  };

  // DYNAMIC DATA
  public query ({ caller }) func isRegistered() : async Bool {
    users.containsKey(caller);
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };
    categories.values().toArray();
  };

  // Stock Management
  public shared ({ caller }) func addStock(sku : Text, stockDelta : StockDelta) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };

    switch (inventory.get(sku)) {
      case (null) { Runtime.trap("SKU does not exist") };
      case (?item) {
        if (not verifyBusinessAccess(caller, item.businessId)) {
          Runtime.trap("Unauthorized: Cannot modify inventory from another business");
        };
        let updatedGodowns = stockDelta.godownDeltas.concat(item.godowns);
        inventory.add(
          sku,
          {
            item with
            shop = item.shop + stockDelta.shopDelta;
            godowns = updatedGodowns;
          },
        );
      };
    };
  };

  public shared ({ caller }) func transferStock(transfer : StockTransfer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };

    switch (inventory.get(transfer.from)) {
      case (null) { Runtime.trap("From SKU does not exist") };
      case (?fromItem) {
        if (not verifyBusinessAccess(caller, fromItem.businessId)) {
          Runtime.trap("Unauthorized: Cannot transfer inventory from another business");
        };
        switch (inventory.get(transfer.to)) {
          case (null) { Runtime.trap("To SKU does not exist") };
          case (?toItem) {
            if (not verifyBusinessAccess(caller, toItem.businessId)) {
              Runtime.trap("Unauthorized: Cannot transfer inventory to another business");
            };
            if (fromItem.businessId != toItem.businessId) {
              Runtime.trap("Cannot transfer stock between different businesses");
            };
            inventory.add(
              transfer.from,
              {
                fromItem with
                shop = fromItem.shop - transfer.quantity;
              },
            );
            inventory.add(
              transfer.to,
              {
                toItem with
                shop = toItem.shop + transfer.quantity;
              },
            );
          };
        };
      };
    };
  };

  // GET/SET MODULE STATE
  public query ({ caller }) func getCustomColumns() : async CustomColumns {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };
    moduleData.0;
  };

  public shared ({ caller }) func setCustomColumns(columns : CustomColumns) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };

    moduleData := (
      columns,
      moduleData.1,
    );
  };

  public query ({ caller }) func getSettings() : async Settings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };
    moduleData.1;
  };

  public shared ({ caller }) func setSettings(settings : Settings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };

    moduleData := (
      moduleData.0,
      settings,
    );
  };

  // Sorting - with business filtering
  public query ({ caller }) func getInventorySortedBySku() : async [InventoryItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };
    switch (getUserBusinessId(caller)) {
      case (null) { [] };
      case (?businessId) {
        inventory.values().toArray()
          .filter(func(item : InventoryItem) : Bool { item.businessId == businessId })
          .sort(InventoryItem.compareBySku);
      };
    };
  };

  public query ({ caller }) func getInventorySortedByShopStock() : async [InventoryItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };
    switch (getUserBusinessId(caller)) {
      case (null) { [] };
      case (?businessId) {
        inventory.values().toArray()
          .filter(func(item : InventoryItem) : Bool { item.businessId == businessId })
          .sort(InventoryItem.compareByShopStock);
      };
    };
  };

  public query ({ caller }) func getInventorySortedByPurchaseRate() : async [InventoryItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };
    switch (getUserBusinessId(caller)) {
      case (null) { [] };
      case (?businessId) {
        inventory.values().toArray()
          .filter(func(item : InventoryItem) : Bool { item.businessId == businessId })
          .sort(InventoryItem.compareByPurchaseRate);
      };
    };
  };

  public query ({ caller }) func getInventorySortedBySaleRate() : async [InventoryItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };
    switch (getUserBusinessId(caller)) {
      case (null) { [] };
      case (?businessId) {
        inventory.values().toArray()
          .filter(func(item : InventoryItem) : Bool { item.businessId == businessId })
          .sort(InventoryItem.compareBySaleRate);
      };
    };
  };

  public query ({ caller }) func getPendingParcels() : async [PendingParcel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: This action requires user permissions");
    };
    switch (getUserBusinessId(caller)) {
      case (null) { [] };
      case (?businessId) {
        pendingParcels.values().toArray()
          .filter(func(parcel : PendingParcel) : Bool { parcel.businessId == businessId });
      };
    };
  };
};
