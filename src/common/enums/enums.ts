export enum Verifications {
  VERIFIED = 'Verified',
  UNVERIFIED = 'Unverified',
}

export enum UserRoles {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT/GUADIAN',
}

export enum TRANSACTIONSTATUS {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum PAYMENTMETHODS {
  WALLET = 'WALLET',
  OTHER = 'OTHER',
}

export enum TRANSACTIONTYPE {
  FUNDING = 'Funding',
  DEBIT = 'Debit',
}

export enum DIRECTION {
  IN = 'IN',
  OUT = 'OUT',
}

export enum MARK {
  PRESENT = 'Present',
  ABSENCE = 'Absence',
}

export enum REASONS {
  FORMAL = 'Formal',
  TRAVEL = 'Travel',
  SICKNESS = 'Sickness',
  NOCLUE = 'No Clue',
  HOLIDAY = 'Holiday',
}

export enum ASSIGNMENTSTATUS {
  ACTIVE = 'Active',
  NOTACTIVE = 'Not-Active',
}
