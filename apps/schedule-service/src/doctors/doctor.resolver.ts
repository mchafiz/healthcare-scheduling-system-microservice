import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DoctorService } from "./doctor.service";
import { Doctor } from "./dto/doctor.type";
import { CreateDoctorInput } from "./dto/create-doctor.input";
import { UpdateDoctorInput } from "./dto/update-doctor.input";
import { AuthGuard } from "apps/schedule-service/src/auth/auth.guard";
import { UseGuards } from "@nestjs/common";
import { PaginationInput } from "../common/dto/pagination.input";
import { PaginatedDoctors } from "../common/dto/paginated-doctors.type";

@Resolver(() => Doctor)
@UseGuards(AuthGuard)
export class DoctorResolver {
  constructor(private readonly doctorService: DoctorService) {}

  @Query(() => PaginatedDoctors)
  async doctors(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedDoctors> {
    return this.doctorService.findAll(pagination?.skip, pagination?.take);
  }

  @Query(() => Doctor)
  async doctor(@Args('id', { type: () => ID }) id: string): Promise<Doctor> {
    return this.doctorService.findOne(id);
  }

  @Mutation(() => Doctor)
  async createDoctor(@Args("input") input: CreateDoctorInput): Promise<Doctor> {
    return this.doctorService.create(input);
  }

  @Mutation(() => Doctor)
  async updateDoctor(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateDoctorInput,
  ): Promise<Doctor> {
    return this.doctorService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteDoctor(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.doctorService.delete(id);
  }
}
