import {SortOrder} from "../components/shared/CustomTable";
import {Socket} from "../page/PageHome";

export class SearchDto {
    shortId?: string;
    name?: string;
    criteria?: string[];
    sortField?: string;
    sortOrder?: SortOrder;
    priceMin?: number;
    priceMax?: number;
    socket?: Socket;
}
