import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CacheService } from "../cache/cache.service";
import { CreateDoctorInput } from "./dto/create-doctor.input";
import { UpdateDoctorInput } from "./dto/update-doctor.input";
import type { Doctor } from "@prisma/schedule-client";

const TTL = 60;

@Injectable()
export class DoctorService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(skip = 0, take = 10) {
    const key = `doctors:all:${skip}:${take}`;
    const cached = await this.cache.get<{ data: Doctor[]; total: number }>(key);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.prismaService.doctor.findMany({ skip, take }),
      this.prismaService.doctor.count(),
    ]);
    const result = { data, total };
    await this.cache.set(key, result, TTL);
    return result;
  }

  async findOne(id: string) {
    const key = `doctors:${id}`;
    const cached = await this.cache.get<Doctor>(key);
    if (cached) return cached;

    const doctor = await this.prismaService.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException(`Doctor ${id} not found`);

    await this.cache.set(key, doctor, TTL);
    return doctor;
  }

  async create(input: CreateDoctorInput) {
    const existing = await this.prismaService.doctor.findFirst({
      where: { name: input.name, specialization: input.specialization },
    });
    if (existing) {
      throw new ConflictException(
        `Doctor with name ${input.name} and specialization ${input.specialization} already exists`,
      );
    }
    const doctor = await this.prismaService.doctor.create({ data: input });
    await this.cache.delByPattern("doctors:*");
    return doctor;
  }

  async update(id: string, input: UpdateDoctorInput) {
    await this.findOne(id);
    const doctor = await this.prismaService.doctor.update({
      where: { id },
      data: input,
    });
    await this.cache.delByPattern("doctors:*");
    return doctor;
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prismaService.doctor.delete({ where: { id } });
    await this.cache.delByPattern("doctors:*");
    return true;
  }
}
