import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDoctorInput } from "./dto/create-doctor.input";
import { UpdateDoctorInput } from "./dto/update-doctor.input";

@Injectable()
export class DoctorService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.doctor.findMany();
  }

  async findOne(id: string) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: { id },
    });
    if (!doctor) throw new NotFoundException(`Doctor ${id} not found`);
    return doctor;
  }

  async create(input: CreateDoctorInput) {
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
