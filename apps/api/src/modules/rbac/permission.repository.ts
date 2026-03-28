import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { Permission } from './permissions.constants';

@Injectable()
export class PermissionRepository extends Repository<PermissionEntity> {
  constructor(private dataSource: DataSource) {
    super(PermissionEntity, dataSource.createEntityManager());
  }

  findByName(name: Permission) {
    return this.findOne({ where: { name } });
  }

  findAll() {
    return this.find();
  }
}
