import { Expose } from 'class-transformer';

export class CreateUserDto {
  @Expose()
  userID: string;


  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  verified_user: boolean;

  @Expose()
  activeStatus: boolean;

  
  @Expose()
  access_token?: string;

  @Expose()
  message?: string;

  @Expose()
  userInterests?: string[];

  @Expose()
  profileImage?: string;

  @Expose()
  phoneNo?: string;


  @Expose()
  location?: any; // Adjust this type based on your Prisma schema, e.g., { lat: number, lng: number }
}