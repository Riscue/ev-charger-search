import {SortOrder} from "../components/shared/CustomTable";

export class SearchDto {
    shortId?: string;
    filters?: string[];
    orderBy?: string;
    order?: SortOrder;
}
