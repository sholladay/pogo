import { status, statusText } from '../dependencies.ts';
import ServerResponse from './response.ts';

export interface BangOptions extends ErrorOptions {
    ctor?: () => Bang,
    status?: number
}

export interface MethodNotAllowedOptions extends BangOptions {
    allow?: string | Iterable<string>
}

const toOptions = (options?: BangOptions | Error): BangOptions => {
    return options instanceof Error ? { cause : options } : { ...options };
};

const shortcut = (
    message: string | Error | undefined,
    options: BangOptions | Error | undefined,
    status: number,
    ctor: () => Bang
) => {
    return new Bang(message, {
        ...toOptions(options),
        ctor,
        status
    })
};

export class Bang extends Error {
    response: ServerResponse;
    isDeveloperError?: true;
    constructor(message?: string | Error, options?: BangOptions | Error) {
        options = toOptions(options);
        const code = options.status ?? status.InternalServerError;
        const msg = (typeof message === 'string' ? message : '') || statusText.get(code);
        const cause = options.cause || (message instanceof Error ? message : undefined);
        const ctor = typeof options.ctor === 'function' ? options.ctor : Bang;

        super(msg, cause && { cause });
        Error.captureStackTrace(this, ctor);

        this.response = new ServerResponse({
            status : code,
            body   : {
                error   : statusText.get(code),
                message : code === status.InternalServerError ? statusText.get(code) : this.message,
                status  : code
            }
        });
    }
    static wrap(message?: string | Error) {
        return message instanceof Bang ? message : new Bang(message, { ctor : Bang.wrap });
    }
}

export const badRequest = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.BadRequest, badRequest);
};

export const unauthorized = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.Unauthorized, unauthorized);
};

export const paymentRequired = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.PaymentRequired, paymentRequired);
};

export const forbidden = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.Forbidden, forbidden);
};

export const notFound = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.NotFound, notFound);
};

export const methodNotAllowed = (message?: string | Error, options?: Error | MethodNotAllowedOptions) => {
    options = toOptions(options);
    const error = shortcut(message, options, status.MethodNotAllowed, methodNotAllowed);
    const _allow = options.allow || [];
    const allow = Array.from(typeof _allow === 'string' ? [_allow] : _allow).filter(Boolean);
    if (allow.length > 0) {
        error.response.headers.set('Allow', allow.join(', '));
    }
    return error;
};

export const notAcceptable = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.NotAcceptable, notAcceptable);
};

export const proxyAuthRequired = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.ProxyAuthRequired, proxyAuthRequired);
};

export const clientTimeout = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.RequestTimeout, clientTimeout);
};

export const conflict = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.Conflict, conflict);
};

export const gone = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.Gone, gone);
};

export const lengthRequired = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.LengthRequired, lengthRequired);
};

export const preconditionFailed = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.PreconditionFailed, preconditionFailed);
};

export const entityTooLarge = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.RequestEntityTooLarge, entityTooLarge);
};

export const urlTooLong = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.RequestURITooLong, urlTooLong);
};

export const unsupportedMediaType = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.UnsupportedMediaType, unsupportedMediaType);
};

export const rangeNotSatisfiable = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.RequestedRangeNotSatisfiable, rangeNotSatisfiable);
};

export const expectationFailed = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.ExpectationFailed, expectationFailed);
};

export const teapot = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.Teapot, teapot);
};

export const misdirected = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.MisdirectedRequest, misdirected);
};

export const badData = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.UnprocessableEntity, badData);
};

export const locked = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.Locked, locked);
};

export const failedDependency = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.FailedDependency, failedDependency);
};

export const tooEarly = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.TooEarly, tooEarly);
};

export const upgradeRequired = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.UpgradeRequired, upgradeRequired);
};

export const preconditionRequired = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.PreconditionRequired, preconditionRequired);
};

export const tooManyRequests = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.TooManyRequests, tooManyRequests);
};

export const headerFieldsTooLarge = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.RequestHeaderFieldsTooLarge, headerFieldsTooLarge);
};

export const illegal = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.UnavailableForLegalReasons, illegal);
};

export const internal = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.InternalServerError, internal);
};

export const badImplementation = (message?: string | Error, options?: BangOptions | Error) => {
    const error = shortcut(message, options, status.InternalServerError, badImplementation);
    error.isDeveloperError = true;
    return error;
};

export const notImplemented = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.NotImplemented, notImplemented);
};

export const badGateway = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.BadGateway, badGateway);
};

export const serverUnavailable = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.ServiceUnavailable, serverUnavailable);
};

export const gatewayTimeout = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.GatewayTimeout, gatewayTimeout);
};

export const unsupportedHttpVersion = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.HTTPVersionNotSupported, unsupportedHttpVersion);
};

export const variantAlsoNegotiates = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.VariantAlsoNegotiates, variantAlsoNegotiates);
};

export const insufficientStorage = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.InsufficientStorage, insufficientStorage);
};

export const loopDetected = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.LoopDetected, loopDetected);
};

export const notExtended = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.NotExtended, notExtended);
};

export const networkAuthenticationRequired = (message?: string | Error, options?: BangOptions | Error) => {
    return shortcut(message, options, status.NetworkAuthenticationRequired, networkAuthenticationRequired);
};
