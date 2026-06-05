import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateDoctorInput {
  @Field()
  name: string;

  @Field()
  specialization: string;
}
