import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
} from '@nestjs/common';
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
import express from 'express';

@Controller(':tenant/api/roles')
export class RbacController {
  constructor(
    private rbacService: RbacService,
    private tenantContext: TenantContext,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ROLE_READ)
  getRoles() {
    const tenantId = this.tenantContext.requireTenantId();
    return this.rbacService.getRolesForTenant(tenantId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ROLE_ASSIGN)
  createRole(
    @Body(new ZodValidationPipe(CreateRoleSchema)) body: { name: string },
    @Req() req: express.Request,
    @CurrentUser() admin: { id: string },
  ) {
    const tenantId = this.tenantContext.requireTenantId();
    return this.rbacService.createRole(
      body.name,
      tenantId,
      admin.id,
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
    );
  }

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

  @Delete(':roleId/permissions/:permission')
  @HttpCode(204)
  @RequirePermissions(PERMISSIONS.ROLE_ASSIGN)
  removePermission(
    @Param('roleId') roleId: string,
    @Param('permission') permission: string,
    @Req() req: express.Request,
    @CurrentUser() admin: { id: string },
  ) {
    const tenantId = this.tenantContext.requireTenantId();
    return this.rbacService.removePermissionFromRole(
      roleId,
      decodeURIComponent(permission),
      tenantId,
      admin.id,
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
    );
  }
}

@Controller(':tenant/api/users')
export class UserRoleController {
  constructor(
    private rbacService: RbacService,
    private tenantContext: TenantContext,
  ) {}

  @Get('me')
  async getMe(
    @CurrentUser() user: { id: string; email: string; tenantId: string },
  ) {
    const permissions = await this.rbacService.getUserPermissions(user.id);
    return { ...user, permissions };
  }

  @Post(':userId/roles')
  @RequirePermissions(PERMISSIONS.ROLE_ASSIGN)
  assignRole(
    @CurrentUser() admin: { id: string },
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(AssignRoleSchema)) body: { roleId: string },
    @Req() req: express.Request,
  ) {
    const tenantId = this.tenantContext.requireTenantId();
    return this.rbacService.assignRoleToUserSafe(
      userId,
      body.roleId,
      tenantId,
      admin.id,
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
    );
  }

  @Delete(':userId/roles/:roleId')
  @HttpCode(204)
  @RequirePermissions(PERMISSIONS.ROLE_ASSIGN)
  removeRole(
    @CurrentUser() admin: { id: string },
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Req() req: express.Request,
  ) {
    const tenantId = this.tenantContext.requireTenantId();
    return this.rbacService.removeRoleFromUser(
      userId,
      roleId,
      tenantId,
      admin.id,
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
    );
  }
}
