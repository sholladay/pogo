import { status, statusText } from '../dependencies.ts';
import Response from './response.ts';

interface BangOptions {
    message?: string,
    status?: number
}

export class Bang extends Error {
    response: Response;
    isDeveloperError?: true;
    constructor(message?: string | Error, options?: BangOptions) {
        const code = options?.status ?? status.InternalServerError;
        super(options?.message || ((message instanceof Error) ? message.message : message) || statusText.get(code));
        this.response = new Response({
            status : code,
            body   : {
                error   : statusText.get(code),
                message : code === status.InternalServerError ? statusText.get(code) : this.message,
                status  : code
            }
        });
    }
    static wrap(input: string | Error) {
        return input instanceof Bang ? input : new Bang(input);
    }
}

export const badRequest = (message?: string | Error) => {
    return new Bang(message, { status : status.BadRequest });
};

export const unauthorized = (message?: string | Error) => {
    return new Bang(message, { status : status.Unauthorized });
};

export const paymentRequired = (message?: string | Error) => {
    return new Bang(message, { status : status.PaymentRequired });
};

export const forbidden = (message?: string | Error) => {
    return new Bang(message, { status : status.Forbidden });
};

export const notFound = (message?: string | Error) => {
    return new Bang(message, { status : status.NotFound });
};

export const methodNotAllowed = (message?: string | Error) => {
    return new Bang(message, { status : status.MethodNotAllowed });
};

export const notAcceptable = (message?: string | Error) => {
    return new Bang(message, { status : status.NotAcceptable });
};

export const proxyAuthRequired = (message?: string | Error) => {
    return new Bang(message, { status : status.ProxyAuthRequired });
};

export const clientTimeout = (message?: string | Error) => {
    return new Bang(message, { status : status.RequestTimeout });
};

export const conflict = (message?: string | Error) => {
    return new Bang(message, { status : status.Conflict });
};

export const gone = (message?: string | Error) => {
    return new Bang(message, { status : status.Gone });
};

export const lengthRequired = (message?: string | Error) => {
    return new Bang(message, { status : status.LengthRequired });
};

export const preconditionFailed = (message?: string | Error) => {
    return new Bang(message, { status : status.PreconditionFailed });
};

export const entityTooLarge = (message?: string | Error) => {
    return new Bang(message, { status : status.RequestEntityTooLarge });
};

export const urlTooLong = (message?: string | Error) => {
    return new Bang(message, { status : status.RequestURITooLong });
};

export const unsupportedMediaType = (message?: string | Error) => {
    return new Bang(message, { status : status.UnsupportedMediaType });
};

export const rangeNotSatisfiable = (message?: string | Error) => {
    return new Bang(message, { status : status.RequestedRangeNotSatisfiable });
};

export const expectationFailed = (message?: string | Error) => {
    return new Bang(message, { status : status.ExpectationFailed });
};

export const teapot = (message?: string | Error) => {
    return new Bang(message, { status : status.Teapot });
};

export const misdirected = (message?: string | Error) => {
    return new Bang(message, { status : status.MisdirectedRequest });
};

export const badData = (message?: string | Error) => {
    return new Bang(message, { status : status.UnprocessableEntity });
};

export const locked = (message?: string | Error) => {
    return new Bang(message, { status : status.Locked });
};

export const failedDependency = (message?: string | Error) => {
    return new Bang(message, { status : status.FailedDependency });
};

export const upgradeRequired = (message?: string | Error) => {
    return new Bang(message, { status : status.UpgradeRequired });
};

export const preconditionRequired = (message?: string | Error) => {
    return new Bang(message, { status : status.PreconditionRequired });
};

export const tooManyRequests = (message?: string | Error) => {
    return new Bang(message, { status : status.TooManyRequests });
};

export const headerFieldsTooLarge = (message?: string | Error) => {
    return new Bang(message, { status : status.RequestHeaderFieldsTooLarge });
};

export const illegal = (message?: string | Error) => {
    return new Bang(message, { status : status.UnavailableForLegalReasons });
};

export const internal = (message?: string | Error) => {
    return new Bang(message, { status : status.InternalServerError });
};

export const notImplemented = (message?: string | Error) => {
    return new Bang(message, { status : status.NotImplemented });
};

export const badGateway = (message?: string | Error) => {
    return new Bang(message, { status : status.BadGateway });
};

export const serverUnavailable = (message?: string | Error) => {
    return new Bang(message, { status : status.ServiceUnavailable });
};

export const gatewayTimeout = (message?: string | Error) => {
    return new Bang(message, { status : status.GatewayTimeout });
};

export const unsupportedHttpVersion = (message?: string | Error) => {
    return new Bang(message, { status : status.HTTPVersionNotSupported });
};

export const variantAlsoNegotiates = (message?: string | Error) => {
    return new Bang(message, { status : status.VariantAlsoNegotiates });
};

export const insufficientStorage = (message?: string | Error) => {
    return new Bang(message, { status : status.InsufficientStorage });
};

export const loopDetected = (message?: string | Error) => {
    return new Bang(message, { status : status.LoopDetected });
};

export const notExtended = (message?: string | Error) => {
    return new Bang(message, { status : status.NotExtended });
};

export const networkAuthenticationRequired = (message?: string | Error) => {
    return new Bang(message, { status : status.NetworkAuthenticationRequired });
};

export const badImplementation = (message?: string | Error) => {
    const error = new Bang(message, { status : status.InternalServerError });
    error.isDeveloperError = true;
    return error;
};
