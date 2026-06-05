import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { AuthResponse } from "./dto/auth-response.type";
import { RegisterInput } from "./dto/register.input";
import { LoginInput } from "./dto/login.input";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  healthCheck(): string {
    return "Auth Service is running";
  }

  @Mutation(() => AuthResponse)
  async register(@Args("input") input: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(@Args("input") input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input);
  }
}
