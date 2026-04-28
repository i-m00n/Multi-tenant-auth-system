import { HttpClient } from "../http";
import type { MeResponse, UserResponse } from "../types/responses";
import { RegisterUserDto } from "../types/schemas";

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

  create(dto: RegisterUserDto): Promise<UserResponse> {
    return this.http.post<UserResponse>("/users", dto);
  }

  delete(userId: string): Promise<void> {
    return this.http.delete<void>(`/users/${userId}`);
  }
}
