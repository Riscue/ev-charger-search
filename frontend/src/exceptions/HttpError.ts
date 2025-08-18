import {AxiosResponse} from "axios";

export class HttpError extends Error {
    response: AxiosResponse<any>;

    constructor(response: AxiosResponse<any>) {
        super(response.data.error);
        this.name = 'HttpError';
        this.response = response;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
