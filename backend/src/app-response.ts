export class AppResponse<T> {
    success?: boolean;
    data?: T;
    error?: string;

    static success(data: any) {
        const appResponse = new AppResponse();
        appResponse.success = true;
        appResponse.data = data;
        return appResponse;
    }

    static error(error: string) {
        const appResponse = new AppResponse();
        appResponse.success = false;
        appResponse.error = error;
        return appResponse;
    }
}
