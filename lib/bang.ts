import { status, statusText } from '../dependencies.ts';
import ServerResponse from './response.ts';

interface BangOptions {
    message?: string,
    status?: number
}

export class Bang extends Error {
    response: ServerResponse;
    isDeveloperError?: true;
    constructor(error?: string | Error, options?: BangOptions) {
        const code = options?.status ?? status.InternalServerError;
        super(options?.message || ((error instanceof Error) ? error.message : error) || statusText.get(code));
        this.response = new ServerResponse({
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

export const badRequest = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.BadRequest });
};

export const unauthorized = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.Unauthorized });
};

export const paymentRequired = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.PaymentRequired });
};

export const forbidden = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.Forbidden });
};

export const notFound = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.NotFound });
};

export const methodNotAllowed = (error?: string | Error, message?: string, allow?: string | Array<string>) => {
    const err = new Bang(error, { status : status.MethodNotAllowed });
    err.response.headers.set('Allow', [].concat(allow).join(', '));
    return err;
};

export const notAcceptable = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.NotAcceptable });
};

export const proxyAuthRequired = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.ProxyAuthRequired });
};

export const clientTimeout = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.RequestTimeout });
};

export const conflict = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.Conflict });
};

export const gone = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.Gone });
};

export const lengthRequired = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.LengthRequired });
};

export const preconditionFailed = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.PreconditionFailed });
};

export const entityTooLarge = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.RequestEntityTooLarge });
};

export const urlTooLong = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.RequestURITooLong });
};

export const unsupportedMediaType = (error?: string | Error, message?: string) => {
    return new Bang(error, { status : status.UnsupportedMediaType });
};

export const rangeNotSatisfiable = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.RequestedRangeNotSatisfiable
    });
};

export const expectationFailed = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.ExpectationFailed
    });
};

export const teapot = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.Teapot
    });
};

export const misdirected = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.MisdirectedRequest
    });
};

export const badData = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.UnprocessableEntity
    });
};

export const locked = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.Locked
    });
};

export const failedDependency = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.FailedDependency
    });
};

export const upgradeRequired = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.UpgradeRequired
    });
};

export const preconditionRequired = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.PreconditionRequired
    });
};

export const tooManyRequests = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.TooManyRequests
    });
};

export const headerFieldsTooLarge = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.RequestHeaderFieldsTooLarge
    });
};

export const illegal = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.UnavailableForLegalReasons
    });
};

export const internal = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.InternalServerError
    });
};

export const notImplemented = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.NotImplemented
    });
};

export const badGateway = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.BadGateway
    });
};

export const serverUnavailable = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.ServiceUnavailable
    });
};

export const gatewayTimeout = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.GatewayTimeout
    });
};

export const unsupportedHttpVersion = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.HTTPVersionNotSupported
    });
};

export const variantAlsoNegotiates = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.VariantAlsoNegotiates
    });
};

export const insufficientStorage = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.InsufficientStorage
    });
};

export const loopDetected = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.LoopDetected
    });
};

export const notExtended = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.NotExtended
    });
};

export const networkAuthenticationRequired = (error?: string | Error, message?: string) => {
    return new Bang(error, {
        message,
        status : status.NetworkAuthenticationRequired
    });
};

export const badImplementation = (error?: string | Error, message?: string) => {
    const err = new Bang(error, {
        message,
        status : status.InternalServerError
    });
    err.isDeveloperError = true;
    return err;
};
