export type NodeEnv = "development" | "test" | "production";
export interface ServiceEnv {
    nodeEnv: NodeEnv;
    port: number;
    host: string;
    logLevel: string;
    corsOrigin?: string;
    modelOrchestratorUrl?: string;
    modelProvider?: string;
    modelServerUrl?: string;
}
export declare function loadServiceEnv(defaultPort: number): ServiceEnv;
export declare function requiredEnv(name: string): string;
