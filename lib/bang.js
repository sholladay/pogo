import { status, statusText } from '../dependencies.js';
import Response from './response.js';

export class Bang extends Error {
    constructor(option = {}) {
        const code = option.status || status.InternalServerError;
        const message = (typeof option === 'string' ? option : option.message) || statusText.get(code);
        super(message);
        this.response = new Response({
            status : code,
            body   : {
                error   : statusText.get(code),
                message : code === status.InternalServerError ? statusText.get(code) : message,
                status  : code
            }
        });
    }
    static wrap(input) {
        return input instanceof Bang ? input : new Bang(input);
    }
}

export const badRequest = (message) => {
    return new Bang({ message, status : status.BadRequest });
};

export const unauthorized = (message) => {
    return new Bang({ message, status : status.Unauthorized });
};

export const paymentRequired = (message) => {
    return new Bang({ message, status : status.PaymentRequired });
};

export const forbidden = (message) => {
    return new Bang({ message, status : status.Forbidden });
};

export const notFound = (message) => {
    return new Bang({ message, status : status.NotFound });
};

export const methodNotAllowed = (message) => {
    return new Bang({ message, status : status.MethodNotAllowed });
};

export const notAcceptable = (message) => {
    return new Bang({ message, status : status.NotAcceptable });
};

export const proxyAuthRequired = (message) => {
    return new Bang({ message, status : status.ProxyAuthRequired });
};

export const clientTimeout = (message) => {
    return new Bang({ message, status : status.RequestTimeout });
};

export const conflict = (message) => {
    return new Bang({ message, status : status.Conflict });
};

export const gone = (message) => {
    return new Bang({ message, status : status.Gone });
};

export const lengthRequired = (message) => {
    return new Bang({ message, status : status.LengthRequired });
};

export const preconditionFailed = (message) => {
    return new Bang({ message, status : status.PreconditionFailed });
};

export const entityTooLarge = (message) => {
    return new Bang({ message, status : status.RequestEntityTooLarge });
};

export const urlTooLong = (message) => {
    return new Bang({ message, status : status.RequestURITooLong });
};

export const unsupportedMediaType = (message) => {
    return new Bang({ message, status : status.UnsupportedMediaType });
};

export const rangeNotSatisfiable = (message) => {
    return new Bang({ message, status : status.RequestedRangeNotSatisfiable });
};

export const expectationFailed = (message) => {
    return new Bang({ message, status : status.ExpectationFailed });
};

export const teapot = (message) => {
    return new Bang({ message, status : status.Teapot });
};

export const misdirected = (message) => {
    return new Bang({ message, status : status.MisdirectedRequest });
};

export const badData = (message) => {
    return new Bang({ message, status : status.UnprocessableEntity });
};

export const locked = (message) => {
    return new Bang({ message, status : status.Locked });
};

export const failedDependency = (message) => {
    return new Bang({ message, status : status.FailedDependency });
};

export const upgradeRequired = (message) => {
    return new Bang({ message, status : status.UpgradeRequired });
};

export const preconditionRequired = (message) => {
    return new Bang({ message, status : status.PreconditionRequired });
};

export const tooManyRequests = (message) => {
    return new Bang({ message, status : status.TooManyRequests });
};

export const headerFieldsTooLarge = (message) => {
    return new Bang({ message, status : status.RequestHeaderFieldsTooLarge });
};

export const illegal = (message) => {
    return new Bang({ message, status : status.UnavailableForLegalReasons });
};

export const internal = (message) => {
    return new Bang({ message, status : status.InternalServerError });
};

export const notImplemented = (message) => {
    return new Bang({ message, status : status.NotImplemented });
};

export const badGateway = (message) => {
    return new Bang({ message, status : status.BadGateway });
};

export const serverUnavailable = (message) => {
    return new Bang({ message, status : status.ServiceUnavailable });
};

export const gatewayTimeout = (message) => {
    return new Bang({ message, status : status.GatewayTimeout });
};

export const unsupportedHttpVersion = (message) => {
    return new Bang({ message, status : status.HTTPVersionNotSupported });
};

export const variantAlsoNegotiates = (message) => {
    return new Bang({ message, status : status.VariantAlsoNegotiates });
};

export const insufficientStorage = (message) => {
    return new Bang({ message, status : status.InsufficientStorage });
};

export const loopDetected = (message) => {
    return new Bang({ message, status : status.LoopDetected });
};

export const notExtended = (message) => {
    return new Bang({ message, status : status.NotExtended });
};

export const networkAuthenticationRequired = (message) => {
    return new Bang({ message, status : status.NetworkAuthenticationRequired });
};

export const badImplementation = (message) => {
    const error = new Bang({ message, status : status.InternalServerError });
    error.isDeveloperError = true;
    return error;
};
