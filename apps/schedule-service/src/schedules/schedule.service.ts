import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CreateScheduleInput } from "./dto/create-schedule.input";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(skip = 0, take = 10, filter?: { doctorId?: string; customerId?: string; scheduledAt?: Date }) {
    const where: any = {};
    if (filter?.doctorId) where.doctorId = filter.doctorId;
    if (filter?.customerId) where.customerId = filter.customerId;
    if (filter?.scheduledAt) where.scheduledAt = filter.scheduledAt;

    const [data, total] = await Promise.all([
      this.prismaService.schedule.findMany({
        where,
        skip,
        take,
        include: { doctor: true, customer: true },
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prismaService.schedule.count({ where }),
    ]);
    return { data, total };
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

    const conflict = await this.prismaService.schedule.findFirst({
      where: {
        doctorId: input.doctorId,
        scheduledAt: input.scheduledAt,
      },
    });

    if (conflict) {
      throw new BadRequestException(
        `Doctor already has a schedule at ${conflict.scheduledAt}`,
      );
    }

    const schedule = await this.prismaService.schedule.create({
      data: {
        objective: input.objective,
        customerId: input.customerId,
        doctorId: input.doctorId,
        scheduledAt: input.scheduledAt,
      },
      include: { customer: true, doctor: true },
    });

    await this.notificationService.notifyScheduleCreated({
      customerEmail: schedule.customer.email,
      customerName: schedule.customer.name,
      doctorName: schedule.doctor.name,
      objective: schedule.objective,
      scheduledAt: schedule.scheduledAt,
    });

    return schedule;
  }

  async delete(id: string) {
    const schedule = await this.findOne(id);

    await this.notificationService.notifyScheduleDeleted({
      customerEmail: schedule.customer.email,
      customerName: schedule.customer.name,
      doctorName: schedule.doctor.name,
      scheduledAt: schedule.scheduledAt,
    });

    await this.prismaService.schedule.delete({ where: { id } });
    return true;
  }
}
