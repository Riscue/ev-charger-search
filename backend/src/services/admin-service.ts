import {AppResponse} from "../app-response";
import {Database} from "sqlite";

export class AdminService {
    constructor(private db: Database) {}

    async getAllPrices(): Promise<any[]> {
        try {
            return await this.db.all("SELECT * FROM prices ORDER BY name");
        } catch (error: any) {
            throw new Error(`Failed to fetch prices: ${error.message}`);
        }
    }

    async createPrice(name: string, acPrice?: number, dcPrice?: number): Promise<void> {
        this.validatePriceData(name, acPrice, dcPrice);

        try {
            await this.db.run(
                "INSERT INTO prices (name, ac_price, dc_price) VALUES (?, ?, ?)",
                [name.trim(), acPrice || null, dcPrice || null]
            );
        } catch (error: any) {
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                throw new Error("Bu firma adı zaten mevcut");
            }
            throw new Error(`Failed to create price: ${error.message}`);
        }
    }

    async updatePrice(id: number, name: string, acPrice?: number, dcPrice?: number): Promise<void> {
        this.validatePriceData(name, acPrice, dcPrice);

        try {
            const result = await this.db.run(
                "UPDATE prices SET name = ?, ac_price = ?, dc_price = ? WHERE id = ?",
                [name.trim(), acPrice || null, dcPrice || null, id]
            );

            if (result.changes === 0) {
                throw new Error("Fiyat kaydı bulunamadı");
            }
        } catch (error: any) {
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                throw new Error("Bu firma adı zaten mevcut");
            }
            throw new Error(`Failed to update price: ${error.message}`);
        }
    }

    async deletePrice(id: number): Promise<void> {
        if (!id || isNaN(id)) {
            throw new Error("Geçersiz ID");
        }

        try {
            const result = await this.db.run("DELETE FROM prices WHERE id = ?", [id]);

            if (result.changes === 0) {
                throw new Error("Fiyat kaydı bulunamadı");
            }
        } catch (error: any) {
            throw new Error(`Failed to delete price: ${error.message}`);
        }
    }

    async importData(importUrl: string): Promise<any> {
        const response = await this.fetchFromAPI(importUrl);
        const apiData = await response.json() as any;

        if (apiData.success !== true) {
            throw new Error("API yanıtı başarısız: " + (apiData.error || "Bilinmeyen hata"));
        }

        if (!Array.isArray(apiData.data) || apiData.data.length === 0) {
            throw new Error("İçe aktarılacak veri bulunamadı");
        }

        const importData = this.processImportData(apiData.data);
        const comparisonData = await this.compareWithExistingData(importData);
        const stats = this.calculateImportStats(comparisonData);

        return {
            source: importUrl,
            totalItems: importData.length,
            stats,
            preview: comparisonData,
            importData
        };
    }

    async confirmImport(importData: any[], overwrite: boolean = false, selectedItems: number[] = []): Promise<any> {
        if (!Array.isArray(importData) || importData.length === 0) {
            throw new Error("İçe aktarma verisi gerekli");
        }

        const itemsToProcess = selectedItems.length > 0
            ? importData.filter((item: any, index: number) => selectedItems.includes(index))
            : importData;

        if (itemsToProcess.length === 0) {
            throw new Error("İşlenecek seçili öğe bulunamadı");
        }

        let updatedCount = 0;
        let createdCount = 0;
        let skippedCount = 0;

        for (const item of itemsToProcess) {
            if (!item.name || item.name.trim() === '') {
                skippedCount++;
                continue;
            }

            const existingItem = await this.db.get("SELECT id FROM prices WHERE name = ?", item.name.trim());

            if (existingItem) {
                if (overwrite) {
                    await this.db.run(
                        "UPDATE prices SET ac_price = ?, dc_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                        item.ac_price,
                        item.dc_price,
                        existingItem.id
                    );
                    updatedCount++;
                } else {
                    skippedCount++;
                }
            } else {
                await this.db.run(
                    "INSERT INTO prices (name, ac_price, dc_price) VALUES (?, ?, ?)",
                    item.name.trim(),
                    item.ac_price,
                    item.dc_price
                );
                createdCount++;
            }
        }

        return {
            message: "İçe aktarma başarıyla tamamlandı",
            summary: {
                total: importData.length,
                selected: itemsToProcess.length,
                processed: itemsToProcess.length,
                created: createdCount,
                updated: updatedCount,
                skipped: skippedCount
            }
        };
    }

    private validatePriceData(name: string, acPrice?: number, dcPrice?: number): void {
        if (!name || name.trim() === '') {
            throw new Error("Firma adı boş olamaz");
        }

        if (acPrice !== undefined && (isNaN(acPrice) || acPrice < 0)) {
            throw new Error("AC fiyatı geçerli bir sayı olmalı");
        }

        if (dcPrice !== undefined && (isNaN(dcPrice) || dcPrice < 0)) {
            throw new Error("DC fiyatı geçerli bir sayı olmalı");
        }
    }

    private async fetchFromAPI(importUrl: string): Promise<Response> {
        try {
            new URL(importUrl);
        } catch (urlError) {
            throw new Error("Geçersiz URL formatı");
        }

        const response = await fetch(importUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'EV-Charger-Search-Import/1.0',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API isteği başarısız: ${response.status} - ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error("API yanıtı JSON formatında değil");
        }

        return response;
    }

    private processImportData(apiData: any[]): any[] {
        return apiData.map((item: any) => {
            return {
                name: item.firma || item.name || item.company || item.brand || '',
                ac_price: item.acFiyat || item.ac_price || item.ac || null,
                dc_price: item.dcFiyat || item.dc_price || item.dc || null
            };
        }).filter((item: any) => item.name && item.name.trim() !== '');
    }

    private async compareWithExistingData(importData: any[]): Promise<any[]> {
        const existingData = await this.db.all("SELECT * FROM prices ORDER BY name");
        const existingMap = new Map(existingData.map((item: any) => [item.name.toLowerCase(), item]));

        return importData.map((item: any) => {
            const existing = existingMap.get(item.name.toLowerCase());

            if (!existing) {
                return {
                    name: item.name,
                    ac_price: item.ac_price,
                    dc_price: item.dc_price,
                    existing_ac: null,
                    existing_dc: null,
                    action: 'new',
                    changes: []
                };
            } else {
                const changes = [];
                let hasChanges = false;

                if (existing.ac_price !== item.ac_price) {
                    changes.push({
                        field: 'ac_price',
                        old: existing.ac_price,
                        new: item.ac_price
                    });
                    hasChanges = true;
                }

                if (existing.dc_price !== item.dc_price) {
                    changes.push({
                        field: 'dc_price',
                        old: existing.dc_price,
                        new: item.dc_price
                    });
                    hasChanges = true;
                }

                return {
                    name: item.name,
                    ac_price: item.ac_price,
                    dc_price: item.dc_price,
                    existing_ac: existing.ac_price,
                    existing_dc: existing.dc_price,
                    action: hasChanges ? 'update' : 'unchanged',
                    changes: changes
                };
            }
        });
    }

    private calculateImportStats(comparisonData: any[]): any {
        return {
            total: comparisonData.length,
            new: comparisonData.filter((item: any) => item.action === 'new').length,
            update: comparisonData.filter((item: any) => item.action === 'update').length,
            unchanged: comparisonData.filter((item: any) => item.action === 'unchanged').length
        };
    }
}