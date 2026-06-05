import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateScheduleInput } from "./dto/create-schedule.input";

@Injectable()
export class ScheduleService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.schedule.findMany({
      include: {
        doctor: true,
        customer: true,
      },
    });
  }

  async findOne(id: string) {
    const schedule = await this.prismaService.schedule.findUnique({
      where: { id },
      include: {
        doctor: true,
        customer: true,
      },
    });

    if (!schedule) throw new NotFoundException(`Schedule ${id} not found`);
    return schedule;
  }

  async create(input: CreateScheduleInput) {
    const customer = await this.prismaService.customer.findUnique({
      where: { id: input.customerId },
    });
    if (!customer)
      throw new NotFoundException(`Customer ${input.customerId} not found`);

    const doctor = await this.prismaService.doctor.findUnique({
      where: { id: input.doctorId },
    });
    if (!doctor)
      throw new NotFoundException(`Doctor ${input.doctorId} not found`);

    if (input.endTime <= input.startTime) {
      throw new BadRequestException("endTime must be after startTime");
    }

    const conflict = await this.prismaService.schedule.findFirst({
      where: {
        doctorId: input.doctorId,
        AND: [
          { startTime: { lt: input.endTime } },
          { endTime: { gt: input.startTime } },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException(
        `Doctor already has a schedule from ${conflict.startTime} to ${conflict.endTime}`,
      );
    }

    return this.prismaService.schedule.create({
      data: {
        customerId: input.customerId,
        doctorId: input.doctorId,
        startTime: input.startTime,
        endTime: input.endTime,
      },
      include: { customer: true, doctor: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prismaService.schedule.delete({ where: { id } });
    return true;
  }
}
