import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  type OldTenant = {
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

  type OldActor = {
    nextTenantId : Nat;
    nextBillId : Nat;
    nextPropertyListingId : Nat;
    tenants : Map.Map<Nat, OldTenant>;
    securityDeposits : Map.Map<Nat, {
      tenantId : Nat;
      amount : Nat;
      paidStatus : Bool;
      dateReceived : Text;
    }>;
    rentalAgreements : Map.Map<Nat, {
      tenantId : Nat;
      startDate : Text;
      endDate : Text;
    }>;
    rentPayments : Map.Map<Nat, List.List<{
      tenantId : Nat;
      month : Nat;
      year : Nat;
      rentAmount : Nat;
      amountPaid : Nat;
      dueDay : Nat;
      paidStatus : Bool;
      paymentDate : Text;
      notes : Text;
    }>>;
    bills : Map.Map<Nat, {
      id : Nat;
      tenantId : Nat;
      billType : Text;
      billingPeriod : Text;
      amountDue : Nat;
      paidStatus : Bool;
      dueDate : Text;
      paymentDate : Text;
      notes : Text;
    }>;
    reminders : Map.Map<Nat, List.List<{
      tenantId : Nat;
      billType : Text;
      message : Text;
      createdDate : Text;
      status : Text;
    }>>;
    propertyListings : Map.Map<Nat, {
      id : Nat;
      ownerId : Principal.Principal;
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
    }>;
    userProfiles : Map.Map<Principal.Principal, { name : Text }>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewTenant = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    unitNumber : Text;
    moveInDate : Text;
    leavingDate : Text;
    brokerName : Text;
    brokerContact : Text;
    permanentAddress : Text;
    notes : Text;
  };

  type NewActor = {
    nextTenantId : Nat;
    nextBillId : Nat;
    nextPropertyListingId : Nat;
    tenants : Map.Map<Nat, NewTenant>;
    securityDeposits : Map.Map<Nat, {
      tenantId : Nat;
      amount : Nat;
      paidStatus : Bool;
      dateReceived : Text;
    }>;
    rentalAgreements : Map.Map<Nat, {
      tenantId : Nat;
      startDate : Text;
      endDate : Text;
    }>;
    rentPayments : Map.Map<Nat, List.List<{
      tenantId : Nat;
      month : Nat;
      year : Nat;
      rentAmount : Nat;
      amountPaid : Nat;
      dueDay : Nat;
      paidStatus : Bool;
      paymentDate : Text;
      notes : Text;
    }>>;
    bills : Map.Map<Nat, {
      id : Nat;
      tenantId : Nat;
      billType : Text;
      billingPeriod : Text;
      amountDue : Nat;
      paidStatus : Bool;
      dueDate : Text;
      paymentDate : Text;
      notes : Text;
    }>;
    reminders : Map.Map<Nat, List.List<{
      tenantId : Nat;
      billType : Text;
      message : Text;
      createdDate : Text;
      status : Text;
    }>>;
    propertyListings : Map.Map<Nat, {
      id : Nat;
      ownerId : Principal.Principal;
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
    }>;
    userProfiles : Map.Map<Principal.Principal, { name : Text }>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    let newTenants = old.tenants.map<Nat, OldTenant, NewTenant>(
      func(_, oldTenant) {
        { oldTenant with permanentAddress = "" };
      }
    );
    { old with tenants = newTenants };
  };
};
