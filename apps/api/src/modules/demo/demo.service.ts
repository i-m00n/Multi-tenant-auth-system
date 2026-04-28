import { Injectable, Logger } from '@nestjs/common';
import { TenantService } from '../tenant/tenant.service';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { TenantRepository } from '../tenant/tenant.repository';

const DEMO_TENANTS = [
  {
    name: 'Acme Corp',
    slug: 'acme',
    adminEmail: 'admin@acme.com',
    adminPassword: 'Demo1234!',
    viewers: [
      { email: 'viewer@acme.com', password: 'Demo1234!' },
      { email: 'alice@acme.com', password: 'Demo1234!' },
      { email: 'bob@acme.com', password: 'Demo1234!' },
    ],
  },
  {
    name: 'Beta Inc',
    slug: 'beta',
    adminEmail: 'admin@beta.com',
    adminPassword: 'Demo1234!',
    viewers: [
      { email: 'viewer@beta.com', password: 'Demo1234!' },
      { email: 'charlie@beta.com', password: 'Demo1234!' },
    ],
  },
];

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);

  constructor(
    private tenantService: TenantService,
    private userService: UserService,
    private authService: AuthService,
    private tenantRepository: TenantRepository,
  ) {}

  async seed() {
    const results: Array<{
      tenant: string;
      admin: string;
      password: string;
      viewers: string[];
      url: string;
    }> = [];

    for (const demo of DEMO_TENANTS) {
      try {
        // idempotent — skip if tenant already exists
        const existing = await this.tenantRepository.findBySlug(demo.slug);

        if (!existing) {
          // create tenant + admin atomically
          await this.tenantService.create({
            name: demo.name,
            slug: demo.slug,
            adminEmail: demo.adminEmail,
            adminPassword: demo.adminPassword,
          });

          // seed viewer users
          // UserService.register needs tenant context — set it manually
          for (const viewer of demo.viewers) {
            try {
              await this.userService.registerWithSlug(viewer, demo.slug);
            } catch {
              // viewer may already exist — skip
            }
          }

          // fire bad login attempts to populate audit log
          for (let i = 0; i < 6; i++) {
            try {
              await this.authService.loginWithSlug(
                demo.adminEmail,
                'wrongpassword',
                demo.slug,
                '127.0.0.1',
                'demo-seeder',
              );
            } catch {
              // expected — just populating audit log
            }
          }
        }

        results.push({
          tenant: demo.slug,
          admin: demo.adminEmail,
          password: demo.adminPassword,
          viewers: demo.viewers.map((v) => v.email),
          url: `/${demo.slug}/login`,
        });
      } catch (err) {
        this.logger.error(`Failed to seed tenant ${demo.slug}: ${String(err)}`);
      }
    }

    return {
      message: 'Demo data seeded successfully',
      credentials: results,
    };
  }
}
