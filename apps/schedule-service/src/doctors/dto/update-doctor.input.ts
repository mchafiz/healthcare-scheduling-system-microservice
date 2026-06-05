import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class UpdateDoctorInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  specialization?: string;
}
