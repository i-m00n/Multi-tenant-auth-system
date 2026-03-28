import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RefreshTokenEntity } from './refresh-token.entity';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshTokenEntity> {
  constructor(private dataSource: DataSource) {
    super(RefreshTokenEntity, dataSource.createEntityManager());
  }

  findByTokenHash(tokenHash: string) {
    return this.findOne({
      where: { tokenHash, isRevoked: false },
    });
  }

  findAllByFamilyId(familyId: string) {
    return this.find({ where: { familyId } });
  }

  async revokeToken(tokenHash: string) {
    await this.update({ tokenHash }, { isRevoked: true });
  }

  async revokeFamilyById(familyId: string) {
    // called on replay attack - kills entire session
    await this.update({ familyId }, { isRevoked: true });
  }

  async revokeAllByUserId(userId: string) {
    // called on logout from all devices
    await this.update({ userId }, { isRevoked: true });
  }

  createToken(data: {
    tokenHash: string;
    familyId: string;
    userId: string;
    tenantId: string;
    expiresAt: Date;
  }) {
    const token = this.create(data);
    return this.save(token);
  }

  async deleteExpired() {
    // utility for cleanup job later
    await this.createQueryBuilder()
      .delete()
      .where('expires_at < now()')
      .execute();
  }
}
