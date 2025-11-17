import request from "./configs/axios-configs";
import {AdminPriceDto} from "../dto/admin-price-dto";

class AdminAPI {
    private getAuthHeader(username: string, password: string) {
        const credentials = btoa(`${username}:${password}`);
        return `Basic ${credentials}`;
    }

    private makeRequest(username: string, password: string, config: any): Promise<any> {
        return request({
            ...config,
            headers: {
                ...config.headers,
                'Authorization': this.getAuthHeader(username, password)
            }
        });
    }

    authCheck(username: string, password: string): Promise<{
        authenticated: boolean,
        username: string,
        role: string
    }> {
        return this.makeRequest(username, password, {
            url: `/admin/auth`,
            method: "GET",
            throw: true,
        });
    }

    getPrices(username: string, password: string): Promise<AdminPriceDto[]> {
        return this.makeRequest(username, password, {
            url: `/admin/prices`,
            method: "GET",
        });
    }

    createPrice(username: string, password: string, name: string, acPrice?: number, dcPrice?: number): Promise<string> {
        return this.makeRequest(username, password, {
            url: `/admin/prices`,
            method: "POST",
            data: {
                name,
                acPrice,
                dcPrice
            },
        });
    }

    updatePrice(username: string, password: string, id: number, name: string, acPrice?: number, dcPrice?: number): Promise<string> {
        return this.makeRequest(username, password, {
            url: `/admin/prices/${id}`,
            method: "PUT",
            data: {
                name,
                acPrice,
                dcPrice
            },
        });
    }

    deletePrice(username: string, password: string, id: number): Promise<string> {
        return this.makeRequest(username, password, {
            url: `/admin/prices/${id}`,
            method: "DELETE",
        });
    }

    importData(username: string, password: string, source: string): Promise<any> {
        return this.makeRequest(username, password, {
            url: `/admin/import`,
            method: "POST",
            data: { source },
        });
    }

    confirmImport(username: string, password: string, importData: any[], overwrite = false, selectedItems: number[] = []): Promise<any> {
        return this.makeRequest(username, password, {
            url: `/admin/import/confirm`,
            method: "POST",
            data: { importData, overwrite, selectedItems },
        });
    }
}

export default new AdminAPI();
