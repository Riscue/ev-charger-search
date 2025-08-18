export interface AppResponse<T> {
    success: boolean;
    data: T;
    error: string;
}
