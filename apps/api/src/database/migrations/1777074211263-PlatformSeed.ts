import { MigrationInterface, QueryRunner } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000000';

const ALL_PERMISSIONS = [
  { name: 'user:read', resource: 'user', action: 'read' },
  { name: 'user:create', resource: 'user', action: 'create' },
  { name: 'user:delete', resource: 'user', action: 'delete' },
  { name: 'role:read', resource: 'role', action: 'read' },
  { name: 'role:assign', resource: 'role', action: 'assign' },
  { name: 'tenant:read', resource: 'tenant', action: 'read' },
  { name: 'tenant:create', resource: 'tenant', action: 'create' },
  { name: 'tenant:update', resource: 'tenant', action: 'update' },
  { name: 'audit:read', resource: 'audit', action: 'read' },
];

export class PlatformSeed1777074211263 implements MigrationInterface {
  name = 'PlatformSeed1777074211263';

  async up(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.PLATFORM_ADMIN_EMAIL ?? 'admin@platform.local';
    const password = process.env.PLATFORM_ADMIN_PASSWORD ?? 'PlatformPass123!';

    // bypass RLS during seeding — migrations run as superuser
    await queryRunner.query(
      `SET app.current_tenant_id = '${PLATFORM_TENANT_ID}'`,
    );

    // platform tenant
    await queryRunner.query(
      `
      INSERT INTO tenants (id, name, slug, "isActive")
      VALUES ($1, 'Platform', 'platform', true)
      ON CONFLICT DO NOTHING
    `,
      [PLATFORM_TENANT_ID],
    );

    // permissions
    for (const perm of ALL_PERMISSIONS) {
      await queryRunner.query(
        `
        INSERT INTO permissions (name, resource, action)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO NOTHING
      `,
        [perm.name, perm.resource, perm.action],
      );
    }

    // platform admin role
    const adminRoleId = uuidv4();
    const viewerRoleId = uuidv4();

    await queryRunner.query(
      `
      INSERT INTO roles (id, name, tenant_id, is_system)
      VALUES ($1, 'admin', $2, true)
      ON CONFLICT DO NOTHING
    `,
      [adminRoleId, PLATFORM_TENANT_ID],
    );

    await queryRunner.query(
      `
      INSERT INTO roles (id, name, tenant_id, is_system)
      VALUES ($1, 'viewer', $2, true)
      ON CONFLICT DO NOTHING
    `,
      [viewerRoleId, PLATFORM_TENANT_ID],
    );

    // assign all permissions to platform admin role
    const perms = (await queryRunner.query(
      `SELECT id, action FROM permissions`,
    )) as { id: string; action: string }[];

    for (const perm of perms) {
      await queryRunner.query(
        `
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `,
        [adminRoleId, perm.id],
      );
    }

    // viewer gets read-only
    for (const perm of perms.filter((p) => p.action === 'read')) {
      await queryRunner.query(
        `
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `,
        [viewerRoleId, perm.id],
      );
    }

    // platform admin user
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: parseInt(process.env.ARGON2_MEMORY_COST ?? '65536'),
      timeCost: parseInt(process.env.ARGON2_TIME_COST ?? '3'),
      parallelism: parseInt(process.env.ARGON2_PARALLELISM ?? '4'),
    });

    const adminUserId = uuidv4();

    await queryRunner.query(
      `
      INSERT INTO users (id, email, password_hash, tenant_id, is_active)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT DO NOTHING
    `,
      [adminUserId, email, passwordHash, PLATFORM_TENANT_ID],
    );

    // get the actual admin role id (may have existed already)
    const [existingAdminRole] = (await queryRunner.query(
      `
      SELECT id FROM roles
      WHERE name = 'admin' AND tenant_id = $1
    `,
      [PLATFORM_TENANT_ID],
    )) as { id: string }[];

    // get the actual user id (may have existed already)
    const [existingUser] = (await queryRunner.query(
      `
      SELECT id FROM users
      WHERE email = $1 AND tenant_id = $2
    `,
      [email, PLATFORM_TENANT_ID],
    )) as { id: string }[];

    await queryRunner.query(
      `
      INSERT INTO user_roles (user_id, role_id, tenant_id)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
    `,
      [existingUser.id, existingAdminRole.id, PLATFORM_TENANT_ID],
    );

    await queryRunner.query(`SET app.current_tenant_id = ''`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      DELETE FROM tenants WHERE id = $1
    `,
      [PLATFORM_TENANT_ID],
    );
    await queryRunner.query(`DELETE FROM permissions`);
  }
}
