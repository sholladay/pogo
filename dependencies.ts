import React from 'https://cdn.skypack.dev/react@16.13.1';
// @deno-types="https://github.com/soremwar/deno_types/raw/4a5066025e84d2c5353d0f40a8869c65d7c82734/react-dom/v16.13.1/server.d.ts"
import ReactDOMServer from 'https://jspm.dev/react-dom@16.13.1/server';
import * as cookie from 'https://deno.land/std@v0.64.0/http/cookie.ts';
import * as http from 'https://deno.land/std@v0.64.0/http/server.ts';
import { Status as status, STATUS_TEXT as statusText } from 'https://deno.land/std@v0.64.0/http/http_status.ts';
import * as mime from 'https://cdn.pika.dev/mime-types@2.1.27';
import * as path from 'https://deno.land/std@v0.64.0/path/mod.ts';

export {
    React,
    ReactDOMServer,
    cookie,
    http,
    mime,
    path,
    status,
    statusText
};
