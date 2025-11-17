import request from "./configs/axios-configs";
import {PriceDto} from "../dto/price-dto";
import {SearchDto} from "../dto/search-dto";
import {SortOrder} from "../components/shared/CustomTable";
import {Socket} from "../page/PageHome";

export const PriceAPI = {
    getList: function (): Promise<PriceDto[]> {
        return request({
            url: `/data`,
            method: "GET",
        });
    },
    getSearchData: function (shortId: string): Promise<SearchDto> {
        return request({
            url: `/searches/${shortId}`,
            method: "GET",
            throw: true,
        });
    },
    save: function (name: string, options: string[], sortField: string, sortOrder: SortOrder, priceRange: number[], socket: Socket): Promise<string> {
        return request({
            url: `/searches`,
            method: "POST",
            throw: true,
            data: {
                name: name,
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
