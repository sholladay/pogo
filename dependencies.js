import * as http from 'https://deno.land/std@v0.27.0/http/server.ts';
import { Status as status, STATUS_TEXT as statusText } from 'https://deno.land/std@v0.27.0/http/http_status.ts';
import React from 'https://dev.jspm.io/react@16.12.0';
import ReactDOMServer from 'https://dev.jspm.io/react-dom@16.12.0/server';

export {
    http,
    React,
    ReactDOMServer,
    status,
    statusText
};
