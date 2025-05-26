import { ClsStore } from 'nestjs-cls';

export interface ContextStore extends ClsStore {
  userID: string;
  email: string;
  role?: string;
  estateId?: string;
}
