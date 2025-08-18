import request from "./configs/axios-configs";
import {PriceDto} from "../dto/price-dto";
import {SearchDto} from "../dto/search-dto";

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
}
