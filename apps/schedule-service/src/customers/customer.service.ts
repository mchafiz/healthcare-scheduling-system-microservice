import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CacheService } from "../cache/cache.service";
import { CreateCustomerInput } from "./dto/create-customer.input";
import { UpdateCustomerInput } from "./dto/update-customer.input";
import type { Customer } from "@prisma/schedule-client";

const TTL = 60;

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(skip = 0, take = 10) {
    const key = `customers:all:${skip}:${take}`;
    const cached = await this.cache.get<{ data: Customer[]; total: number }>(key);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({ skip, take }),
      this.prisma.customer.count(),
    ]);
    const result = { data, total };
    await this.cache.set(key, result, TTL);
    return result;
  }

  async findOne(id: string) {
    const key = `customers:${id}`;
    const cached = await this.cache.get<Customer>(key);
    if (cached) return cached;

    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);

    await this.cache.set(key, customer, TTL);
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
    const customer = await this.prisma.customer.create({ data: input });
    await this.cache.delByPattern("customers:*");
    return customer;
  }

  async update(id: string, input: UpdateCustomerInput) {
    await this.findOne(id);
    const customer = await this.prisma.customer.update({
      where: { id },
      data: input,
    });
    await this.cache.delByPattern("customers:*");
    return customer;
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.customer.delete({ where: { id } });
    await this.cache.delByPattern("customers:*");
    return true;
  }
}
