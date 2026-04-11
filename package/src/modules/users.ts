import { HttpClient } from "../http";
import type { MeResponse, UserResponse } from "../types/responses";

export class UsersModule {
  private http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }

  getMe(): Promise<MeResponse> {
    return this.http.get<MeResponse>("/users/me");
  }

  getAll(): Promise<UserResponse[]> {
    return this.http.get<UserResponse[]>("/users");
  }
}
