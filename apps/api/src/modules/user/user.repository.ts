import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  findOneById(id: string) {
    return this.findOne({ where: { id, isActive: true } });
  }

  findByEmail(email: string, tenantId: string) {
    return this.findOne({ where: { email, tenantId, isActive: true } });
  }

  findByEmailWithPassword(email: string, tenantId: string) {
    return this.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .andWhere('user.tenantId = :tenantId', { tenantId })
      .andWhere('user.isActive = true')
      .getOne();
  }

  existsByEmail(email: string, tenantId: string) {
    return this.existsBy({ email, tenantId });
  }

  createUser(data: { email: string; passwordHash: string; tenantId: string }) {
    const user = this.create(data);
    return this.save(user);
  }

  async findByTenant(tenantId: string) {
    return this.find({
      where: { tenantId },
      relations: ['userRoles', 'userRoles.role'],
      order: { createdAt: 'ASC' },
    });
  }
}
