"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RlsSubscriber = void 0;
const typeorm_1 = require("typeorm");
const tenant_context_service_1 = require("../modules/tenant/tenant-context.service");
const typeorm_2 = require("@nestjs/typeorm");
let RlsSubscriber = class RlsSubscriber {
    dataSource;
    tenantContext;
    constructor(dataSource, tenantContext) {
        this.dataSource = dataSource;
        this.tenantContext = tenantContext;
        this.dataSource.subscribers.push(this);
    }
    async beforeQuery(event) {
        const tenantId = this.tenantContext?.getTenantId();
        if (!tenantId || !event.queryRunner)
            return;
        await event.queryRunner.query(`SET LOCAL app.current_tenant_id = $1`, [
            tenantId,
        ]);
    }
};
exports.RlsSubscriber = RlsSubscriber;
exports.RlsSubscriber = RlsSubscriber = __decorate([
    __param(0, (0, typeorm_2.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        tenant_context_service_1.TenantContext])
], RlsSubscriber);
//# sourceMappingURL=rls.subscriber.js.map