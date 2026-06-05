import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DoctorService } from "./doctor.service";
import { Doctor } from "./dto/doctor.type";
import { CreateDoctorInput } from "./dto/create-doctor.input";
import { UpdateDoctorInput } from "./dto/update-doctor.input";
import { AuthGuard } from "apps/schedule-service/src/auth/auth.guard";
import { UseGuards } from "@nestjs/common";

@Resolver()
@UseGuards(AuthGuard)
export class DoctorResolver {
  constructor(private readonly doctorService: DoctorService) {}

  @Query(() => [Doctor])
  async doctors(): Promise<Doctor[]> {
    return this.doctorService.findAll();
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
