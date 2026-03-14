# Renqo - Enhanced Tenant Add Form

## Current State
The AddTenant form has: name, phone, email, unit number, move-in/leaving dates, broker name/contact, notes, rent amount, rent due day, security deposit, and rental agreement dates.

The Tenant backend model has: id, name, phone, email, unitNumber, moveInDate, leavingDate, brokerContact, brokerName, notes.

## Requested Changes (Diff)

### Add
- `permanentAddress` field to Tenant backend model and all CRUD operations
- Document upload section in AddTenant form: upload agreement document + other tenant documents (using blob-storage)
- Electricity bill amount field in AddTenant form (creates an electricity bill record for the tenant on save)
- Display permanent address in TenantDetail page

### Modify
- `createTenant` and `updateTenant` backend APIs to accept `permanentAddress` parameter
- AddTenant form: add Permanent Address textarea, document upload section, and electricity bill amount field
- TenantDetail: show permanent address and uploaded documents

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate Motoko backend to add `permanentAddress` to Tenant model and CRUD APIs
2. Select blob-storage component for document uploads
3. Update AddTenant.tsx: add permanent address field, document upload section (agreement + other docs), electricity bill amount field
4. Update TenantDetail.tsx to show permanent address and tenant documents
5. Update updateTenant calls to pass permanentAddress
