import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt } from 'src/common/utils/encryptor.utils';
import { BulkCreateEstateFeatureDto, CreateEstateFeatureDto } from './dto/create-estate-feature.dto';
import { BulkCreateEstateGalleryDto, CreateEstateGalleryDto } from './dto/create-estate-gallery.dto';
import { BulkCreateEstateStreetDto, CreateEstateStreetDto } from './dto/create-estate-street.dto';

type OneOrMany<T> = T | T[];

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


  // ---- EstateFeature ----
  async createEstateFeature(dto: CreateEstateFeatureDto) {
    return this.prisma.estateFeature.create({ data: dto });
  }

  async getAllEstateFeatures(estateId: string) {
    return this.prisma.estateFeature.findMany({
      where: { estateId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---- EstateGallery ----
  async createEstateGallery(dto: CreateEstateGalleryDto) {
    return this.prisma.estateGallery.create({ data: dto });
  }

  async getAllEstateGallery(estateId: string) {
    return this.prisma.estateGallery.findMany({
      where: { estateId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---- EstateStreet ----
  async createEstateStreet(dto: CreateEstateStreetDto) {
    return this.prisma.estateStreet.create({ data: dto });
  }

  async getAllEstateStreets(estateId: string) {
    return this.prisma.estateStreet.findMany({
      where: { estateId },
      orderBy: { createdAt: 'desc' },
    });
  }


  async bulkCreateEstateFeatures(dto: BulkCreateEstateFeatureDto) {
  return this.prisma.estateFeature.createMany({
    data: dto.items,
    skipDuplicates: true, // optional
  });
}
  async bulkCreateEstateGallery(dto:  BulkCreateEstateGalleryDto) {
    return this.prisma.estateGallery.createMany({
      data: dto.items,
      skipDuplicates: true, // optional
    });
  }

  async bulkCreateEstateStreets(dto: BulkCreateEstateStreetDto) {
    return this.prisma.estateStreet.createMany({
      data: dto.items,
      skipDuplicates: true, // optional
    });
  }
}
