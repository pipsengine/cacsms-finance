# Cacsms Finance Google Sheets Schema

The application automatically creates the platform tabs when Google Sheets credentials are configured. Keep the spreadsheet private and share it only with the service account.

## Transactions
`id | userId | date | type | amount | category | account | paymentMethod | description | reference | createdAt | updatedAt | reserved`

## Users
`id | name | email | phone | passwordHash | passwordSalt | role | profileType | currency | country | status | emailVerified | createdAt | updatedAt | username`

## Sessions
`id | userId | tokenHash | expiresAt | createdAt`

## Plans
`id | code | name | monthlyPrice | yearlyPrice | trialDays | active | description | aiQuota | transactionLimit | accountLimit | features`

## Subscriptions
`id | userId | planCode | billingCycle | status | startsAt | renewsAt | trialEndsAt | cancelledAt | source | amount`

## Payments
`id | userId | subscriptionId | amount | currency | method | reference | status | paidAt | createdAt`

## AuditLog
`id | actorUserId | action | entity | entityId | details | createdAt`

Passwords are never written in plaintext. Session cookies are never written to Sheets; only one-way SHA-256 token hashes are stored.
