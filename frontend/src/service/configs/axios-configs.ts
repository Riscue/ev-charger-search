import axios, {AxiosError, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults} from "axios";
import {HttpError} from "../../exceptions/HttpError";

const LOGIN_URL = process.env.REACT_APP_LOGIN_URL;

function defaultErrorHandler(error: any) {
    if (!(error instanceof HttpError)) {
        alert(error.message || 'Bilinmeyen hata!');
        throw error;
    }
    console.debug(error.response);
    console.error(error.response?.data?.error ?? error.message);
    alert(error.message);
}

function responseHandler(response: AxiosResponse<any>) {
    if (response.status === 200) {
        if (response.config.raw) {
            return response;
        }
        const data = response.data;
        if (data?.success) {
            return data.data;
        }
        throw new HttpError(response);
    }
    throw new AxiosError('API Error! Invalid status code!');
}

function responseErrorHandler(error: any) {
    if (!error) {
        throw new Error('Unrecoverable error!! Error is null!');
    }

    console.debug(error);

    if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Unauthorized. Redirecting to login...');
        window.location.href = LOGIN_URL;
        return;
    }

    if (!error.response && error.message === 'Network Error') {
        console.warn('Possible CORS blocked redirect. Redirecting to login...');
        window.location.href = LOGIN_URL;
        return;
    }

    if (error.response) {
        console.error(error.response.data?.error ?? error.message);
        throw new HttpError(error.response);
    } else if (error.request) {
        console.error('No response received:', error.message);
        throw new HttpError(error.response);
    } else {
        console.error('Request setup error:', error.message);
        throw new HttpError(error.message);
    }
}

const axiosDefaults: CreateAxiosDefaults = {baseURL: "/api"};
const api = axios.create(axiosDefaults);

api.interceptors.response.use(responseHandler, responseErrorHandler);

export default function request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R> {
    return new Promise(
        (resolve, reject) =>
            api.request(config)
                // @ts-ignore
                .then(response => resolve(response))
                .catch(error => config.throw ? reject(error) : defaultErrorHandler(error))
    );
}
