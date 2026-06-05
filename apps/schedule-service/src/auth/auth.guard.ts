import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { GqlExecutionContext } from "@nestjs/graphql";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    const authHeader = request.headers["authorization"];
    if (!authHeader) {
      throw new UnauthorizedException("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    const result = await firstValueFrom(
      this.authClient.send({ cmd: "validate_token" }, { token }),
    );

    if (!result?.valid) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    request.userId = result.userId;
    return true;
  }
}
