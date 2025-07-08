export enum Verifications {
  VERIFIED = 'VERIFIED',
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
}

export enum UserRoles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum TRANSACTIONSTATUS {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PAYMENTMETHODS {
  WALLET = 'WALLET',
  OTHER = 'OTHER',
}


export enum ServiceStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  EXPIRED = 'Expired',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quaterly',
  BI_ANNUALLY = 'bi-annually',
  ANNUALLY = 'annually',
  ONE_TIME = 'one-time',
}