import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerInput } from "./dto/create-customer.input";
import { UpdateCustomerInput } from "./dto/update-customer.input";

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip = 0, take = 10) {
    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({ skip, take }),
      this.prisma.customer.count(),
    ]);
    return { data, total };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(input: CreateCustomerInput) {
    const existing = await this.prisma.customer.findFirst({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictException(
        `Customer with email ${input.email} already exists`,
      );
    }
    return this.prisma.customer.create({ data: input });
  }

  async update(id: string, input: UpdateCustomerInput) {
    await this.findOne(id); // Ensure customer exists
    return this.prisma.customer.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string) {
    await this.findOne(id); // Ensure customer exists
    await this.prisma.customer.delete({ where: { id } });
    return true;
  }
}
