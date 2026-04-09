import { HttpClient } from "../http";
import type { MeResponse } from "../types/responses";

export class UsersModule {
  private http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }

  getMe(): Promise<MeResponse> {
    return this.http.get<MeResponse>("/users/me");
  }
}
