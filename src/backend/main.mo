import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import Migration "migration";

// Data migration on upgrades
(with migration = Migration.run)
actor {
  include MixinStorage();

  module Tenant {
    public func compare(t1 : Tenant, t2 : Tenant) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };
  };

  module Bill {
    public func compare(b1 : Bill, b2 : Bill) : Order.Order {
      switch (Nat.compare(b1.tenantId, b2.tenantId)) {
        case (#equal) { Nat.compare(b1.id, b2.id) };
        case (order) { order };
      };
    };
  };

  module SortByTenantId {
    public func compare(bill1 : Bill, bill2 : Bill) : Order.Order {
      Nat.compare(bill1.tenantId, bill2.tenantId);
    };
  };

  module SortByBillType {
    public func compare(bill1 : Bill, bill2 : Bill) : Order.Order {
      Text.compare(bill1.billType, bill2.billType);
    };
  };

  module SortByBillId {
    public func compare(bill1 : Bill, bill2 : Bill) : Order.Order {
      Nat.compare(bill1.id, bill2.id);
    };
  };

  type Tenant = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    unitNumber : Text;
    moveInDate : Text;
    leavingDate : Text;
    brokerName : Text;
    brokerContact : Text;
    notes : Text;
  };

  type SecurityDeposit = {
    tenantId : Nat;
    amount : Nat;
    paidStatus : Bool;
    dateReceived : Text;
  };

  type RentalAgreement = {
    tenantId : Nat;
    startDate : Text;
    endDate : Text;
  };

  type RentPayment = {
    tenantId : Nat;
    month : Nat;
    year : Nat;
    amountPaid : Nat;
    paidStatus : Bool;
    paymentDate : Text;
    notes : Text;
    rentAmount : Nat;
    dueDay : Nat;
  };

  type Bill = {
    id : Nat;
    tenantId : Nat;
    billType : Text;
    billingPeriod : Text;
    amountDue : Nat;
    paidStatus : Bool;
    dueDate : Text;
    paymentDate : Text;
    notes : Text;
  };

  type Reminder = {
    tenantId : Nat;
    billType : Text;
    message : Text;
    createdDate : Text;
    status : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  type DashboardStats = {
    totalTenants : Nat;
    overdueRents : Nat;
    overdueBills : Nat;
    totalExpectedRentThisMonth : Nat;
  };

  public type PropertyListing = {
    id : Nat;
    ownerId : Principal;
    title : Text;
    address : Text;
    description : Text;
    bedrooms : Nat;
    bathrooms : Nat;
    rentPrice : Nat;
    amenities : [Text];
    isAvailable : Bool;
    photoUrls : [Text];
    createdAt : Text;
  };

  var nextTenantId : Nat = 1;
  var nextBillId : Nat = 1;
  var nextPropertyListingId : Nat = 1;

  let tenants = Map.empty<Nat, Tenant>();
  let securityDeposits = Map.empty<Nat, SecurityDeposit>();
  let rentalAgreements = Map.empty<Nat, RentalAgreement>();
  let rentPayments = Map.empty<Nat, List.List<RentPayment>>();
  let bills = Map.empty<Nat, Bill>();
  let reminders = Map.empty<Nat, List.List<Reminder>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Property listings
  let propertyListings = Map.empty<Nat, PropertyListing>();

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  //----------------------
  // User Profile Management
  //----------------------
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  //----------------------
  // Tenant Management
  //----------------------
  public shared ({ caller }) func createTenant(
    name : Text,
    phone : Text,
    email : Text,
    unitNumber : Text,
    moveInDate : Text,
    leavingDate : Text,
    brokerName : Text,
    brokerContact : Text,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tenants");
    };

    let id = nextTenantId;
    let tenant : Tenant = {
      id;
      name;
      phone;
      email;
      unitNumber;
      moveInDate;
      leavingDate;
      brokerName;
      brokerContact;
      notes;
    };

    tenants.add(id, tenant);
    nextTenantId += 1;
    id;
  };

  public shared ({ caller }) func updateTenant(
    id : Nat,
    name : Text,
    phone : Text,
    email : Text,
    unitNumber : Text,
    moveInDate : Text,
    leavingDate : Text,
    brokerName : Text,
    brokerContact : Text,
    notes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only admin or user can update tenant");
    };

    let tenant : Tenant = {
      id;
      name;
      phone;
      email;
      unitNumber;
      moveInDate;
      leavingDate;
      brokerName;
      brokerContact;
      notes;
    };

    tenants.add(id, tenant);
  };

  public shared ({ caller }) func deleteTenant(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete tenants");
    };
    tenants.remove(id);
    securityDeposits.remove(id);
    rentalAgreements.remove(id);
    rentPayments.remove(id);
  };

  public query ({ caller }) func getTenant(id : Nat) : async Tenant {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view tenants");
    };
    switch (tenants.get(id)) {
      case (null) { Runtime.trap("Tenant not found") };
      case (?tenant) { tenant };
    };
  };

  public query ({ caller }) func getAllTenants() : async [Tenant] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view tenants");
    };
    tenants.values().toArray();
  };

  //----------------------
  // Security Deposit
  //----------------------
  public shared ({ caller }) func addSecurityDeposit(
    tenantId : Nat,
    amount : Nat,
    paidStatus : Bool,
    dateReceived : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add security deposit");
    };

    let deposit : SecurityDeposit = {
      tenantId;
      amount;
      paidStatus;
      dateReceived;
    };
    securityDeposits.add(tenantId, deposit);
  };

  public query ({ caller }) func getSecurityDeposit(tenantId : Nat) : async ?SecurityDeposit {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view security deposits");
    };
    securityDeposits.get(tenantId);
  };

  //----------------------
  // Rental Agreement
  //----------------------
  public shared ({ caller }) func addRentalAgreement(
    tenantId : Nat,
    startDate : Text,
    endDate : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add rental agreement");
    };

    let agreement : RentalAgreement = {
      tenantId;
      startDate;
      endDate;
    };
    rentalAgreements.add(tenantId, agreement);
  };

  public query ({ caller }) func getRentalAgreement(tenantId : Nat) : async ?RentalAgreement {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view rental agreements");
    };
    rentalAgreements.get(tenantId);
  };

  //----------------------
  // Rent Payments
  //----------------------
  public shared ({ caller }) func addRentPayment(
    tenantId : Nat,
    month : Nat,
    year : Nat,
    amount : Nat,
    rentAmount : Nat,
    dueDay : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add rent payments");
    };

    let payment : RentPayment = {
      tenantId;
      month;
      year;
      amountPaid = amount;
      paidStatus = false;
      paymentDate = "";
      notes = "";
      rentAmount;
      dueDay;
    };

    switch (rentPayments.get(tenantId)) {
      case (null) {
        let payments = List.empty<RentPayment>();
        payments.add(payment);
        rentPayments.add(tenantId, payments);
      };
      case (?payments) {
        payments.add(payment);
      };
    };
  };

  public shared ({ caller }) func updateRentPaymentStatus(
    tenantId : Nat,
    month : Nat,
    year : Nat,
    paidStatus : Bool,
    paymentDate : Text,
    notes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only admin or user can update rent payment");
    };

    switch (rentPayments.get(tenantId)) {
      case (null) { Runtime.trap("No payments found for tenant") };
      case (?payments) {
        let updatedPayments = payments.map<RentPayment, RentPayment>(
          func(payment) {
            if (payment.month == month and payment.year == year) {
              {
                tenantId = payment.tenantId;
                month = payment.month;
                year = payment.year;
                amountPaid = payment.amountPaid;
                paidStatus;
                paymentDate;
                notes;
                rentAmount = payment.rentAmount;
                dueDay = payment.dueDay;
              };
            } else {
              payment;
            };
          }
        );
        rentPayments.add(tenantId, updatedPayments);
      };
    };
  };

  public query ({ caller }) func getRentPayments(tenantId : Nat) : async [RentPayment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view rent payments");
    };
    switch (rentPayments.get(tenantId)) {
      case (null) { [] };
      case (?payments) { payments.values().toArray() };
    };
  };

  //----------------------
  // Bill Payments
  //----------------------
  public shared ({ caller }) func addBill(
    tenantId : Nat,
    billType : Text,
    billingPeriod : Text,
    amountDue : Nat,
    dueDate : Text,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add bills");
    };

    let bill : Bill = {
      id = nextBillId;
      tenantId;
      billType;
      billingPeriod;
      amountDue;
      paidStatus = false;
      dueDate;
      paymentDate = "";
      notes;
    };
    bills.add(nextBillId, bill);

    nextBillId += 1;
    bill.id;
  };

  public shared ({ caller }) func updateBillStatus(
    id : Nat,
    paidStatus : Bool,
    paymentDate : Text,
    notes : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only admin or user can update bill");
    };

    switch (bills.get(id)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?bill) {
        let updatedBill : Bill = {
          id = bill.id;
          tenantId = bill.tenantId;
          billType = bill.billType;
          billingPeriod = bill.billingPeriod;
          amountDue = bill.amountDue;
          paidStatus;
          dueDate = bill.dueDate;
          paymentDate;
          notes;
        };
        bills.add(id, updatedBill);
      };
    };
  };

  public query ({ caller }) func getBill(id : Nat) : async ?Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bills");
    };
    bills.get(id);
  };

  public query ({ caller }) func getAllBills() : async [Bill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bills");
    };
    bills.values().toArray();
  };

  public query ({ caller }) func getBillsByTenant(tenantId : Nat) : async [Bill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bills");
    };
    let allBills = bills.values().toArray();
    allBills.filter<Bill>(func(bill) { bill.tenantId == tenantId });
  };

  //----------------------
  // Reminders
  //----------------------
  public shared ({ caller }) func addReminder(
    tenantId : Nat,
    billType : Text,
    message : Text,
    createdDate : Text,
    status : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add reminders");
    };

    let reminder : Reminder = {
      tenantId;
      billType;
      message;
      createdDate;
      status;
    };

    switch (reminders.get(tenantId)) {
      case (null) {
        let reminderList = List.empty<Reminder>();
        reminderList.add(reminder);
        reminders.add(tenantId, reminderList);
      };
      case (?reminderList) {
        reminderList.add(reminder);
      };
    };
  };

  public query ({ caller }) func getReminders(tenantId : Nat) : async [Reminder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view reminders");
    };
    switch (reminders.get(tenantId)) {
      case (null) { [] };
      case (?reminderList) { reminderList.values().toArray() };
    };
  };

  //----------------------
  // Dashboard Stats
  //----------------------
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view dashboard stats");
    };

    let totalTenants = tenants.size();

    var overdueRents : Nat = 0;
    var totalExpectedRentThisMonth : Nat = 0;

    for ((tenantId, paymentList) in rentPayments.entries()) {
      for (payment in paymentList.values()) {
        if (not payment.paidStatus) {
          overdueRents += 1;
        };
        totalExpectedRentThisMonth += payment.rentAmount;
      };
    };

    var overdueBills : Nat = 0;
    for ((billId, bill) in bills.entries()) {
      if (not bill.paidStatus) {
        overdueBills += 1;
      };
    };

    {
      totalTenants;
      overdueRents;
      overdueBills;
      totalExpectedRentThisMonth;
    };
  };

  //----------------------
  // Property Listings
  //----------------------
  public shared ({ caller }) func createPropertyListing(
    title : Text,
    address : Text,
    description : Text,
    bedrooms : Nat,
    bathrooms : Nat,
    rentPrice : Nat,
    amenities : [Text],
    photoUrls : [Text],
    createdAt : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create property listings");
    };

    let id = nextPropertyListingId;
    let listing : PropertyListing = {
      id;
      ownerId = caller;
      title;
      address;
      description;
      bedrooms;
      bathrooms;
      rentPrice;
      amenities;
      isAvailable = true;
      photoUrls;
      createdAt;
    };

    propertyListings.add(id, listing);
    nextPropertyListingId += 1;
    id;
  };

  public shared ({ caller }) func updatePropertyListing(
    id : Nat,
    title : Text,
    address : Text,
    description : Text,
    bedrooms : Nat,
    bathrooms : Nat,
    rentPrice : Nat,
    amenities : [Text],
    isAvailable : Bool,
    photoUrls : [Text],
  ) : async () {
    switch (propertyListings.get(id)) {
      case (null) { Runtime.trap("Property listing not found") };
      case (?existingListing) {
        // Only the owner or an admin can update the listing
        if (existingListing.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can update this property listing");
        };

        let updatedListing : PropertyListing = {
          id = existingListing.id;
          ownerId = existingListing.ownerId;
          title;
          address;
          description;
          bedrooms;
          bathrooms;
          rentPrice;
          amenities;
          isAvailable;
          photoUrls;
          createdAt = existingListing.createdAt;
        };
        propertyListings.add(id, updatedListing);
      };
    };
  };

  public shared ({ caller }) func deletePropertyListing(id : Nat) : async () {
    switch (propertyListings.get(id)) {
      case (null) { Runtime.trap("Property listing not found") };
      case (?existingListing) {
        // Only the owner or an admin can delete the listing
        if (existingListing.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the owner or an admin can delete this property listing");
        };
        propertyListings.remove(id);
      };
    };
  };

  public query ({ caller }) func getPropertyListing(id : Nat) : async PropertyListing {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view property listings");
    };
    switch (propertyListings.get(id)) {
      case (null) { Runtime.trap("Property listing not found") };
      case (?listing) { listing };
    };
  };

  public query ({ caller }) func getAllPropertyListings() : async [PropertyListing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view property listings");
    };
    propertyListings.values().toArray();
  };

  public query ({ caller }) func getMyPropertyListings() : async [PropertyListing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their property listings");
    };
    let allListings = propertyListings.values().toArray();
    allListings.filter<PropertyListing>(
      func(listing) {
        listing.ownerId == caller;
      }
    );
  };
};
