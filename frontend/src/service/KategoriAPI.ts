import request from "./configs/axios-configs";
import {PriceDto} from "../dto/price-dto";
import {SearchDto} from "../dto/search-dto";
import {SortOrder} from "../components/shared/CustomTable";
import {Socket} from "../page/PageHome";

export const PriceAPI = {
    getList: async function (): Promise<PriceDto[]> {
        return await request({
            url: `/data`,
            method: "GET",
        });
    },
    getSearchData: async function (shortId: string): Promise<SearchDto> {
        return await request({
            url: `/searches/${shortId}`,
            method: "GET",
            throw: true,
        });
    },
    save: async function (options: string[], sortField: string, sortOrder: SortOrder, priceRange: number[], socket: Socket): Promise<string> {
        return await request({
            url: `/searches`,
            method: "POST",
            throw: true,
            data: {
                criteria: options,
                sortField: sortField,
                sortOrder: sortOrder,
                priceMin: priceRange[0],
                priceMax: priceRange[1],
                socket: socket,
            },
        });
    }
}
