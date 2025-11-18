import {PriceDto} from "../price-dto";
import {Database} from "sqlite";

export class DataService {
    private cachedData: PriceDto[] = [];
    private lastFetchTime: number = 0;
    private readonly cacheDuration: number;

    constructor(
        private db: Database,
        cacheDuration: number = 24 * 60 * 60 * 1000
    ) {
        this.cacheDuration = cacheDuration;
    }

    async getData(): Promise<PriceDto[]> {
        const now = Date.now();
        if (this.cachedData.length && now - this.lastFetchTime < this.cacheDuration) {
            return this.cachedData;
        }

        try {
            const prices = await this.db.all("SELECT name, ac_price as ac, dc_price as dc FROM prices ORDER BY name");

            if (prices.length > 0) {
                this.cachedData = prices.map((row: any) => ({
                    id: Math.round(Math.random() * 1000000),
                    name: row.name,
                    ac: row.ac,
                    dc: row.dc,
                } as PriceDto));
                this.lastFetchTime = now;
                return this.cachedData;
            }
        } catch (error) {
            console.error("Database fetch hatası:", error);
        }

        return this.cachedData.length ? this.cachedData : [];
    }

    clearCache(): void {
        this.cachedData = [];
        this.lastFetchTime = 0;
    }

    getCacheInfo(): { size: number; lastFetch: number; isValid: boolean } {
        const now = Date.now();
        return {
            size: this.cachedData.length,
            lastFetch: this.lastFetchTime,
            isValid: this.cachedData.length > 0 && (now - this.lastFetchTime) < this.cacheDuration
        };
    }
}