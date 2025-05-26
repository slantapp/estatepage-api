import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt } from 'src/common/utils/encryptor.utils';

@Injectable()
export class EstateService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createEstateDto: CreateEstateDto) {
    try {
      const { name, address, supportEmail, supportPhone, admin } = createEstateDto;

      // 1. Check if admin email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: admin.email },
      });

      if (existingUser) {
        throw new ConflictException('Admin email already in use');
      }

      // 2. Hash password
      const hashedPassword = await encrypt.encryptpass(admin.password);

      // 3. Create Estate and Admin user in a transaction
      const estateWithAdmin = await this.prisma.$transaction(async (tx) => {
        const estate = await tx.estate.create({
          data: {
            name,
            address,
            supportEmail,
            supportPhone,
          },
        });

        const userAdmin = await tx.user.create({
          data: {
            email: admin.email,
            password: hashedPassword,
            role: 'ADMIN',
            estateId: estate.id,
          },
          select: {
            id: true,
            email: true,
            role: true,
            estateId: true,
          },
        });

        return { estate, admin: userAdmin };
      });

      return estateWithAdmin;
    } catch (error) {
      // Handle any errors that occur during the transaction
      if (error instanceof ConflictException) {
        throw error; // Re-throw the conflict exception
      }
      throw new ConflictException('Failed to create estate and admin user');

    }
  }

  findAll() {
    return `This action returns all estate`;
  }

  getEstateProfile(id: string) {
    // Fetch the estate profile by ID
    return this.prisma.estate.findUnique({
      where: { id },

    });
  }

  update(id: number, updateEstateDto: UpdateEstateDto) {
    return `This action updates a #${id} estate`;
  }

  remove(id: number) {
    return `This action removes a #${id} estate`;
  }
}
