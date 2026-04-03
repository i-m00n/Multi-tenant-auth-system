import { HttpClient } from "../http";
import type { MeResponse, UserResponse } from "../types/responses";

export class UsersModule {
  constructor(private http: HttpClient) {}

  getMe(): Promise<MeResponse> {
    return this.http.get<MeResponse>("/users/me");
  }
}
