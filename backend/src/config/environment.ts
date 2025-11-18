import process from 'process';

interface EnvironmentConfig {
    PORT: number;
    DB_FILE: string;
    CACHE_DURATION: number;
    ADMIN_DEFAULT_PASSWORD?: string;
    NODE_ENV: 'development' | 'production' | 'test';
}

class Environment {
    private config: EnvironmentConfig;

    constructor() {
        this.config = this.validateAndLoadConfig();
        this.logConfig();
    }

    private validateAndLoadConfig(): EnvironmentConfig {
        const config: EnvironmentConfig = {
            PORT: this.getPort(),
            DB_FILE: this.getDbFile(),
            CACHE_DURATION: this.getCacheDuration(),
            ADMIN_DEFAULT_PASSWORD: this.getAdminPassword(),
            NODE_ENV: this.getNodeEnv()
        };

        this.validateConfig(config);
        return config;
    }

    private getPort(): number {
        const port = process.env.PORT;
        if (!port) {
            return 4000; // Default port
        }

        const parsedPort = parseInt(port, 10);
        if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
            throw new Error(`Invalid PORT value: ${port}. Must be a number between 1 and 65535.`);
        }

        return parsedPort;
    }

    private getDbFile(): string {
        const dbFile = process.env.DB_FILE;
        if (!dbFile) {
            return './data.db'; // Default database file
        }

        if (typeof dbFile !== 'string' || dbFile.trim() === '') {
            throw new Error('DB_FILE must be a non-empty string.');
        }

        return dbFile.trim();
    }

    private getCacheDuration(): number {
        const cacheDuration = process.env.CACHE_DURATION;
        if (!cacheDuration) {
            return 24 * 60 * 60 * 1000; // Default: 24 hours in milliseconds
        }

        const parsedDuration = parseInt(cacheDuration, 10);
        if (isNaN(parsedDuration) || parsedDuration < 0) {
            throw new Error(`Invalid CACHE_DURATION value: ${cacheDuration}. Must be a non-negative number.`);
        }

        return parsedDuration;
    }

    private getAdminPassword(): string | undefined {
        const password = process.env.ADMIN_DEFAULT_PASSWORD;
        if (!password) {
            console.warn('⚠️  ADMIN_DEFAULT_PASSWORD environment variable is not set. Admin panel will not be accessible.');
            return undefined;
        }

        if (typeof password !== 'string' || password.length < 4) {
            throw new Error('ADMIN_DEFAULT_PASSWORD must be a string with at least 4 characters.');
        }

        return password;
    }

    private getNodeEnv(): 'development' | 'production' | 'test' {
        const nodeEnv = process.env.NODE_ENV;
        if (!nodeEnv) {
            return 'development'; // Default environment
        }

        const validEnvs = ['development', 'production', 'test'];
        if (!validEnvs.includes(nodeEnv)) {
            throw new Error(`Invalid NODE_ENV value: ${nodeEnv}. Must be one of: ${validEnvs.join(', ')}`);
        }

        return nodeEnv as 'development' | 'production' | 'test';
    }

    private validateConfig(config: EnvironmentConfig): void {
        // Additional cross-field validations
        if (config.NODE_ENV === 'production') {
            if (!config.ADMIN_DEFAULT_PASSWORD) {
                throw new Error('ADMIN_DEFAULT_PASSWORD is required in production environment.');
            }

            if (config.ADMIN_DEFAULT_PASSWORD.length < 8) {
                console.warn('⚠️  Admin password should be at least 8 characters in production.');
            }

            if (config.CACHE_DURATION < 60 * 60 * 1000) { // Less than 1 hour
                console.warn('⚠️  Cache duration is very short for production. Consider increasing it for better performance.');
            }
        }

        if (config.NODE_ENV === 'test') {
            if (config.DB_FILE === './data.db') {
                console.warn('⚠️  Using default database file in test environment. Consider using a separate test database.');
            }
        }
    }

    private logConfig(): void {
        console.log('🔧 Environment Configuration:');
        console.log(`   • PORT: ${this.config.PORT}`);
        console.log(`   • DB_FILE: ${this.config.DB_FILE}`);
        console.log(`   • CACHE_DURATION: ${this.config.CACHE_DURATION}ms (${Math.round(this.config.CACHE_DURATION / (1000 * 60 * 60))}h)`);
        console.log(`   • NODE_ENV: ${this.config.NODE_ENV}`);
        console.log(`   • ADMIN_DEFAULT_PASSWORD: ${this.config.ADMIN_DEFAULT_PASSWORD ? '✅ Set' : '❌ Not set'}`);

        if (this.config.NODE_ENV === 'production') {
            console.log('🔒 Production mode detected - Security checks enabled');
        }
    }

    public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
        return this.config[key];
    }

    public getAll(): Readonly<EnvironmentConfig> {
        return { ...this.config };
    }

    public isProduction(): boolean {
        return this.config.NODE_ENV === 'production';
    }

    public isDevelopment(): boolean {
        return this.config.NODE_ENV === 'development';
    }

    public isTest(): boolean {
        return this.config.NODE_ENV === 'test';
    }
}

// Export singleton instance
export const environment = new Environment();

// Export types
export type { EnvironmentConfig };
