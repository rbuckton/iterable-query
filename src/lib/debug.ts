interface ErrorConstructorWithStackTraceApi extends ErrorConstructor {
    captureStackTrace(target: any, stackCrawlMark?: Function): void;
}

declare const Error: ErrorConstructorWithStackTraceApi;

export function captureStackTrace(error: any, stackCrawlMark?: Function) {
    if (typeof error === "object" && error !== null && Error.captureStackTrace) {
        Error.captureStackTrace(error, stackCrawlMark || captureStackTrace);
    }
}