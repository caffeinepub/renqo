import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Principal "mo:core/Principal";

module {
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

  type UserProfile = {
    name : Text;
  };

  type DashboardStats = {
    totalTenants : Nat;
    overdueRents : Nat;
    overdueBills : Nat;
    totalExpectedRentThisMonth : Nat;
  };

  type PropertyListing = {
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

  type OldActor = {
    nextTenantId : Nat;
    nextBillId : Nat;
    tenants : Map.Map<Nat, Tenant>;
    securityDeposits : Map.Map<Nat, SecurityDeposit>;
    rentalAgreements : Map.Map<Nat, RentalAgreement>;
    rentPayments : Map.Map<Nat, List.List<RentPayment>>;
    bills : Map.Map<Nat, Bill>;
    reminders : Map.Map<Nat, List.List<Reminder>>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    nextTenantId : Nat;
    nextBillId : Nat;
    tenants : Map.Map<Nat, Tenant>;
    securityDeposits : Map.Map<Nat, SecurityDeposit>;
    rentalAgreements : Map.Map<Nat, RentalAgreement>;
    rentPayments : Map.Map<Nat, List.List<RentPayment>>;
    bills : Map.Map<Nat, Bill>;
    reminders : Map.Map<Nat, List.List<Reminder>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextPropertyListingId : Nat;
    propertyListings : Map.Map<Nat, PropertyListing>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      nextPropertyListingId = 1;
      propertyListings = Map.empty<Nat, PropertyListing>();
    };
  };
};
