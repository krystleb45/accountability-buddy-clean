/**
 * Enum for standard API error codes, ensuring consistency across the application.
 */
export var ApiErrorCode;
(function (ApiErrorCode) {
    ApiErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ApiErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ApiErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ApiErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ApiErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ApiErrorCode["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ApiErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ApiErrorCode["CONFLICT"] = "CONFLICT";
    ApiErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
})(ApiErrorCode || (ApiErrorCode = {}));
/**
 * Enum for common HTTP status codes.
 * This improves consistency when handling API responses.
 */
export var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["OK"] = 200] = "OK";
    HttpStatusCode[HttpStatusCode["CREATED"] = 201] = "CREATED";
    HttpStatusCode[HttpStatusCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatusCode[HttpStatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatusCode[HttpStatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatusCode[HttpStatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatusCode[HttpStatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatusCode[HttpStatusCode["CONFLICT"] = 409] = "CONFLICT";
    HttpStatusCode[HttpStatusCode["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatusCode[HttpStatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatusCode || (HttpStatusCode = {}));
