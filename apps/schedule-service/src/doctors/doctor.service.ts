import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDoctorInput } from "./dto/create-doctor.input";
import { UpdateDoctorInput } from "./dto/update-doctor.input";

@Injectable()
export class DoctorService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(skip = 0, take = 10) {
    const [data, total] = await Promise.all([
      this.prismaService.doctor.findMany({ skip, take }),
      this.prismaService.doctor.count(),
    ]);
    return { data, total };
  }

  async findOne(id: string) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id },
    });
    if (!doctor) throw new NotFoundException(`Doctor ${id} not found`);
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
    return this.prismaService.doctor.create({
      data: input,
    });
  }

  async update(id: string, input: UpdateDoctorInput) {
    await this.findOne(id);
    return this.prismaService.doctor.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prismaService.doctor.delete({ where: { id } });
    return true;
  }
}
