// rbac/rbac.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { TenantContext } from '../tenant/tenant-context.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { Permission, PERMISSIONS } from './permissions.constants';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  CreateRoleSchema,
  AssignPermissionSchema,
  AssignRoleSchema,
} from './rbac.schemas';

@Controller(':tenant/api/roles')
export class RbacController {
  constructor(
    private rbacService: RbacService,
    private tenantContext: TenantContext,
  ) {}

  // list all roles - any authenticated user can see roles
  @Get()
  @RequirePermissions(PERMISSIONS.ROLE_READ)
  getRoles() {
    const tenantId = this.tenantContext.requireTenantId();
    return this.rbacService.getRolesForTenant(tenantId);
  }

  // create custom role - admin only
  @Post()
  @RequirePermissions(PERMISSIONS.ROLE_ASSIGN)
  createRole(
    @Body(new ZodValidationPipe(CreateRoleSchema)) body: { name: string },
  ) {
    const tenantId = this.tenantContext.requireTenantId();
    return this.rbacService.createRole(body.name, tenantId);
  }

  // assign permission to a role - admin only
  @Post(':roleId/permissions')
  @RequirePermissions(PERMISSIONS.ROLE_ASSIGN)
  assignPermission(
    @Param('roleId') roleId: string,
    @Body(new ZodValidationPipe(AssignPermissionSchema))
    body: { permission: string },
  ) {
    const tenantId = this.tenantContext.requireTenantId();
    return this.rbacService.assignPermissionToRole(
      roleId,
      body.permission as Permission,
      tenantId,
    );
  }
}

// separate controller for user-role assignments
@Controller(':tenant/api/users')
export class UserRoleController {
  constructor(
    private rbacService: RbacService,
    private tenantContext: TenantContext,
  ) {}

  // get current user profile + their permissions
  @Get('me')
  async getMe(
    @CurrentUser() user: { id: string; email: string; tenantId: string },
  ) {
    const permissions = await this.rbacService.getUserPermissions(user.id);
    return { ...user, permissions };
  }

  // assign role to user - admin only
  @Post(':userId/roles')
  @RequirePermissions(PERMISSIONS.ROLE_ASSIGN)
  assignRole(
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(AssignRoleSchema)) body: { roleId: string },
  ) {
    const tenantId = this.tenantContext.requireTenantId();
    return this.rbacService.assignRoleToUserSafe(userId, body.roleId, tenantId);
  }
}
