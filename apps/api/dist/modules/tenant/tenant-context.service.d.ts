export declare class TenantContext {
    private als;
    run(tenantId: string, callback: () => void): void;
    getTenantId(): string | undefined;
}
