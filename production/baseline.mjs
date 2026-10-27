var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
}, "bufferToFormData");

// node_modules/hono/dist/utils/body.js
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form2 = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form2[key] = value;
    } else {
      handleParsingAllValues(form2, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form2).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form2, key, value);
        delete form2[key];
      }
    });
  }
  return form2;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form2, key, value) => {
  if (form2[key] !== void 0) {
    if (Array.isArray(form2[key])) {
      ;
      form2[key].push(value);
    } else {
      form2[key] = [form2[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form2[key] = value;
    } else {
      form2[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form2, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form2;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return tryDecodeURIComponent(value);
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = tryDecodeURIComponent(value);
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    for (const anyCachedKey in bodyCache) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    ;
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var escapeRe = /[&<>'"]/;
var stringBufferToString = /* @__PURE__ */ __name(async (buffer, callbacks) => {
  let str = "";
  callbacks ||= [];
  const resolvedBuffer = await Promise.all(buffer);
  for (let i = resolvedBuffer.length - 1; ; i--) {
    str += resolvedBuffer[i];
    i--;
    if (i < 0) {
      break;
    }
    let r = resolvedBuffer[i];
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    const isEscaped = r.isEscaped;
    r = await (typeof r === "object" ? r.toString() : r);
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    if (r.isEscaped ?? isEscaped) {
      str += r;
    } else {
      const buf = [str];
      escapeToBuffer(r, buf);
      str = buf[0];
    }
  }
  return raw(str, callbacks);
}, "stringBufferToString");
var escapeToBuffer = /* @__PURE__ */ __name((str, buffer) => {
  const match2 = str.search(escapeRe);
  if (match2 === -1) {
    buffer[0] += str;
    return;
  }
  let escape;
  let index;
  let lastIndex = 0;
  for (index = match2; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escape = "&quot;";
        break;
      case 39:
        escape = "&#39;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    buffer[0] += str.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }
  buffer[0] += str.substring(lastIndex, index);
}, "escapeToBuffer");
var resolveCallbackSync = /* @__PURE__ */ __name((str) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return str;
  }
  const buffer = [str];
  const context = {};
  callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
  return buffer[0];
}, "resolveCallbackSync");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) {
        if (key === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      if (!responseHeaders) {
        let count = 0;
        for (const k in headers) {
          if (++count > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
        }
      }
      if (responseHeaders) {
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string") {
            responseHeaders.set(k, v);
          } else {
            responseHeaders.delete(k);
            for (const v2 of v) {
              responseHeaders.append(k, v2);
            }
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html2, arg, headers) => {
    const res = /* @__PURE__ */ __name((html22) => this.#newResponse(html22, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html2 === "object" ? resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html2);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} env - env Object
   * @param {ExecutionContext} executionCtx - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input2, requestInit, Env, executionCtx) => {
    if (input2 instanceof Request) {
      return this.fetch(requestInit ? new Request(input2, requestInit) : input2, Env, executionCtx);
    }
    input2 = input2.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input2) ? input2 : `http://localhost${mergePath("/", input2)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  // handler index of a dynamic path, or -1 for a static path terminal
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          if (regexpStr === ".*") {
            throw PATH_ERROR;
          }
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
            for (const k in node.#children) {
              if (
                // a single-char pattern coexists with single-char literals as a literal does
                (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
              ) {
                throw PATH_ERROR;
              }
            }
          }
          nextNode = node.#children[regexpStr] = new _Node();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) {
            if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
              throw PATH_ERROR;
            }
          }
          nextNode = node.#children[token] = new _Node();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) {
      throw PATH_ERROR;
    }
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = /* @__PURE__ */ Object.create(null);
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#tries = { [METHOD_NAME_ALL]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      Object.keys(middleware).forEach((m) => {
        if ((method === METHOD_NAME_ALL || method === m) && !middleware[m][path]) {
          this.#insertPath(m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
      });
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          if (!routes[m][path2]) {
            this.#insertPath(m, path2);
            routes[m][path2] = [
              ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
            ];
          }
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = this.#tries = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = /* @__PURE__ */ Object.create(null);
    const handlerData = [];
    [middleware, routes].forEach((r) => {
      for (const path in r) {
        const handlers = r[path];
        const pathData = trie.paths[path];
        if (!pathData) {
          staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
          continue;
        }
        const paramAssoc = pathData[1];
        handlerData[pathData[0]] = handlers.map(([h, paramCount]) => {
          const paramIndexMap = /* @__PURE__ */ Object.create(null);
          paramCount -= 1;
          for (; paramCount >= 0; paramCount--) {
            const [key, value] = paramAssoc[paramCount];
            paramIndexMap[key] = value;
          }
          return [h, paramIndexMap];
        });
      }
    });
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (let i = 0, len = handlerData.length; i < len; i++) {
      for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
        const map = handlerData[i][j]?.[1];
        if (!map) {
          continue;
        }
        const keys = Object.keys(map);
        for (let k = 0, len3 = keys.length; k < len3; k++) {
          map[keys[k]] = paramReplacementMap[map[keys[k]]];
        }
      }
    }
    const handlerMap = [];
    for (const i in indexReplacementMap) {
      handlerMap[i] = handlerData[indexReplacementMap[i]];
    }
    return [regexp, handlerMap, staticMap];
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// worker/content.ts
var archive = [
  {
    slug: "circulacao-modelos-juridicos-franceses",
    title: "A circula\xE7\xE3o dos modelos jur\xEDdicos franceses entre o Imp\xE9rio e a Rep\xFAblica",
    eyebrow: "Semin\xE1rio IREDIES \xB7 Sorbonne",
    year: 2026,
    type: "evento",
    summary: "Uma investiga\xE7\xE3o sobre os itiner\xE1rios intelectuais pelos quais a ci\xEAncia francesa do direito internacional foi recebida, traduzida e transformada no Brasil.",
    body: [
      "O semin\xE1rio desloca a pergunta cl\xE1ssica sobre \u201Cinflu\xEAncia\u201D para uma hist\xF3ria concreta da circula\xE7\xE3o: quem transporta conceitos, em que institui\xE7\xF5es eles se instalam e o que muda quando atravessam o Atl\xE2ntico.",
      "Apresentado no Institut de recherche en droit international et europ\xE9en de la Sorbonne, o encontro articula o eixo hist\xF3rico do Ius Gentium a uma rede contempor\xE2nea de pesquisa entre Florian\xF3polis e Paris."
    ],
    tags: ["hist\xF3ria do direito internacional", "circula\xE7\xE3o", "Fran\xE7a", "Brasil"],
    sourceUrl: "https://iredies.pantheonsorbonne.fr/evenements/la-circulation-modeles-juridiques-francais-dans-la-science-du-droit-international-bresil",
    sourceLabel: "IREDIES \xB7 Universit\xE9 Paris 1",
    featured: true
  },
  {
    slug: "oit-povos-indigenas-brasil",
    title: "O impacto no Brasil da Conven\xE7\xE3o da OIT sobre povos ind\xEDgenas e tribais",
    eyebrow: "Semin\xE1rio IREDIES \xB7 Sorbonne",
    year: 2026,
    type: "evento",
    summary: "Direito internacional, recep\xE7\xE3o normativa e experi\xEAncia brasileira em uma confer\xEAncia dedicada \xE0 Conven\xE7\xE3o n.\xBA 169 da OIT.",
    body: [
      "A confer\xEAncia examina o modo como uma norma internacional se torna argumento, institui\xE7\xE3o e pr\xE1tica no interior de uma ordem jur\xEDdica nacional.",
      "O tema revela uma das opera\xE7\xF5es centrais do grupo: observar o direito internacional n\xE3o como sistema abstrato, mas como linguagem que circula, encontra resist\xEAncias e reorganiza categorias jur\xEDdicas."
    ],
    tags: ["OIT", "povos ind\xEDgenas", "recep\xE7\xE3o normativa", "Brasil"],
    sourceUrl: "https://iredies.pantheonsorbonne.fr/evenements/limpact-bresil-de-la-convention-de-loit-relative-aux-peuples-indigenes-et-tribaux",
    sourceLabel: "IREDIES \xB7 Universit\xE9 Paris 1",
    featured: true
  },
  {
    slug: "sarton-medal-2024",
    title: "Sarton Medal \xB7 Hist\xF3ria da ci\xEAncia jur\xEDdica em perspectiva internacional",
    eyebrow: "Universiteit Gent",
    year: 2024,
    type: "distin\xE7\xE3o",
    summary: "Arno Dal Ri J\xFAnior integra a rela\xE7\xE3o de Sarton medallists da Universidade de Gante no ciclo 2024\u20132025.",
    body: [
      "A Sarton Chair reconhece pesquisadores por contribui\xE7\xF5es \xE0 hist\xF3ria da ci\xEAncia. A presen\xE7a de um professor de teoria e hist\xF3ria do direito internacional nesse circuito aproxima a historiografia jur\xEDdica de um debate intelectual mais amplo sobre a produ\xE7\xE3o do conhecimento.",
      "No portal, a distin\xE7\xE3o \xE9 lida menos como ornamento biogr\xE1fico e mais como \xEDndice da inser\xE7\xE3o internacional de uma agenda constru\xEDda na UFSC."
    ],
    tags: ["Sarton Medal", "hist\xF3ria da ci\xEAncia", "B\xE9lgica", "trajet\xF3ria"],
    sourceUrl: "https://sartonchair.ugent.be/en/sarton-medallists/past-medallists",
    sourceLabel: "Sarton Chair \xB7 UGent",
    featured: true
  },
  {
    slug: "revista-ius-gentium-2008",
    title: "Revista Ius Gentium \xB7 Teoria e Com\xE9rcio no Direito Internacional",
    eyebrow: "Peri\xF3dico do grupo",
    year: 2008,
    type: "mem\xF3ria",
    summary: "A primeira edi\xE7\xE3o da revista acad\xEAmica do grupo registra uma fase de intensa produ\xE7\xE3o discente, eventos e debate sobre com\xE9rcio internacional.",
    body: [
      "A revista \xE9 simultaneamente fonte e vest\xEDgio: permite ler os problemas jur\xEDdicos de seu tempo e reconstruir a cultura de pesquisa que os tornou public\xE1veis.",
      "Digitaliz\xE1-la e descrev\xEA-la como acervo transforma uma publica\xE7\xE3o hist\xF3rica em porta de entrada para novos percursos de investiga\xE7\xE3o."
    ],
    tags: ["revista", "com\xE9rcio internacional", "mem\xF3ria institucional"],
    sourceUrl: "https://www.iusgentium.ufsc.br/revista/artigo10.pdf",
    sourceLabel: "Acervo Ius Gentium \xB7 UFSC"
  },
  {
    slug: "grotius-direito-guerra-paz",
    title: "Hugo Grotius \xB7 O direito da guerra e da paz",
    eyebrow: "Cl\xE1ssicos do Direito Internacional",
    year: 2004,
    type: "cole\xE7\xE3o",
    summary: "Edi\xE7\xE3o brasileira em dois volumes publicada pela Uniju\xED no \xE2mbito da cole\xE7\xE3o de tradu\xE7\xF5es coordenada pelo grupo.",
    body: [
      "Traduzir um cl\xE1ssico n\xE3o \xE9 apenas transportar palavras. \xC9 reconstruir o vocabul\xE1rio em que uma disciplina reconhece sua pr\xF3pria hist\xF3ria.",
      "A cole\xE7\xE3o Cl\xE1ssicos do Direito Internacional tornou acess\xEDveis em portugu\xEAs obras estruturantes e consolidou a tradu\xE7\xE3o como pr\xE1tica coletiva de pesquisa."
    ],
    tags: ["Grotius", "tradu\xE7\xE3o", "guerra e paz", "cl\xE1ssicos"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/publicacoes.htm",
    sourceLabel: "Publica\xE7\xF5es hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "gentili-direito-da-guerra",
    title: "Alberico Gentili \xB7 O direito da guerra",
    eyebrow: "Cl\xE1ssicos do Direito Internacional",
    year: 2005,
    type: "cole\xE7\xE3o",
    summary: "Tradu\xE7\xE3o brasileira de uma obra central para a forma\xE7\xE3o hist\xF3rica da disciplina internacionalista.",
    body: [
      "A obra de Gentili oferece uma via privilegiada para observar a autonomiza\xE7\xE3o do racioc\xEDnio jur\xEDdico sobre a guerra.",
      "Sua presen\xE7a na cole\xE7\xE3o revela o compromisso do grupo com fontes prim\xE1rias e com a longa dura\xE7\xE3o da cultura jur\xEDdica internacional."
    ],
    tags: ["Gentili", "tradu\xE7\xE3o", "guerra", "cl\xE1ssicos"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/publicacoes.htm",
    sourceLabel: "Publica\xE7\xF5es hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "santi-romano-ordenamento-juridico",
    title: "Santi Romano \xB7 O ordenamento jur\xEDdico",
    eyebrow: "Tradu\xE7\xE3o e teoria institucional",
    year: 2008,
    type: "publica\xE7\xE3o",
    summary: "Tradu\xE7\xE3o de Arno Dal Ri J\xFAnior de um texto decisivo para pensar pluralismo, institui\xE7\xE3o e ordem jur\xEDdica.",
    body: [
      "A teoria institucional de Santi Romano permite deslocar a an\xE1lise do direito para al\xE9m da norma estatal isolada.",
      "No repert\xF3rio do grupo, o livro conecta teoria geral, hist\xF3ria conceitual e o problema da pluralidade de ordens no direito internacional."
    ],
    tags: ["Santi Romano", "institucionalismo", "tradu\xE7\xE3o", "teoria do direito"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/publicacoes.htm",
    sourceLabel: "Publica\xE7\xF5es hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "kelsen-principios-direito-internacional",
    title: "Hans Kelsen \xB7 Princ\xEDpios de Direito Internacional",
    eyebrow: "Cl\xE1ssicos do Direito Internacional",
    year: 2010,
    type: "cole\xE7\xE3o",
    summary: "Uma edi\xE7\xE3o em l\xEDngua portuguesa dedicada \xE0 arquitetura normativa da ordem jur\xEDdica internacional.",
    body: [
      "Kelsen obriga a teoria do direito a enfrentar a unidade do ordenamento e a rela\xE7\xE3o entre ordens nacional e internacional.",
      "A edi\xE7\xE3o integra uma pol\xEDtica editorial de acesso: tornar textos estruturantes dispon\xEDveis para ensino, leitura coletiva e cr\xEDtica."
    ],
    tags: ["Kelsen", "normativismo", "ordem internacional", "cl\xE1ssicos"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/publicacoes.htm",
    sourceLabel: "Publica\xE7\xF5es hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "vitoria-indios-direito-guerra",
    title: "Francisco de Vitoria \xB7 Os \xEDndios e o direito da guerra",
    eyebrow: "Cl\xE1ssicos do Direito Internacional",
    year: 2006,
    type: "cole\xE7\xE3o",
    summary: "Edi\xE7\xE3o brasileira da Uniju\xED das rele\xE7\xF5es de Vitoria, texto fundador da Escola de Salamanca sobre os direitos dos povos origin\xE1rios.",
    body: [
      "As rele\xE7\xF5es de Francisco de Vitoria colocam no centro da disciplina a pergunta sobre quem \xE9 sujeito do direito das gentes.",
      "A edi\xE7\xE3o em portugu\xEAs aproxima a Escola de Salamanca dos debates brasileiros sobre povos ind\xEDgenas, guerra justa e limites do poder."
    ],
    tags: ["Vitoria", "Escola de Salamanca", "povos origin\xE1rios", "cl\xE1ssicos"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/publicacoes.htm",
    sourceLabel: "Publica\xE7\xF5es hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "vattel-direito-das-gentes",
    title: "Emer de Vattel \xB7 O direito das gentes",
    eyebrow: "Cl\xE1ssicos do Direito Internacional",
    year: 2008,
    type: "cole\xE7\xE3o",
    summary: "Edi\xE7\xE3o brasileira da Uniju\xED da obra que sistematizou o direito das gentes para a pr\xE1tica diplom\xE1tica dos Estados.",
    body: [
      "Vattel traduziu o direito natural em manual de rela\xE7\xF5es entre Estados, marcando a passagem da teologia \xE0 diplomacia.",
      "Ler Vattel em portugu\xEAs \xE9 observar a forma\xE7\xE3o do vocabul\xE1rio da soberania que ainda organiza a pr\xE1tica internacional."
    ],
    tags: ["Vattel", "direito das gentes", "diplomacia", "cl\xE1ssicos"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/publicacoes.htm",
    sourceLabel: "Publica\xE7\xF5es hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "savigny-sistema-direito-romano",
    title: "Friedrich Carl von Savigny \xB7 Sistema do direito romano atual",
    eyebrow: "Cl\xE1ssicos do Direito Internacional",
    year: 2005,
    type: "cole\xE7\xE3o",
    summary: "Edi\xE7\xE3o brasileira da Uniju\xED da obra fundamental da escola hist\xF3rica do direito e da evolu\xE7\xE3o org\xE2nica das institui\xE7\xF5es.",
    body: [
      "Savigny ensina que o direito cresce com a hist\xF3ria de um povo, n\xE3o por decreto do legislador.",
      "A presen\xE7a da escola hist\xF3rica na cole\xE7\xE3o refor\xE7a o m\xE9todo do grupo: categorias jur\xEDdicas s\xF3 se entendem em sua dura\xE7\xE3o."
    ],
    tags: ["Savigny", "escola hist\xF3rica", "direito romano", "cl\xE1ssicos"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/publicacoes.htm",
    sourceLabel: "Publica\xE7\xF5es hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "mancini-direito-internacional",
    title: "Pasquale Stanislao Mancini \xB7 Direito internacional",
    eyebrow: "Cl\xE1ssicos do Direito Internacional",
    year: 2003,
    type: "cole\xE7\xE3o",
    summary: "Edi\xE7\xE3o brasileira da Uniju\xED da obra do jurista italiano que fundou a nacionalidade como princ\xEDpio do direito internacional.",
    body: [
      "Mancini colocou a na\xE7\xE3o no centro da ordem internacional do s\xE9culo XIX e ajudou a institucionalizar a disciplina.",
      "A edi\xE7\xE3o registra a filia\xE7\xE3o italiana do internacionalismo que a cole\xE7\xE3o tornou acess\xEDvel em l\xEDngua portuguesa."
    ],
    tags: ["Mancini", "nacionalidade", "It\xE1lia", "cl\xE1ssicos"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/publicacoes.htm",
    sourceLabel: "Publica\xE7\xF5es hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "historia-direito-internacional-comercio-moeda",
    title: "Hist\xF3ria do Direito Internacional \xB7 Com\xE9rcio, moeda, cidadania e nacionalidade",
    eyebrow: "Livro \xB7 Arno Dal Ri J\xFAnior",
    year: 2004,
    type: "publica\xE7\xE3o",
    summary: "Uma leitura hist\xF3rica de categorias que organizam pertencimento, circula\xE7\xE3o e poder na ordem internacional.",
    body: [
      "Com\xE9rcio e moeda n\xE3o aparecem como cap\xEDtulos laterais da hist\xF3ria jur\xEDdica, mas como institui\xE7\xF5es que d\xE3o forma concreta \xE0s rela\xE7\xF5es entre comunidades pol\xEDticas.",
      "Cidadania e nacionalidade completam esse quadro ao revelar como o direito distribui mobilidade, prote\xE7\xE3o e pertencimento."
    ],
    tags: ["hist\xF3ria", "com\xE9rcio", "moeda", "cidadania"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/publicacoes.htm",
    sourceLabel: "Publica\xE7\xF5es hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "workshop-soberania-2009",
    title: "Configura\xE7\xF5es da soberania na contemporaneidade",
    eyebrow: "III Workshop de Direito Internacional",
    year: 2009,
    type: "evento",
    summary: "Um encontro sobre os percursos hist\xF3ricos e as transforma\xE7\xF5es institucionais da soberania.",
    body: [
      "O workshop reuniu interpreta\xE7\xF5es hist\xF3ricas, internacionais e regionais sobre a soberania, conceito cuja aparente estabilidade esconde usos profundamente distintos.",
      "Revisitar esse programa permite reconstruir as perguntas que animavam o grupo e confront\xE1-las com o presente."
    ],
    tags: ["soberania", "evento", "integra\xE7\xE3o regional", "mem\xF3ria"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/notanteriores.htm",
    sourceLabel: "Not\xEDcias hist\xF3ricas \xB7 Ius Gentium"
  },
  {
    slug: "onufsc-caxemira-2009",
    title: "ON.UFSC \xB7 Simula\xE7\xE3o do Conselho de Seguran\xE7a",
    eyebrow: "Ensino, diplomacia e experi\xEAncia",
    year: 2009,
    type: "mem\xF3ria",
    summary: "Uma simula\xE7\xE3o acad\xEAmica sobre os conflitos na Caxemira transformou pesquisa pr\xE9via em pr\xE1tica de negocia\xE7\xE3o multilateral.",
    body: [
      "A ON.UFSC combinou forma\xE7\xE3o em direito internacional, pol\xEDtica externa, argumenta\xE7\xE3o e constru\xE7\xE3o coletiva de decis\xF5es.",
      "O registro do evento preserva uma dimens\xE3o fundamental da hist\xF3ria do grupo: a pesquisa como experi\xEAncia compartilhada e p\xFAblica."
    ],
    tags: ["ONU", "simula\xE7\xE3o", "Caxemira", "ensino"],
    sourceUrl: "https://iusgentium.ufsc.br/siteantigo/onufsc2.htm",
    sourceLabel: "Mem\xF3ria ON.UFSC"
  },
  {
    slug: "grupo-pesquisa-ufsc-cnpq",
    title: "Ius Gentium \xB7 Grupo de Pesquisa em Direito Internacional",
    eyebrow: "UFSC \xB7 CNPq",
    year: 2026,
    type: "mem\xF3ria",
    summary: "O grupo investiga criticamente as dimens\xF5es pol\xEDticas, econ\xF4micas e hist\xF3ricas do direito internacional p\xFAblico.",
    body: [
      "Vinculado \xE0 Universidade Federal de Santa Catarina e certificado institucionalmente, o Ius Gentium articula pesquisa, tradu\xE7\xE3o, publica\xE7\xE3o e forma\xE7\xE3o.",
      "Sua identidade deriva da combina\xE7\xE3o entre hist\xF3ria do direito internacional, aten\xE7\xE3o \xE0s institui\xE7\xF5es e circula\xE7\xE3o internacional de pesquisadores e modelos jur\xEDdicos."
    ],
    tags: ["UFSC", "CNPq", "grupo de pesquisa", "direito internacional"],
    sourceUrl: "https://ppgd.ufsc.br/grupos-de-pesquisa/",
    sourceLabel: "PPGD \xB7 UFSC"
  }
];
var researchLines = [
  {
    number: "01",
    title: "Hist\xF3ria do direito internacional",
    shortTitle: "Hist\xF3ria",
    thesis: "Investigar como doutrinas, institui\xE7\xF5es e vocabul\xE1rios internacionais se formam, circulam e mudam no tempo.",
    questions: ["Como nasce uma categoria jur\xEDdica?", "Quem produz a mem\xF3ria de uma disciplina?", "O que a tradu\xE7\xE3o transforma?"],
    tags: ["historiografia", "fontes", "conceitos"]
  },
  {
    number: "02",
    title: "Circula\xE7\xE3o de modelos jur\xEDdicos",
    shortTitle: "Circula\xE7\xE3o",
    thesis: "Seguir ideias em movimento entre Europa e Am\xE9rica Latina, observando apropria\xE7\xF5es, resist\xEAncias e reinven\xE7\xF5es.",
    questions: ["Por quais redes os modelos viajam?", "O que se perde e o que se cria?", "Como a periferia transforma o centro?"],
    tags: ["transfer\xEAncias", "Brasil", "Europa"]
  },
  {
    number: "03",
    title: "Com\xE9rcio, moeda e integra\xE7\xE3o",
    shortTitle: "Economia",
    thesis: "Compreender as formas jur\xEDdicas da interdepend\xEAncia econ\xF4mica e suas consequ\xEAncias para soberania e integra\xE7\xE3o regional.",
    questions: ["Quem governa a circula\xE7\xE3o?", "Como o mercado produz institui\xE7\xF5es?", "Onde termina a soberania?"],
    tags: ["com\xE9rcio", "Mercosul", "integra\xE7\xE3o"]
  },
  {
    number: "04",
    title: "Jurisdi\xE7\xF5es internacionais",
    shortTitle: "Jurisdi\xE7\xF5es",
    thesis: "Analisar tribunais, procedimentos e atores que transformam conflitos internacionais em linguagem jur\xEDdica.",
    questions: ["Como se constr\xF3i autoridade?", "Quem consegue chegar \xE0 jurisdi\xE7\xE3o?", "Como decis\xF5es circulam?"],
    tags: ["tribunais", "procedimento", "autoridade"]
  },
  {
    number: "05",
    title: "Direito internacional e Sul Global",
    shortTitle: "Sul Global",
    thesis: "Ler a ordem internacional a partir de experi\xEAncias hist\xF3ricas e pol\xEDticas que deslocam narrativas universalizantes.",
    questions: ["Quem foi exclu\xEDdo do universal?", "Como se produz assimetria?", "Quais arquivos mudam a narrativa?"],
    tags: ["cr\xEDtica", "colonialidade", "Am\xE9rica Latina"]
  },
  {
    number: "06",
    title: "Direito internacional do clima",
    shortTitle: "Clima",
    thesis: "Examinar como responsabilidade, coopera\xE7\xE3o e justi\xE7a s\xE3o reformuladas diante da crise clim\xE1tica.",
    questions: ["Como repartir responsabilidade?", "O que significa reparar?", "Quais escalas devem decidir?"],
    tags: ["clima", "responsabilidade", "coopera\xE7\xE3o"]
  }
];
var network = [
  { city: "Florian\xF3polis", country: "Brasil", institution: "Universidade Federal de Santa Catarina", relation: "Sede do grupo e eixo de forma\xE7\xE3o", period: "presente", axis: "forma\xE7\xE3o" },
  { city: "Paris", country: "Fran\xE7a", institution: "Universit\xE9 Paris 1 Panth\xE9on-Sorbonne \xB7 IREDIES", relation: "Membre Associ\xE9 do IREDIES \xB7 semin\xE1rios e circula\xE7\xE3o de pesquisa", period: "2003\u20132026", axis: "circula\xE7\xE3o" },
  { city: "Gante", country: "B\xE9lgica", institution: "Universiteit Gent", relation: "Hist\xF3ria da ci\xEAncia e coopera\xE7\xE3o acad\xEAmica", period: "2019\u20132025", axis: "pesquisa" },
  { city: "P\xE1dua", country: "It\xE1lia", institution: "Universit\xE0 degli Studi di Padova", relation: "Forma\xE7\xE3o e tradi\xE7\xE3o internacionalista", period: "1999\u2013presente", axis: "forma\xE7\xE3o" },
  { city: "Mil\xE3o", country: "It\xE1lia", institution: "Universit\xE0 Bocconi", relation: "Forma\xE7\xE3o doutoral e coopera\xE7\xE3o", period: "2003\u2013presente", axis: "forma\xE7\xE3o" },
  { city: "Macerata", country: "It\xE1lia", institution: "Universit\xE0 di Macerata", relation: "Pesquisa e mobilidade acad\xEAmica", period: "2024\u20132029", axis: "pesquisa" },
  { city: "Lille", country: "Fran\xE7a", institution: "Universit\xE9 de Lille", relation: "Professeur Distingu\xE9 \xB7 c\xE1tedra rotativa de hist\xF3ria do direito internacional", period: "2025\u20132029", axis: "circula\xE7\xE3o" },
  { city: "Floren\xE7a", country: "It\xE1lia", institution: "Universit\xE0 degli Studi di Firenze", relation: "Di\xE1logo com a escola florentina de hist\xF3ria do direito \xB7 Medalha Florentina", period: "2007\u2013presente", axis: "pesquisa" },
  { city: "Mil\xE3o \xB7 Statale", country: "It\xE1lia", institution: "Universit\xE0 degli Studi di Milano", relation: "Hist\xF3ria do direito penal internacional e teoria geral do Estado", period: "presente", axis: "pesquisa" }
];
var library = [
  { title: "United Nations Treaty Collection", family: "Tratados", description: "Tratados depositados junto ao Secret\xE1rio-Geral da ONU, com status, reservas e declara\xE7\xF5es.", access: "Acesso aberto", url: "https://treaties.un.org/", tags: ["tratados", "ONU", "fontes prim\xE1rias"] },
  { title: "International Court of Justice", family: "Jurisprud\xEAncia", description: "Julgamentos, pareceres consultivos, ordens e documenta\xE7\xE3o processual da CIJ e da PCIJ.", access: "Acesso aberto", url: "https://www.icj-cij.org/", tags: ["CIJ", "jurisprud\xEAncia", "fontes prim\xE1rias"] },
  { title: "UN Audiovisual Library of International Law", family: "Ensino", description: "Aulas, arquivos hist\xF3ricos e biblioteca de pesquisa mantidos pela ONU.", access: "Acesso aberto", url: "https://legal.un.org/avl/", tags: ["v\xEDdeo", "hist\xF3ria", "ensino"] },
  { title: "Gallica \xB7 Biblioth\xE8que nationale de France", family: "Acervos hist\xF3ricos", description: "Edi\xE7\xF5es digitalizadas de Grotius, Vattel, Pufendorf, mapas e peri\xF3dicos hist\xF3ricos.", access: "Acesso aberto", url: "https://gallica.bnf.fr/", tags: ["livros raros", "Fran\xE7a", "fontes"] },
  { title: "Peace Palace Library", family: "Bibliotecas", description: "Cat\xE1logo e guias especializados em direito internacional p\xFAblico e hist\xF3ria da disciplina.", access: "Cat\xE1logo aberto", url: "https://peacepalacelibrary.nl/", tags: ["Haia", "bibliografia", "guias"] },
  { title: "League of Nations Archives", family: "Acervos hist\xF3ricos", description: "Documentos e registros da Liga das Na\xE7\xF5es preservados pelo arquivo das Na\xE7\xF5es Unidas em Genebra.", access: "Acesso aberto", url: "https://archives.ungeneva.org/lontad", tags: ["Liga das Na\xE7\xF5es", "arquivo", "Genebra"] },
  { title: "Max Planck Encyclopedia of Public International Law", family: "Refer\xEAncia", description: "Enciclop\xE9dia especializada sobre conceitos, institui\xE7\xF5es, decis\xF5es e hist\xF3ria do direito internacional.", access: "Acesso institucional", url: "https://opil.ouplaw.com/home/MPIL", tags: ["enciclop\xE9dia", "doutrina", "conceitos"] },
  { title: "HeinOnline", family: "Bases de dados", description: "Peri\xF3dicos jur\xEDdicos, tratados, anu\xE1rios e cole\xE7\xF5es hist\xF3ricas em fac-s\xEDmile.", access: "Via Portal CAPES", url: "https://home.heinonline.org/", tags: ["peri\xF3dicos", "hist\xF3ria", "tratados"] },
  { title: "Recueil des cours \xB7 Acad\xE9mie de La Haye", family: "Doutrina", description: "Cursos monogr\xE1ficos da Academia de Direito Internacional da Haia desde 1923.", access: "Cat\xE1logo aberto", url: "https://www.hagueacademy.nl/publications/", tags: ["doutrina", "Haia", "cursos"] },
  { title: "WorldLII", family: "Direito comparado", description: "Rede de institutos de informa\xE7\xE3o jur\xEDdica com legisla\xE7\xE3o e jurisprud\xEAncia de m\xFAltiplas jurisdi\xE7\xF5es.", access: "Acesso aberto", url: "https://www.worldlii.org/", tags: ["legisla\xE7\xE3o", "comparado", "jurisprud\xEAncia"] },
  { title: "SciELO", family: "Peri\xF3dicos", description: "Produ\xE7\xE3o cient\xEDfica latino-americana em acesso aberto, incluindo peri\xF3dicos jur\xEDdicos.", access: "Acesso aberto", url: "https://scielo.org/", tags: ["Am\xE9rica Latina", "artigos", "acesso aberto"] },
  { title: "Portal de Peri\xF3dicos CAPES", family: "Bases de dados", description: "Acesso institucional brasileiro a peri\xF3dicos, livros e bases acad\xEAmicas internacionais.", access: "Acesso institucional", url: "https://www.periodicos.capes.gov.br/", tags: ["CAPES", "bases", "pesquisa"] }
];
var groupEmail = "org@grupoiusgentium.com.br";
var semesterRegistrationUrl = "https://inscricoes.ufsc.br/iusgentium36";
var semesterMeetings = [
  {
    "title": "Apresenta\xE7\xE3o do semestre: Tema e discuss\xF5es a serem trabalhadas.",
    "date": "2026-09-16",
    "authors": []
  },
  {
    "title": "Perspectivas hist\xF3ricas das doutrinas militares.",
    "date": "2026-09-23",
    "authors": [
      "Sun Tzu",
      "Tuc\xEDdides"
    ]
  },
  {
    "title": "Perspectivas sobre o direito da guerra e da paz.",
    "date": "2026-09-30",
    "authors": [
      "Hugo Grotius",
      "Alberico Gentili"
    ]
  },
  {
    "title": "Discuss\xF5es sobre Imperialismos.",
    "date": "2026-10-07",
    "authors": [
      "Emer de Vattel",
      "Jos\xE9 de San Mart\xEDn",
      "Sim\xF3n Bol\xEDvar"
    ]
  },
  {
    "title": "Discuss\xF5es sobre guerra e paz.",
    "date": "2026-10-14",
    "authors": [
      "Carl von Clausewitz",
      "Rosa Luxemburgo",
      "Vladimir Ilitch L\xEAnin"
    ]
  },
  {
    "title": "Perspectivas geopol\xEDticas e teorias militares.",
    "date": "2026-10-28",
    "authors": [
      "Wanderley Messias da Costa",
      "Halford John Mackinder"
    ]
  },
  {
    "title": "Lawfare e a teoria do espa\xE7o vital.",
    "date": "2026-11-04",
    "authors": [
      "Cristiano Zanin Martins",
      "Valeska Teixeira Zanin Martins",
      "Rafael Valim",
      "C. J. Dunlap Jr.",
      "O. F. Kittrie"
    ]
  },
  {
    "title": "Mesa redonda de encerramento do semestre",
    "date": "2026-11-11",
    "authors": [
      "Raymond Aron",
      "J\xFCrgen Habermas"
    ]
  }
];
var semesterPeriod = "16 de setembro a 11 de novembro de 2026";

// node_modules/hono/dist/jsx/constants.js
var DOM_RENDERER = /* @__PURE__ */ Symbol("RENDERER");
var DOM_ERROR_HANDLER = /* @__PURE__ */ Symbol("ERROR_HANDLER");
var DOM_INTERNAL_TAG = /* @__PURE__ */ Symbol("INTERNAL");
var PERMALINK = /* @__PURE__ */ Symbol("PERMALINK");

// node_modules/hono/dist/jsx/dom/utils.js
var setInternalTagFlag = /* @__PURE__ */ __name((fn) => {
  ;
  fn[DOM_INTERNAL_TAG] = true;
  return fn;
}, "setInternalTagFlag");

// node_modules/hono/dist/jsx/dom/context.js
var createContextProviderFunction = /* @__PURE__ */ __name((values) => ({ value, children }) => {
  if (!children) {
    return void 0;
  }
  const props = {
    children: [
      {
        tag: setInternalTagFlag(() => {
          values.push(value);
        }),
        props: {}
      }
    ]
  };
  if (Array.isArray(children)) {
    props.children.push(...children.flat());
  } else {
    props.children.push(children);
  }
  props.children.push({
    tag: setInternalTagFlag(() => {
      values.pop();
    }),
    props: {}
  });
  const res = { tag: "", props, type: "" };
  res[DOM_ERROR_HANDLER] = (err) => {
    values.pop();
    throw err;
  };
  return res;
}, "createContextProviderFunction");

// node_modules/hono/dist/jsx/context.js
var globalContexts = [];
var alsProbed = false;
var asyncLocalStorage;
var fallbackStore;
var fallbackRendersInFlight = 0;
var warnedFallbackDefault = false;
var loadAsyncLocalStorage = /* @__PURE__ */ __name(() => {
  if (alsProbed) {
    return asyncLocalStorage;
  }
  alsProbed = true;
  const global = globalThis;
  let AsyncLocalStorage;
  for (const probe of [
    // Node.js >= 20.16, Deno, Bun, Cloudflare Workers (nodejs_compat). Property
    // access only, so bundlers don't statically resolve `node:async_hooks`.
    () => global.process?.getBuiltinModule?.("node:async_hooks")?.AsyncLocalStorage,
    // Node.js < 20.16 has no `process.getBuiltinModule`, but a CJS entrypoint
    // exposes the main module's `require` here.
    () => global.process?.mainModule?.require?.("node:async_hooks")?.AsyncLocalStorage
  ]) {
    try {
      AsyncLocalStorage = probe();
    } catch {
    }
    if (AsyncLocalStorage) {
      break;
    }
  }
  if (AsyncLocalStorage) {
    asyncLocalStorage = new AsyncLocalStorage();
  }
  return asyncLocalStorage;
}, "loadAsyncLocalStorage");
var getCurrentStore = /* @__PURE__ */ __name(() => {
  return loadAsyncLocalStorage()?.getStore() || fallbackStore;
}, "getCurrentStore");
var warnIfStorelessAccess = /* @__PURE__ */ __name(() => {
  if (fallbackRendersInFlight > 0 && !warnedFallbackDefault) {
    warnedFallbackDefault = true;
    console.warn(
      "hono/jsx: AsyncLocalStorage is unavailable in this runtime, so useContext() after an await in an async component falls back to the context default value during server-side rendering. To get provided values across await boundaries, use a runtime with AsyncLocalStorage (Node.js >= 20.16, Deno, Bun, or Cloudflare Workers with the nodejs_compat flag)."
    );
  }
}, "warnIfStorelessAccess");
var getContextValuesIn = /* @__PURE__ */ __name((store, context) => {
  if (!store) {
    warnIfStorelessAccess();
    return context.values;
  }
  let values = store.get(context);
  if (!values) {
    values = [context.values[0]];
    store.set(context, values);
  }
  return values;
}, "getContextValuesIn");
var readContextValueIn = /* @__PURE__ */ __name((store, context) => {
  if (!store) {
    warnIfStorelessAccess();
    return context.values.at(-1);
  }
  const values = store.get(context);
  return values?.length ? values.at(-1) : context.values[0];
}, "readContextValueIn");
var captureContextValues = /* @__PURE__ */ __name((store) => (store ? globalContexts.filter((c) => store.has(c)) : globalContexts).map((c) => [
  c,
  readContextValueIn(store, c)
]), "captureContextValues");
var resumeWithContextValues = /* @__PURE__ */ __name((callback, store, contexts) => runWithRenderContext(() => {
  const currentStore = getCurrentStore();
  const valuesPerContext = contexts.map(([context, value]) => {
    const values = getContextValuesIn(currentStore, context);
    values.push(value);
    return values;
  });
  const popContextValues = /* @__PURE__ */ __name(() => {
    valuesPerContext.forEach((values) => {
      values.pop();
    });
  }, "popContextValues");
  try {
    const result = callback();
    if (result instanceof Promise) {
      return result.finally(popContextValues);
    }
    popContextValues();
    return result;
  } catch (e) {
    popContextValues();
    throw e;
  }
}, store), "resumeWithContextValues");
var runWithRenderContext = /* @__PURE__ */ __name((callback, resumeStore) => {
  if (getCurrentStore()) {
    return callback();
  }
  const store = resumeStore ?? /* @__PURE__ */ new WeakMap();
  const storage = loadAsyncLocalStorage();
  if (storage) {
    return storage.run(store, callback);
  }
  fallbackStore = store;
  let result;
  try {
    result = callback();
  } finally {
    fallbackStore = void 0;
  }
  if (!warnedFallbackDefault && result instanceof Promise) {
    fallbackRendersInFlight++;
    result = result.finally(() => {
      fallbackRendersInFlight--;
    });
  }
  return result;
}, "runWithRenderContext");
var captureRenderContext = /* @__PURE__ */ __name(() => {
  const store = getCurrentStore();
  const contexts = captureContextValues(store);
  return (callback) => resumeWithContextValues(callback, store, contexts);
}, "captureRenderContext");
var createContext = /* @__PURE__ */ __name((defaultValue) => {
  const values = [defaultValue];
  const context = /* @__PURE__ */ __name(((props) => {
    const contextValues = getContextValuesIn(getCurrentStore(), context);
    contextValues.push(props.value);
    let string;
    try {
      string = props.children ? (Array.isArray(props.children) ? new JSXFragmentNode("", {}, props.children) : props.children).toString() : "";
    } catch (e) {
      contextValues.pop();
      throw e;
    }
    if (string instanceof Promise) {
      return string.finally(() => contextValues.pop()).then((resString) => raw(resString, resString.callbacks));
    } else {
      contextValues.pop();
      return raw(string);
    }
  }), "context");
  context.values = values;
  context.Provider = context;
  context[DOM_RENDERER] = createContextProviderFunction(values);
  globalContexts.push(context);
  return context;
}, "createContext");
var useContext = /* @__PURE__ */ __name((context) => {
  return readContextValueIn(getCurrentStore(), context);
}, "useContext");

// node_modules/hono/dist/jsx/intrinsic-element/common.js
var deDupeKeyMap = {
  title: [],
  script: ["src"],
  style: ["data-href"],
  link: ["href"],
  meta: ["name", "httpEquiv", "charset", "itemProp"]
};
var domRenderers = {};
var dataPrecedenceAttr = "data-precedence";
var isStylesheetLinkWithPrecedence = /* @__PURE__ */ __name((props) => props.rel === "stylesheet" && "precedence" in props, "isStylesheetLinkWithPrecedence");
var shouldDeDupeByKey = /* @__PURE__ */ __name((tagName, supportSort) => {
  if (tagName === "link") {
    return supportSort;
  }
  return deDupeKeyMap[tagName].length > 0;
}, "shouldDeDupeByKey");

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var components_exports = {};
__export(components_exports, {
  button: () => button,
  form: () => form,
  input: () => input,
  link: () => link,
  meta: () => meta,
  script: () => script,
  style: () => style,
  title: () => title
});

// node_modules/hono/dist/jsx/children.js
var toArray = /* @__PURE__ */ __name((children) => Array.isArray(children) ? children : [children], "toArray");

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var metaTagMap = /* @__PURE__ */ new WeakMap();
var insertIntoHead = /* @__PURE__ */ __name((tagName, tag, props, precedence) => ({ buffer, context }) => {
  if (!buffer) {
    return;
  }
  const map = metaTagMap.get(context) || {};
  metaTagMap.set(context, map);
  const tags = map[tagName] ||= [];
  let duped = false;
  const deDupeKeys = deDupeKeyMap[tagName];
  const deDupeByKey = shouldDeDupeByKey(tagName, precedence !== void 0);
  if (deDupeByKey) {
    LOOP: for (const [, tagProps] of tags) {
      if (tagName === "link" && !(tagProps.rel === "stylesheet" && tagProps[dataPrecedenceAttr] !== void 0)) {
        continue;
      }
      for (const key of deDupeKeys) {
        if ((tagProps?.[key] ?? null) === props?.[key]) {
          duped = true;
          break LOOP;
        }
      }
    }
  }
  if (duped) {
    buffer[0] = buffer[0].replaceAll(tag, "");
  } else if (deDupeByKey || tagName === "link") {
    tags.push([tag, props, precedence]);
  } else {
    tags.unshift([tag, props, precedence]);
  }
  if (buffer[0].indexOf("</head>") !== -1) {
    let insertTags;
    if (tagName === "link" || precedence !== void 0) {
      const precedences = [];
      insertTags = tags.map(([tag2, , tagPrecedence], index) => {
        if (tagPrecedence === void 0) {
          return [tag2, Number.MAX_SAFE_INTEGER, index];
        }
        let order = precedences.indexOf(tagPrecedence);
        if (order === -1) {
          precedences.push(tagPrecedence);
          order = precedences.length - 1;
        }
        return [tag2, order, index];
      }).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(([tag2]) => tag2);
    } else {
      insertTags = tags.map(([tag2]) => tag2);
    }
    insertTags.forEach((tag2) => {
      buffer[0] = buffer[0].replaceAll(tag2, "");
    });
    buffer[0] = buffer[0].replace(/(?=<\/head>)/, insertTags.join(""));
  }
}, "insertIntoHead");
var returnWithoutSpecialBehavior = /* @__PURE__ */ __name((tag, children, props) => raw(new JSXNode(tag, props, toArray(children ?? [])).toString()), "returnWithoutSpecialBehavior");
var documentMetadataTag = /* @__PURE__ */ __name((tag, children, props, sort) => {
  if ("itemProp" in props) {
    return returnWithoutSpecialBehavior(tag, children, props);
  }
  let { precedence, blocking, ...restProps } = props;
  precedence = sort ? precedence ?? "" : void 0;
  if (sort) {
    restProps[dataPrecedenceAttr] = precedence;
  }
  const string = new JSXNode(tag, restProps, toArray(children || [])).toString();
  if (string instanceof Promise) {
    return string.then(
      (resString) => raw(string, [
        ...resString.callbacks || [],
        insertIntoHead(tag, resString, restProps, precedence)
      ])
    );
  } else {
    return raw(string, [insertIntoHead(tag, string, restProps, precedence)]);
  }
}, "documentMetadataTag");
var title = /* @__PURE__ */ __name(({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2) {
    const context = useContext(nameSpaceContext2);
    if (context === "svg" || context === "head") {
      return new JSXNode(
        "title",
        props,
        toArray(children ?? [])
      );
    }
  }
  return documentMetadataTag("title", children, props, false);
}, "title");
var script = /* @__PURE__ */ __name(({
  children,
  ...props
}) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (["src", "async"].some((k) => !props[k]) || nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("script", children, props);
  }
  return documentMetadataTag("script", children, props, false);
}, "script");
var style = /* @__PURE__ */ __name(({
  children,
  ...props
}) => {
  if (!["href", "precedence"].every((k) => k in props)) {
    return returnWithoutSpecialBehavior("style", children, props);
  }
  props["data-href"] = props.href;
  delete props.href;
  return documentMetadataTag("style", children, props, true);
}, "style");
var link = /* @__PURE__ */ __name(({ children, ...props }) => {
  if (["onLoad", "onError"].some((k) => k in props) || props.rel === "stylesheet" && (!("precedence" in props) || "disabled" in props)) {
    return returnWithoutSpecialBehavior("link", children, props);
  }
  return documentMetadataTag("link", children, props, isStylesheetLinkWithPrecedence(props));
}, "link");
var meta = /* @__PURE__ */ __name(({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("meta", children, props);
  }
  return documentMetadataTag("meta", children, props, false);
}, "meta");
var newJSXNode = /* @__PURE__ */ __name((tag, { children, ...props }) => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new JSXNode(tag, props, toArray(children ?? []))
), "newJSXNode");
var form = /* @__PURE__ */ __name((props) => {
  if (typeof props.action === "function") {
    props.action = PERMALINK in props.action ? props.action[PERMALINK] : void 0;
  }
  return newJSXNode("form", props);
}, "form");
var formActionableElement = /* @__PURE__ */ __name((tag, props) => {
  if (typeof props.formAction === "function") {
    props.formAction = PERMALINK in props.formAction ? props.formAction[PERMALINK] : void 0;
  }
  return newJSXNode(tag, props);
}, "formActionableElement");
var input = /* @__PURE__ */ __name((props) => formActionableElement("input", props), "input");
var button = /* @__PURE__ */ __name((props) => formActionableElement("button", props), "button");

// node_modules/hono/dist/jsx/utils.js
var normalizeElementKeyMap = /* @__PURE__ */ new Map([
  ["className", "class"],
  ["htmlFor", "for"],
  ["crossOrigin", "crossorigin"],
  ["httpEquiv", "http-equiv"],
  ["itemProp", "itemprop"],
  ["fetchPriority", "fetchpriority"],
  ["noModule", "nomodule"],
  ["formAction", "formaction"]
]);
var normalizeIntrinsicElementKey = /* @__PURE__ */ __name((key) => normalizeElementKeyMap.get(key) || key, "normalizeIntrinsicElementKey");
var invalidAttributeNameCharRe = /[\s"'<>/=`\\\x00-\x1f\x7f-\x9f]/;
var validAttributeNameCache = /* @__PURE__ */ new Set();
var validAttributeNameCacheMax = 1024;
var invalidTagNameCharRe = /^[!?]|[\s"'<>/=`\\\x00-\x1f\x7f-\x9f]/;
var validTagNameCache = /* @__PURE__ */ new Set();
var validTagNameCacheMax = 256;
var cacheValidName = /* @__PURE__ */ __name((cache, max, name) => {
  if (cache.size >= max) {
    cache.clear();
  }
  cache.add(name);
}, "cacheValidName");
var isValidTagName = /* @__PURE__ */ __name((name) => {
  if (validTagNameCache.has(name)) {
    return true;
  }
  if (typeof name !== "string") {
    return false;
  }
  if (name.length === 0) {
    return true;
  }
  if (invalidTagNameCharRe.test(name)) {
    return false;
  }
  cacheValidName(validTagNameCache, validTagNameCacheMax, name);
  return true;
}, "isValidTagName");
var isValidAttributeName = /* @__PURE__ */ __name((name) => {
  if (validAttributeNameCache.has(name)) {
    return true;
  }
  const len = name.length;
  if (len === 0) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    const c = name.charCodeAt(i);
    if (!(c >= 97 && c <= 122 || // a-z
    c >= 65 && c <= 90 || // A-Z
    c >= 48 && c <= 57 || // 0-9
    c === 45 || // -
    c === 95 || // _
    c === 46 || // .
    c === 58)) {
      if (!invalidAttributeNameCharRe.test(name)) {
        cacheValidName(validAttributeNameCache, validAttributeNameCacheMax, name);
        return true;
      } else {
        return false;
      }
    }
  }
  cacheValidName(validAttributeNameCache, validAttributeNameCacheMax, name);
  return true;
}, "isValidAttributeName");
var invalidStylePropertyNameCharRe = /[\s"'():;\\/\[\]{}\x00-\x1f\x7f-\x9f]/;
var validStylePropertyNameCache = /* @__PURE__ */ new Set();
var validStylePropertyNameCacheMax = 1024;
var isValidStylePropertyName = /* @__PURE__ */ __name((name) => {
  if (validStylePropertyNameCache.has(name)) {
    return true;
  }
  const len = name.length;
  if (len === 0) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    const c = name.charCodeAt(i);
    if (!(c >= 97 && c <= 122 || // a-z
    c >= 65 && c <= 90 || // A-Z
    c >= 48 && c <= 57 || // 0-9
    c === 45 || // -
    c === 95)) {
      if (!invalidStylePropertyNameCharRe.test(name)) {
        cacheValidName(validStylePropertyNameCache, validStylePropertyNameCacheMax, name);
        return true;
      } else {
        return false;
      }
    }
  }
  cacheValidName(validStylePropertyNameCache, validStylePropertyNameCacheMax, name);
  return true;
}, "isValidStylePropertyName");
var unsafeStyleValueCharRe = /[;"'\\/\[\](){}]/;
var hasUnsafeStyleValue = /* @__PURE__ */ __name((value) => {
  if (!unsafeStyleValueCharRe.test(value)) {
    return false;
  }
  let quote = 0;
  const blockStack = [];
  for (let i = 0, len = value.length; i < len; i++) {
    const c = value.charCodeAt(i);
    if (c === 92) {
      if (i === len - 1) {
        return true;
      }
      i++;
    } else if (quote !== 0) {
      if (c === 10 || c === 12 || c === 13) {
        return true;
      }
      if (c === quote) {
        quote = 0;
      }
    } else if (c === 47 && value.charCodeAt(i + 1) === 42) {
      const end = value.indexOf("*/", i + 2);
      if (end === -1) {
        return true;
      }
      i = end + 1;
    } else if (c === 34 || c === 39) {
      quote = c;
    } else if (c === 40) {
      blockStack.push(41);
    } else if (c === 91) {
      blockStack.push(93);
    } else if (c === 123 || c === 125) {
      return true;
    } else if (c === 41 || c === 93) {
      if (blockStack[blockStack.length - 1] !== c) {
        return true;
      }
      blockStack.pop();
    } else if (c === 59 && blockStack.length === 0) {
      return true;
    }
  }
  return quote !== 0 || blockStack.length !== 0;
}, "hasUnsafeStyleValue");
var styleObjectForEach = /* @__PURE__ */ __name((style2, fn) => {
  for (const [k, v] of Object.entries(style2)) {
    const key = k[0] === "-" || !/[A-Z]/.test(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    if (!isValidStylePropertyName(key)) {
      continue;
    }
    if (v == null) {
      fn(key, null);
      continue;
    }
    let value;
    if (typeof v === "number") {
      value = !key.match(
        /^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/
      ) ? `${v}px` : `${v}`;
    } else if (typeof v === "string") {
      if (hasUnsafeStyleValue(v)) {
        continue;
      }
      value = v;
    } else {
      continue;
    }
    fn(key, value);
  }
}, "styleObjectForEach");

// node_modules/hono/dist/jsx/base.js
var nameSpaceContext = void 0;
var getNameSpaceContext = /* @__PURE__ */ __name(() => nameSpaceContext, "getNameSpaceContext");
var toSVGAttributeName = /* @__PURE__ */ __name((key) => /[A-Z]/.test(key) && // Presentation attributes are findable in style object. "clip-path", "font-size", "stroke-width", etc.
// Or other un-deprecated kebab-case attributes. "overline-position", "paint-order", "strikethrough-position", etc.
key.match(
  /^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/
) ? key.replace(/([A-Z])/g, "-$1").toLowerCase() : key, "toSVGAttributeName");
var emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
var booleanAttributes = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "download",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
var resolveFunctionComponentResult = /* @__PURE__ */ __name((result, suspendedContext) => result.then((resolved) => {
  if (!Array.isArray(resolved) && !(resolved instanceof JSXNode)) {
    return resolved;
  }
  const children = Array.isArray(resolved) ? resolved : [resolved];
  const render = /* @__PURE__ */ __name(() => {
    const buffer = [""];
    childrenToStringToBuffer(children, buffer);
    return buffer.length === 1 ? raw(buffer[0], buffer.callbacks) : stringBufferToString(buffer, buffer.callbacks);
  }, "render");
  return suspendedContext ? suspendedContext(render) : runWithRenderContext(render);
}), "resolveFunctionComponentResult");
var childrenToStringToBuffer = /* @__PURE__ */ __name((children, buffer) => {
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];
    if (typeof child === "string") {
      escapeToBuffer(child, buffer);
    } else if (typeof child === "boolean" || child === null || child === void 0) {
      continue;
    } else if (child instanceof JSXNode) {
      child.toStringToBuffer(buffer);
    } else if (typeof child === "number") {
      ;
      buffer[0] += child;
    } else if (child.isEscaped) {
      ;
      buffer[0] += child;
      const callbacks = child.callbacks;
      if (callbacks) {
        buffer.callbacks ||= [];
        buffer.callbacks.push(...callbacks);
      }
    } else if (child instanceof Promise) {
      buffer.unshift("", child);
    } else {
      childrenToStringToBuffer(child, buffer);
    }
  }
}, "childrenToStringToBuffer");
var JSXNode = class {
  static {
    __name(this, "JSXNode");
  }
  tag;
  props;
  key;
  children;
  isEscaped = true;
  constructor(tag, props, children) {
    if (typeof tag !== "function" && !isValidTagName(tag)) {
      throw new Error(`Invalid JSX tag name: ${tag}`);
    }
    this.tag = tag;
    this.props = props;
    this.children = children;
  }
  get type() {
    return this.tag;
  }
  // Added for compatibility with libraries that rely on React's internal structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get ref() {
    return this.props.ref || null;
  }
  toString() {
    const render = /* @__PURE__ */ __name(() => {
      const buffer = [""];
      this.toStringToBuffer(buffer);
      return buffer.length === 1 ? "callbacks" in buffer ? resolveCallbackSync(raw(buffer[0], buffer.callbacks)).toString() : buffer[0] : stringBufferToString(buffer, buffer.callbacks);
    }, "render");
    return runWithRenderContext(render);
  }
  toStringToBuffer(buffer) {
    const tag = this.tag;
    const props = this.props;
    let { children } = this;
    buffer[0] += `<${tag}`;
    const normalizeKey = tag === "svg" || nameSpaceContext && useContext(nameSpaceContext) === "svg" ? (key) => toSVGAttributeName(normalizeIntrinsicElementKey(key)) : (key) => normalizeIntrinsicElementKey(key);
    for (let [key, v] of Object.entries(props)) {
      key = normalizeKey(key);
      if (!isValidAttributeName(key)) {
        continue;
      }
      if (key === "children") {
      } else if (key === "style" && typeof v === "object") {
        let styleStr = "";
        styleObjectForEach(v, (property, value) => {
          if (value != null) {
            styleStr += `${styleStr ? ";" : ""}${property}:${value}`;
          }
        });
        buffer[0] += ' style="';
        escapeToBuffer(styleStr, buffer);
        buffer[0] += '"';
      } else if (typeof v === "string") {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v, buffer);
        buffer[0] += '"';
      } else if (v === null || v === void 0) {
      } else if (typeof v === "number" || v.isEscaped) {
        buffer[0] += ` ${key}="${v}"`;
      } else if (typeof v === "boolean" && booleanAttributes.includes(key)) {
        if (v) {
          buffer[0] += ` ${key}=""`;
        }
      } else if (key === "dangerouslySetInnerHTML") {
        if (children.length > 0) {
          throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        }
        children = [raw(v.__html)];
      } else if (v instanceof Promise) {
        buffer[0] += ` ${key}="`;
        buffer.unshift('"', v);
      } else if (typeof v === "function") {
        if (!key.startsWith("on") && key !== "ref") {
          throw new Error(`Invalid prop '${key}' of type 'function' supplied to '${tag}'.`);
        }
      } else {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v.toString(), buffer);
        buffer[0] += '"';
      }
    }
    if (emptyTags.includes(tag) && children.length === 0) {
      buffer[0] += "/>";
      return;
    }
    buffer[0] += ">";
    childrenToStringToBuffer(children, buffer);
    buffer[0] += `</${tag}>`;
  }
};
var JSXFunctionNode = class extends JSXNode {
  static {
    __name(this, "JSXFunctionNode");
  }
  toStringToBuffer(buffer) {
    const { children } = this;
    const props = { ...this.props };
    if (children.length) {
      props.children = children.length === 1 ? children[0] : children;
    }
    const res = this.tag.call(null, props);
    if (typeof res === "boolean" || res == null) {
      return;
    } else if (res instanceof Promise) {
      if (globalContexts.length === 0) {
        buffer.unshift("", resolveFunctionComponentResult(res));
      } else {
        buffer.unshift("", resolveFunctionComponentResult(res, captureRenderContext()));
      }
    } else if (res instanceof JSXNode) {
      res.toStringToBuffer(buffer);
    } else if (Array.isArray(res)) {
      childrenToStringToBuffer(res, buffer);
    } else if (typeof res === "number" || res.isEscaped) {
      buffer[0] += res;
      if (res.callbacks) {
        buffer.callbacks ||= [];
        buffer.callbacks.push(...res.callbacks);
      }
    } else {
      escapeToBuffer(res, buffer);
    }
  }
};
var JSXFragmentNode = class extends JSXNode {
  static {
    __name(this, "JSXFragmentNode");
  }
  toStringToBuffer(buffer) {
    childrenToStringToBuffer(this.children, buffer);
  }
};
var initDomRenderer = false;
var jsxFn = /* @__PURE__ */ __name((tag, props, children) => {
  if (!initDomRenderer) {
    for (const k in domRenderers) {
      ;
      components_exports[k][DOM_RENDERER] = domRenderers[k];
    }
    initDomRenderer = true;
  }
  if (typeof tag === "function") {
    return new JSXFunctionNode(tag, props, children);
  } else if (components_exports[tag]) {
    return new JSXFunctionNode(
      components_exports[tag],
      props,
      children
    );
  } else if (tag === "svg" || tag === "head") {
    nameSpaceContext ||= createContext("");
    return new JSXNode(tag, props, [
      new JSXFunctionNode(
        nameSpaceContext,
        {
          value: tag
        },
        children
      )
    ]);
  } else {
    return new JSXNode(tag, props, children);
  }
}, "jsxFn");

// node_modules/hono/dist/jsx/jsx-dev-runtime.js
function jsxDEV(tag, props, key) {
  let node;
  if (!props || !("children" in props)) {
    node = jsxFn(tag, props, []);
  } else {
    const children = props.children;
    node = Array.isArray(children) ? jsxFn(tag, props, children) : jsxFn(tag, props, [children]);
  }
  node.key = key;
  return node;
}
__name(jsxDEV, "jsxDEV");

// worker/semester.tsx
var asset = /* @__PURE__ */ __name((name) => `/semestre-2026-2/${name}`, "asset");
var Art = /* @__PURE__ */ __name(({ name, mobile = name, className = "", width, height }) => /* @__PURE__ */ jsxDEV("picture", { class: className, "aria-hidden": "true", children: [
  /* @__PURE__ */ jsxDEV("source", { media: "(max-width: 700px)", srcset: asset(`mobile-${mobile}`) }),
  /* @__PURE__ */ jsxDEV("img", { src: asset(`desktop-${name}`), alt: "", width, height })
] }), "Art");
var Rule = /* @__PURE__ */ __name(({ header = false, className = "" }) => /* @__PURE__ */ jsxDEV(Art, { name: header ? "header-divider.svg" : "divider-row.svg", mobile: header ? "header-divider.svg" : "section-divider.svg", className: `campaign-rule ${className}`, width: header ? 1280 : 1440, height: 1 }), "Rule");
var Crosshairs = /* @__PURE__ */ __name(({ bottom = false }) => /* @__PURE__ */ jsxDEV("div", { class: `campaign-crosshairs ${bottom ? "campaign-crosshairs-bottom" : ""}`, "aria-hidden": "true", children: [
  /* @__PURE__ */ jsxDEV(Art, { name: "crosshair.svg", className: "campaign-crosshair", width: 53, height: 33 }),
  /* @__PURE__ */ jsxDEV(Art, { name: "crosshair1.svg", mobile: "crosshair.svg", className: "campaign-crosshair campaign-crosshair-center", width: 53, height: 33 }),
  /* @__PURE__ */ jsxDEV(Art, { name: "crosshair2.svg", mobile: "crosshair.svg", className: "campaign-crosshair", width: 53, height: 33 })
] }), "Crosshairs");
var FinalDiagram = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxDEV("div", { class: "campaign-final-diagram", "aria-hidden": "true", children: [
  /* @__PURE__ */ jsxDEV(Art, { name: "ellipse1.svg", className: "final-ring-large", width: 80, height: 80 }),
  /* @__PURE__ */ jsxDEV(Art, { name: "ellipse2.png", className: "final-ring-small", width: 40, height: 40 }),
  /* @__PURE__ */ jsxDEV(Art, { name: "line2.svg", className: "final-axis-h", width: 100, height: 1 }),
  /* @__PURE__ */ jsxDEV(Art, { name: "line3.svg", className: "final-axis-v", width: 100, height: 1 })
] }), "FinalDiagram");
var RegistrationLink = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxDEV("a", { class: "campaign-register", href: semesterRegistrationUrl, children: /* @__PURE__ */ jsxDEV("span", { children: "Inscreva-se pelo portal da UFSC" }) }), "RegistrationLink");
var SectionHeading = /* @__PURE__ */ __name(({ number, children }) => /* @__PURE__ */ jsxDEV("h2", { class: "campaign-section-heading", children: [
  /* @__PURE__ */ jsxDEV("span", { children: number }),
  children
] }), "SectionHeading");
var academicPractice = [
  { number: "I", title: "Leitura pr\xE9via", description: "Leitura dos textos recomendados para cada encontro, conforme o calend\xE1rio do semestre." },
  { number: "II", title: "Relatoria e contrarrelatoria", description: "Cada relatoria ter\xE1 15 minutos de apresenta\xE7\xE3o e incluir\xE1 uma breve apresenta\xE7\xE3o da autoria do texto." },
  { number: "III", title: "Debate coletivo", description: "Debates entre os respons\xE1veis pelas relatorias e os participantes do grupo, em encontros h\xEDbridos com dura\xE7\xE3o m\xE9dia de 1h30min." }
];
var formatMeetingDate = /* @__PURE__ */ __name((date) => date.split("-").reverse().join("/"), "formatMeetingDate");
var SemesterPage = /* @__PURE__ */ __name(({ origin }) => /* @__PURE__ */ jsxDEV("html", { lang: "pt-BR", "data-theme": "campaign", children: [
  /* @__PURE__ */ jsxDEV("head", { children: [
    /* @__PURE__ */ jsxDEV("meta", { charset: "utf-8" }),
    /* @__PURE__ */ jsxDEV("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
    /* @__PURE__ */ jsxDEV("title", { children: "GUERRA \xB7 Ius Gentium \xB7 36\xAA edi\xE7\xE3o \xB7 2026/2" }),
    /* @__PURE__ */ jsxDEV("meta", { name: "description", content: "Doutrinas militares no direito internacional. Oito encontros de leitura, relatoria e debate. Quartas-feiras, 19h, CCJ sala 313, em formato h\xEDbrido. Inscri\xE7\xF5es na UFSC." }),
    /* @__PURE__ */ jsxDEV("meta", { name: "theme-color", content: "#0e0e0c" }),
    /* @__PURE__ */ jsxDEV("meta", { name: "color-scheme", content: "dark" }),
    /* @__PURE__ */ jsxDEV("link", { rel: "canonical", href: `${origin}/semestre-2026-2` }),
    /* @__PURE__ */ jsxDEV("link", { rel: "icon", href: "/logo-48.webp", type: "image/webp" }),
    /* @__PURE__ */ jsxDEV("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
    /* @__PURE__ */ jsxDEV("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" }),
    /* @__PURE__ */ jsxDEV("link", { href: "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Bodoni+Moda:wght@900&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap", rel: "stylesheet" }),
    /* @__PURE__ */ jsxDEV("link", { rel: "stylesheet", href: "/semestre-2026-2.css" }),
    /* @__PURE__ */ jsxDEV("meta", { property: "og:type", content: "website" }),
    /* @__PURE__ */ jsxDEV("meta", { property: "og:locale", content: "pt_BR" }),
    /* @__PURE__ */ jsxDEV("meta", { property: "og:title", content: "GUERRA \xB7 Ius Gentium \xB7 36\xAA edi\xE7\xE3o" }),
    /* @__PURE__ */ jsxDEV("meta", { property: "og:description", content: "\xC9 a continua\xE7\xE3o do direito por outros meios? Conhe\xE7a o semestre 2026/2 e inscreva-se pelo portal UFSC." }),
    /* @__PURE__ */ jsxDEV("meta", { property: "og:url", content: `${origin}/semestre-2026-2` }),
    /* @__PURE__ */ jsxDEV("meta", { name: "twitter:card", content: "summary" })
  ] }),
  /* @__PURE__ */ jsxDEV("body", { children: [
    /* @__PURE__ */ jsxDEV("a", { class: "campaign-skip", href: "#conteudo", children: "Ir para o conte\xFAdo" }),
    /* @__PURE__ */ jsxDEV("div", { class: "campaign-page", children: [
      /* @__PURE__ */ jsxDEV(Crosshairs, {}),
      /* @__PURE__ */ jsxDEV("header", { class: "campaign-header", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "campaign-header-row", children: [
          /* @__PURE__ */ jsxDEV("a", { class: "campaign-identity", href: "/", "aria-label": "Ius Gentium \u2014 p\xE1gina principal", children: [
            /* @__PURE__ */ jsxDEV("span", { class: "campaign-edition", children: "36\xAA ed." }),
            /* @__PURE__ */ jsxDEV("span", { class: "campaign-group", children: "Grupo de Pesquisa e Estudos em Direito Internacional" })
          ] }),
          /* @__PURE__ */ jsxDEV("p", { class: "campaign-institution", children: "UFSC / CNPQ \xB7 2026/2" })
        ] }),
        /* @__PURE__ */ jsxDEV(Rule, { header: true })
      ] }),
      /* @__PURE__ */ jsxDEV("main", { id: "conteudo", children: [
        /* @__PURE__ */ jsxDEV("section", { class: "campaign-hero", "aria-labelledby": "campaign-title", children: [
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-slice", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxDEV("img", { class: "campaign-central-axis", src: asset("desktop-eixo-central-tracejado.png"), alt: "", width: 900, height: 1, "aria-hidden": "true" }),
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-hero-left", children: [
            /* @__PURE__ */ jsxDEV("h1", { id: "campaign-title", "aria-label": "Guerra", children: /* @__PURE__ */ jsxDEV("span", { "aria-hidden": "true", children: [
              "GU",
              /* @__PURE__ */ jsxDEV("br", {}),
              "ER",
              /* @__PURE__ */ jsxDEV("br", {}),
              "RA"
            ] }) }),
            /* @__PURE__ */ jsxDEV("div", { class: "campaign-question", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "[1]" }),
              /* @__PURE__ */ jsxDEV("p", { children: "\xE9 a continua\xE7\xE3o do direito por outros meios?" })
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-hero-right", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "campaign-introduction", children: [
              /* @__PURE__ */ jsxDEV("p", { class: "campaign-eyebrow", children: "Ius Gentium \xB7 36\xAA edi\xE7\xE3o" }),
              /* @__PURE__ */ jsxDEV("h2", { children: "Doutrinas militares no Direito Internacional" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "campaign-opening-details", children: [
              /* @__PURE__ */ jsxDEV("p", { children: [
                "De ",
                semesterPeriod,
                "."
              ] }),
              /* @__PURE__ */ jsxDEV("p", { children: "Quartas-feiras, \xE0s 19h \xB7 CCJ, sala 313 \xB7 participa\xE7\xE3o presencial e virtual." })
            ] }),
            /* @__PURE__ */ jsxDEV(RegistrationLink, {})
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV(Rule, {}),
        /* @__PURE__ */ jsxDEV("section", { class: "campaign-module campaign-section", children: [
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-module-meta", children: [
            /* @__PURE__ */ jsxDEV(SectionHeading, { number: "02", children: "O M\xF3dulo" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Doutrinas militares no Direito Internacional." })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-module-copy", children: [
            /* @__PURE__ */ jsxDEV("p", { children: "Neste semestre, o Ius Gentium discute as rela\xE7\xF5es entre doutrinas militares e direito internacional. As leituras incluem Sun Tzu e Tuc\xEDdides, Grotius e Gentili, as cartas de San Mart\xEDn e Bol\xEDvar, Clausewitz, Rosa Luxemburgo e L\xEAnin. Os encontros seguem pelas teorias geopol\xEDticas e pelo lawfare, at\xE9 a mesa de encerramento com Aron e Habermas." }),
            /* @__PURE__ */ jsxDEV("p", { children: "A cada encontro, os participantes apresentam e discutem os textos em relatorias e contrarrelatorias. A atividade \xE9 aberta ao p\xFAblico." })
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV(Rule, {}),
        /* @__PURE__ */ jsxDEV("section", { class: "campaign-section campaign-practice", children: [
          /* @__PURE__ */ jsxDEV(SectionHeading, { number: "03", children: "A Din\xE2mica Acad\xEAmica" }),
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-practice-grid", children: academicPractice.map((item) => /* @__PURE__ */ jsxDEV("article", { class: "campaign-practice-card", children: [
            /* @__PURE__ */ jsxDEV("span", { class: "campaign-roman", "aria-hidden": "true", children: item.number }),
            /* @__PURE__ */ jsxDEV("h3", { children: item.title }),
            /* @__PURE__ */ jsxDEV("p", { children: item.description })
          ] })) })
        ] }),
        /* @__PURE__ */ jsxDEV(Rule, {}),
        /* @__PURE__ */ jsxDEV("section", { class: "campaign-section campaign-meetings", children: [
          /* @__PURE__ */ jsxDEV(SectionHeading, { number: "04", children: "Calend\xE1rio dos Encontros" }),
          /* @__PURE__ */ jsxDEV("ol", { class: "campaign-meetings-grid", children: semesterMeetings.map((meeting, i) => /* @__PURE__ */ jsxDEV("li", { class: "campaign-meeting", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "campaign-meeting-top", children: [
              /* @__PURE__ */ jsxDEV("span", { children: String(i + 1).padStart(2, "0") }),
              /* @__PURE__ */ jsxDEV(Art, { name: "ellipse.svg", className: "meeting-dot", width: 8, height: 8 })
            ] }),
            /* @__PURE__ */ jsxDEV(Art, { name: "line.svg", className: "meeting-rule", width: 224, height: 1 }),
            /* @__PURE__ */ jsxDEV("time", { class: "campaign-meeting-date", dateTime: meeting.date, children: [
              formatMeetingDate(meeting.date),
              " \xB7 19h"
            ] }),
            /* @__PURE__ */ jsxDEV("h3", { children: meeting.title }),
            /* @__PURE__ */ jsxDEV("p", { class: "campaign-meeting-authors", children: meeting.authors.length ? meeting.authors.join(" \xB7 ") : "Apresenta\xE7\xE3o do m\xF3dulo, metodologia e divis\xE3o de relatorias." })
          ] })) })
        ] }),
        /* @__PURE__ */ jsxDEV(Rule, {}),
        /* @__PURE__ */ jsxDEV("section", { class: "campaign-section campaign-logistics", children: [
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-logistics-left", children: [
            /* @__PURE__ */ jsxDEV(SectionHeading, { number: "05", children: "Log\xEDstica e Datas" }),
            /* @__PURE__ */ jsxDEV("div", { class: "campaign-schedule", children: [
              /* @__PURE__ */ jsxDEV("p", { children: "Quartas-feiras \xB7 19h" }),
              /* @__PURE__ */ jsxDEV("p", { children: semesterPeriod }),
              /* @__PURE__ */ jsxDEV("p", { children: "CCJ, sala 313 \xB7 Formato h\xEDbrido" })
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("img", { class: "campaign-logistics-axis", src: asset("desktop-eixo-logistica.png"), alt: "", width: 120, height: 1, "aria-hidden": "true" }),
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-organizers", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h3", { children: "Coordena\xE7\xE3o" }),
              /* @__PURE__ */ jsxDEV("p", { class: "campaign-coordinator", children: "Prof. Dr. Arno Dal Ri Jr." })
            ] }),
            /* @__PURE__ */ jsxDEV(Art, { name: "line1.svg", className: "organizers-rule", width: 416, height: 1 }),
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h3", { children: "Organiza\xE7\xE3o" }),
              /* @__PURE__ */ jsxDEV("ul", { children: [
                /* @__PURE__ */ jsxDEV("li", { children: "Clarice de Ara\xFAjo Moreira" }),
                /* @__PURE__ */ jsxDEV("li", { children: "Ellen Gomes Passos" }),
                /* @__PURE__ */ jsxDEV("li", { children: "Ana Vit\xF3ria Vanzin Mendes" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV(Rule, {}),
        /* @__PURE__ */ jsxDEV("section", { class: "campaign-final", "aria-labelledby": "registration-title", children: [
          /* @__PURE__ */ jsxDEV(FinalDiagram, {}),
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-final-copy", children: [
            /* @__PURE__ */ jsxDEV("h2", { id: "registration-title", children: "Adsumus. Inscreva-se na 36\xAA Edi\xE7\xE3o." }),
            /* @__PURE__ */ jsxDEV("p", { children: "A\xE7\xE3o de extens\xE3o aberta ao p\xFAblico, com encontros presenciais e virtuais." })
          ] }),
          /* @__PURE__ */ jsxDEV(RegistrationLink, {})
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("footer", { class: "campaign-footer", children: [
        /* @__PURE__ */ jsxDEV(Rule, { header: true }),
        /* @__PURE__ */ jsxDEV("div", { class: "campaign-footer-row", children: [
          /* @__PURE__ */ jsxDEV("div", { class: "campaign-footer-links", children: [
            /* @__PURE__ */ jsxDEV("a", { href: "https://www.instagram.com/grupoiusgentium/", children: "@GRUPOIUSGENTIUM" }),
            /* @__PURE__ */ jsxDEV("a", { href: "/", children: "WWW.GRUPOIUSGENTIUM.COM.BR" })
          ] }),
          /* @__PURE__ */ jsxDEV("p", { children: "UFSC / CCJ / GPEDI \xB7 Desenvolvido para a Campanha de Divulga\xE7\xE3o 2026/2" })
        ] }),
        /* @__PURE__ */ jsxDEV("a", { class: "campaign-email", href: `mailto:${groupEmail}`, children: groupEmail })
      ] }),
      /* @__PURE__ */ jsxDEV(Crosshairs, { bottom: true })
    ] })
  ] })
] }), "SemesterPage");

// node_modules/hono/dist/middleware/secure-headers/secure-headers.js
var HEADERS_MAP = {
  crossOriginEmbedderPolicy: ["Cross-Origin-Embedder-Policy", "require-corp"],
  crossOriginResourcePolicy: ["Cross-Origin-Resource-Policy", "same-origin"],
  crossOriginOpenerPolicy: ["Cross-Origin-Opener-Policy", "same-origin"],
  originAgentCluster: ["Origin-Agent-Cluster", "?1"],
  referrerPolicy: ["Referrer-Policy", "no-referrer"],
  strictTransportSecurity: ["Strict-Transport-Security", "max-age=15552000; includeSubDomains"],
  xContentTypeOptions: ["X-Content-Type-Options", "nosniff"],
  xDnsPrefetchControl: ["X-DNS-Prefetch-Control", "off"],
  xDownloadOptions: ["X-Download-Options", "noopen"],
  xFrameOptions: ["X-Frame-Options", "SAMEORIGIN"],
  xPermittedCrossDomainPolicies: ["X-Permitted-Cross-Domain-Policies", "none"],
  xXssProtection: ["X-XSS-Protection", "0"]
};
var DEFAULT_OPTIONS = {
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: true,
  crossOriginOpenerPolicy: true,
  originAgentCluster: true,
  referrerPolicy: true,
  strictTransportSecurity: true,
  xContentTypeOptions: true,
  xDnsPrefetchControl: true,
  xDownloadOptions: true,
  xFrameOptions: true,
  xPermittedCrossDomainPolicies: true,
  xXssProtection: true,
  removePoweredBy: true,
  permissionsPolicy: {}
};
var secureHeaders = /* @__PURE__ */ __name((customOptions) => {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };
  const headersToSet = getFilteredHeaders(options);
  const callbacks = [];
  if (options.contentSecurityPolicy) {
    const [callback, value] = getCSPDirectives(
      options.contentSecurityPolicy,
      "Content-Security-Policy"
    );
    if (callback) {
      callbacks.push(callback);
    }
    headersToSet.push(["Content-Security-Policy", value]);
  }
  if (options.contentSecurityPolicyReportOnly) {
    const [callback, value] = getCSPDirectives(
      options.contentSecurityPolicyReportOnly,
      "Content-Security-Policy-Report-Only"
    );
    if (callback) {
      callbacks.push(callback);
    }
    headersToSet.push(["Content-Security-Policy-Report-Only", value]);
  }
  if (options.permissionsPolicy && Object.keys(options.permissionsPolicy).length > 0) {
    headersToSet.push([
      "Permissions-Policy",
      getPermissionsPolicyDirectives(options.permissionsPolicy)
    ]);
  }
  if (options.reportingEndpoints) {
    headersToSet.push(["Reporting-Endpoints", getReportingEndpoints(options.reportingEndpoints)]);
  }
  if (options.reportTo) {
    headersToSet.push(["Report-To", getReportToOptions(options.reportTo)]);
  }
  return /* @__PURE__ */ __name(async function secureHeaders2(ctx, next) {
    const headersToSetForReq = callbacks.length === 0 ? headersToSet : callbacks.reduce((acc, cb) => cb(ctx, acc), headersToSet);
    await next();
    setHeaders(ctx, headersToSetForReq);
    if (options?.removePoweredBy) {
      ctx.res.headers.delete("X-Powered-By");
    }
  }, "secureHeaders2");
}, "secureHeaders");
function getFilteredHeaders(options) {
  return Object.entries(HEADERS_MAP).filter(([key]) => options[key]).map(([key, defaultValue]) => {
    const overrideValue = options[key];
    return typeof overrideValue === "string" ? [defaultValue[0], overrideValue] : defaultValue;
  });
}
__name(getFilteredHeaders, "getFilteredHeaders");
function getCSPDirectives(contentSecurityPolicy, headerName) {
  const callbacks = [];
  const resultValues = [];
  for (const [directive, value] of Object.entries(contentSecurityPolicy)) {
    const valueArray = Array.isArray(value) ? value : [value];
    valueArray.forEach((value2, i) => {
      if (typeof value2 === "function") {
        const index = i * 2 + 2 + resultValues.length;
        callbacks.push((ctx, values) => {
          values[index] = value2(ctx, directive);
        });
      }
    });
    resultValues.push(
      directive.replace(
        /[A-Z]+(?![a-z])|[A-Z]/g,
        (match2, offset) => offset ? "-" + match2.toLowerCase() : match2.toLowerCase()
      ),
      ...valueArray.flatMap((value2) => [" ", value2]),
      "; "
    );
  }
  resultValues.pop();
  return callbacks.length === 0 ? [void 0, resultValues.join("")] : [
    (ctx, headersToSet) => headersToSet.map((values) => {
      if (values[0] === headerName) {
        const clone = values[1].slice();
        callbacks.forEach((cb) => {
          cb(ctx, clone);
        });
        return [values[0], clone.join("")];
      } else {
        return values;
      }
    }),
    resultValues
  ];
}
__name(getCSPDirectives, "getCSPDirectives");
function getPermissionsPolicyDirectives(policy) {
  return Object.entries(policy).map(([directive, value]) => {
    const kebabDirective = camelToKebab(directive);
    if (typeof value === "boolean") {
      return `${kebabDirective}=${value ? "*" : "none"}`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return `${kebabDirective}=()`;
      }
      if (value.length === 1 && (value[0] === "*" || value[0] === "none")) {
        return `${kebabDirective}=${value[0]}`;
      }
      const allowlist = value.map((item) => ["self", "src"].includes(item) ? item : `"${item}"`);
      return `${kebabDirective}=(${allowlist.join(" ")})`;
    }
    return "";
  }).filter(Boolean).join(", ");
}
__name(getPermissionsPolicyDirectives, "getPermissionsPolicyDirectives");
function camelToKebab(str) {
  return str.replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
}
__name(camelToKebab, "camelToKebab");
function getReportingEndpoints(reportingEndpoints = []) {
  return reportingEndpoints.map((endpoint) => `${endpoint.name}="${endpoint.url}"`).join(", ");
}
__name(getReportingEndpoints, "getReportingEndpoints");
function getReportToOptions(reportTo = []) {
  return reportTo.map((option) => JSON.stringify(option)).join(", ");
}
__name(getReportToOptions, "getReportToOptions");
function setHeaders(ctx, headersToSet) {
  headersToSet.forEach(([header, value]) => {
    ctx.res.headers.set(header, value);
  });
}
__name(setHeaders, "setHeaders");

// worker/index.tsx
var app = new Hono2();
app.use("*", secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:"],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'"],
    frameAncestors: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'", "mailto:"]
  },
  referrerPolicy: "strict-origin-when-cross-origin",
  xFrameOptions: "DENY"
}));
app.use("*", async (c, next) => {
  await next();
  c.header("X-Ius-Gentium-Edition", "Caderno-01");
  if (c.res.headers.get("Content-Type")?.includes("text/html")) {
    c.header("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
  }
});
var assetPaths = ["/semestre-2026-2.css", "/site.css", "/site.js", "/logo-48.webp", "/logo-120.webp", "/logo-300.webp", "/editais/edital-pibic-2026-2027.pdf"];
assetPaths.forEach((assetPath) => {
  app.on(["GET", "HEAD"], assetPath, (c) => c.env.ASSETS.fetch(c.req.raw));
});
app.on(["GET", "HEAD"], "/semestre-2026-2/:filename", (c) => c.env.ASSETS.fetch(c.req.raw));
app.get("/semestre-2026-2", (c) => c.html(/* @__PURE__ */ jsxDEV(SemesterPage, { origin: new URL(c.req.url).origin })));
app.on("HEAD", "*", (c) => {
  const requestedPath = new URL(c.req.url).pathname;
  const fixedPages = ["/", "/semestre-2026-2", "/sobre", "/coordenador", "/pesquisa", "/arquivo", "/biblioteca", "/anuncios", "/contato"];
  const legacyPages = Object.keys(legacyRedirects);
  const dossierExists = requestedPath.startsWith("/arquivo/") && archive.some((item) => `/arquivo/${item.slug}` === requestedPath);
  const apiExists = ["/api/archive", "/api/highlight", "/api/network"].includes(requestedPath);
  const exists = fixedPages.includes(requestedPath) || legacyPages.includes(requestedPath) || dossierExists || apiExists;
  return new Response(null, {
    status: exists ? 200 : 404,
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300",
      "Content-Type": requestedPath.startsWith("/api/") ? "application/json" : "text/html; charset=UTF-8"
    }
  });
});
var navItems = [
  { href: "/sobre", label: "O grupo" },
  { href: "/pesquisa", label: "Pesquisa" },
  { href: "/arquivo", label: "Arquivo vivo" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/anuncios", label: "An\xFAncios" },
  { href: "/coordenador", label: "Coordena\xE7\xE3o" }
];
var Layout = /* @__PURE__ */ __name(({ title: title2, description, path, origin, children }) => {
  const canonical = `${origin}${path === "/" ? "" : path}`;
  return /* @__PURE__ */ jsxDEV("html", { lang: "pt-BR", "data-theme": "paper", children: [
    /* @__PURE__ */ jsxDEV("head", { children: [
      /* @__PURE__ */ jsxDEV("meta", { charset: "utf-8" }),
      /* @__PURE__ */ jsxDEV("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsxDEV("title", { children: title2 }),
      /* @__PURE__ */ jsxDEV("meta", { name: "description", content: description }),
      /* @__PURE__ */ jsxDEV("meta", { name: "theme-color", content: "#0F1A24" }),
      /* @__PURE__ */ jsxDEV("meta", { name: "color-scheme", content: "light" }),
      /* @__PURE__ */ jsxDEV("link", { rel: "canonical", href: canonical }),
      /* @__PURE__ */ jsxDEV("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
      /* @__PURE__ */ jsxDEV("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" }),
      /* @__PURE__ */ jsxDEV("link", { href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap", rel: "stylesheet" }),
      /* @__PURE__ */ jsxDEV("link", { rel: "stylesheet", href: "/site.css" }),
      /* @__PURE__ */ jsxDEV("link", { rel: "icon", href: "/logo-48.webp", type: "image/webp" }),
      /* @__PURE__ */ jsxDEV("link", { rel: "apple-touch-icon", href: "/logo-120.webp" }),
      /* @__PURE__ */ jsxDEV("meta", { property: "og:type", content: "website" }),
      /* @__PURE__ */ jsxDEV("meta", { property: "og:locale", content: "pt_BR" }),
      /* @__PURE__ */ jsxDEV("meta", { property: "og:site_name", content: "Ius Gentium \xB7 UFSC" }),
      /* @__PURE__ */ jsxDEV("meta", { property: "og:title", content: title2 }),
      /* @__PURE__ */ jsxDEV("meta", { property: "og:description", content: description }),
      /* @__PURE__ */ jsxDEV("meta", { property: "og:url", content: canonical }),
      /* @__PURE__ */ jsxDEV("meta", { name: "twitter:card", content: "summary" })
    ] }),
    /* @__PURE__ */ jsxDEV("body", { children: [
      /* @__PURE__ */ jsxDEV("a", { class: "skip-link", href: "#conteudo", children: "Ir para o conte\xFAdo" }),
      /* @__PURE__ */ jsxDEV("div", { class: "reading-progress", "aria-hidden": "true", children: /* @__PURE__ */ jsxDEV("span", { "data-reading-progress": true }) }),
      /* @__PURE__ */ jsxDEV("header", { class: "site-header", "data-header": true, children: [
        /* @__PURE__ */ jsxDEV("a", { class: "wordmark", href: "/", "aria-label": "Ius Gentium \u2014 in\xEDcio", children: [
          /* @__PURE__ */ jsxDEV("img", { src: "/logo-48.webp", width: "42", height: "42", alt: "" }),
          /* @__PURE__ */ jsxDEV("span", { children: [
            /* @__PURE__ */ jsxDEV("b", { children: "Ius Gentium" }),
            /* @__PURE__ */ jsxDEV("small", { children: "UFSC \xB7 CNPq" })
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("nav", { class: "desktop-nav", "aria-label": "Navega\xE7\xE3o principal", children: navItems.map((item) => /* @__PURE__ */ jsxDEV("a", { href: item.href, "aria-current": path === item.href ? "page" : void 0, children: item.label })) }),
        /* @__PURE__ */ jsxDEV("div", { class: "header-actions", children: [
          /* @__PURE__ */ jsxDEV("button", { class: "search-trigger", type: "button", "data-open-search": true, "aria-label": "Abrir busca", children: [
            /* @__PURE__ */ jsxDEV("span", { children: "Buscar" }),
            /* @__PURE__ */ jsxDEV("kbd", { children: "\u2318 K" })
          ] }),
          /* @__PURE__ */ jsxDEV("button", { class: "menu-trigger", type: "button", "data-menu-trigger": true, "aria-expanded": "false", "aria-controls": "mobile-menu", children: [
            /* @__PURE__ */ jsxDEV("span", {}),
            /* @__PURE__ */ jsxDEV("span", {}),
            /* @__PURE__ */ jsxDEV("span", { class: "sr-only", children: "Abrir menu" })
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("nav", { class: "mobile-nav", id: "mobile-menu", "data-mobile-menu": true, "aria-label": "Navega\xE7\xE3o m\xF3vel", children: [
          navItems.map((item, index) => /* @__PURE__ */ jsxDEV("a", { href: item.href, children: [
            /* @__PURE__ */ jsxDEV("span", { children: String(index + 1).padStart(2, "0") }),
            item.label
          ] })),
          /* @__PURE__ */ jsxDEV("a", { href: "/contato", children: [
            /* @__PURE__ */ jsxDEV("span", { children: String(navItems.length + 1).padStart(2, "0") }),
            "Contato"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("main", { id: "conteudo", children }),
      /* @__PURE__ */ jsxDEV("footer", { class: "site-footer", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "footer-mark", children: [
          /* @__PURE__ */ jsxDEV("img", { src: "/logo-120.webp", width: "88", height: "88", alt: "Emblema do Ius Gentium" }),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("span", { children: "Ius Gentium" }),
            /* @__PURE__ */ jsxDEV("p", { children: [
              "Grupo de Pesquisa em Direito Internacional",
              /* @__PURE__ */ jsxDEV("br", {}),
              "Universidade Federal de Santa Catarina"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "footer-index", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "\xCDndice" }),
          navItems.map((item) => /* @__PURE__ */ jsxDEV("a", { href: item.href, children: item.label })),
          /* @__PURE__ */ jsxDEV("a", { href: "/contato", children: "Contato" })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "footer-contact", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Correspond\xEAncia" }),
          /* @__PURE__ */ jsxDEV("a", { href: `mailto:${groupEmail}`, children: groupEmail }),
          /* @__PURE__ */ jsxDEV("p", { children: [
            "Centro de Ci\xEAncias Jur\xEDdicas",
            /* @__PURE__ */ jsxDEV("br", {}),
            "Campus Trindade \xB7 Florian\xF3polis"
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "footer-bottom", children: [
          /* @__PURE__ */ jsxDEV("span", { children: [
            "\xA9 ",
            /* @__PURE__ */ jsxDEV("span", { "data-year": true, children: "2026" }),
            " Ius Gentium"
          ] }),
          /* @__PURE__ */ jsxDEV("span", { children: "Direito internacional em perspectiva hist\xF3rica" }),
          /* @__PURE__ */ jsxDEV("a", { href: "https://ufsc.br/", target: "_blank", rel: "noopener noreferrer", children: "UFSC \u2197" })
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV(SearchDialog, {}),
      /* @__PURE__ */ jsxDEV("script", { src: "/site.js", type: "module" })
    ] })
  ] });
}, "Layout");
var SearchDialog = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxDEV("dialog", { class: "search-dialog", "data-search-dialog": true, "aria-labelledby": "search-title", children: /* @__PURE__ */ jsxDEV("div", { class: "search-shell", children: [
  /* @__PURE__ */ jsxDEV("div", { class: "search-topline", children: [
    /* @__PURE__ */ jsxDEV("span", { id: "search-title", children: "Arquivo Ius Gentium" }),
    /* @__PURE__ */ jsxDEV("button", { type: "button", "data-close-search": true, "aria-label": "Fechar busca", children: "Esc" })
  ] }),
  /* @__PURE__ */ jsxDEV("label", { class: "search-field", children: [
    /* @__PURE__ */ jsxDEV("span", { class: "sr-only", children: "Buscar no arquivo" }),
    /* @__PURE__ */ jsxDEV("span", { "aria-hidden": "true", children: "\u2315" }),
    /* @__PURE__ */ jsxDEV("input", { type: "search", "data-global-search": true, placeholder: "Pesquise ideias, autores, lugares\u2026", autocomplete: "off" })
  ] }),
  /* @__PURE__ */ jsxDEV("div", { class: "search-suggestions", "data-search-suggestions": true, children: [
    /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Comece por" }),
    /* @__PURE__ */ jsxDEV("button", { type: "button", "data-suggestion": "circula\xE7\xE3o", children: "circula\xE7\xE3o" }),
    /* @__PURE__ */ jsxDEV("button", { type: "button", "data-suggestion": "soberania", children: "soberania" }),
    /* @__PURE__ */ jsxDEV("button", { type: "button", "data-suggestion": "tradu\xE7\xE3o", children: "tradu\xE7\xE3o" }),
    /* @__PURE__ */ jsxDEV("button", { type: "button", "data-suggestion": "Sorbonne", children: "Sorbonne" })
  ] }),
  /* @__PURE__ */ jsxDEV("div", { class: "search-results", "data-global-results": true, "aria-live": "polite" })
] }) }), "SearchDialog");
var PageIntro = /* @__PURE__ */ __name(({ index, eyebrow, title: title2, lead }) => /* @__PURE__ */ jsxDEV("section", { class: "page-intro", children: [
  /* @__PURE__ */ jsxDEV("div", { class: "page-number", children: index }),
  /* @__PURE__ */ jsxDEV("div", { class: "page-intro-copy", children: [
    /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: eyebrow }),
    /* @__PURE__ */ jsxDEV("h1", { children: title2 }),
    /* @__PURE__ */ jsxDEV("p", { class: "page-lead", children: lead })
  ] }),
  /* @__PURE__ */ jsxDEV("div", { class: "page-rule", "aria-hidden": "true" })
] }), "PageIntro");
var Arrow = /* @__PURE__ */ __name(() => /* @__PURE__ */ jsxDEV("span", { class: "arrow", "aria-hidden": "true", children: "\u2197" }), "Arrow");
var ArchiveCard = /* @__PURE__ */ __name(({ item, order }) => /* @__PURE__ */ jsxDEV("article", { class: "archive-card reveal", "data-type": item.type, children: [
  /* @__PURE__ */ jsxDEV("div", { class: "archive-meta", children: [
    /* @__PURE__ */ jsxDEV("span", { children: order ? String(order).padStart(2, "0") : item.year }),
    /* @__PURE__ */ jsxDEV("span", { children: item.type })
  ] }),
  /* @__PURE__ */ jsxDEV("div", { class: "archive-copy", children: [
    /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: item.eyebrow }),
    /* @__PURE__ */ jsxDEV("h3", { children: /* @__PURE__ */ jsxDEV("a", { href: `/arquivo/${item.slug}`, children: item.title }) }),
    /* @__PURE__ */ jsxDEV("p", { children: item.summary }),
    /* @__PURE__ */ jsxDEV("div", { class: "tag-row", children: item.tags.slice(0, 3).map((tag) => /* @__PURE__ */ jsxDEV("span", { children: tag })) })
  ] }),
  /* @__PURE__ */ jsxDEV("a", { class: "card-arrow", href: `/arquivo/${item.slug}`, "aria-label": `Abrir ${item.title}`, children: "\u2197" })
] }), "ArchiveCard");
app.get("/", (c) => {
  const origin = new URL(c.req.url).origin;
  const featured = archive.filter((item) => item.featured);
  return c.html(
    /* @__PURE__ */ jsxDEV(
      Layout,
      {
        title: "Ius Gentium \u2014 Direito internacional em movimento",
        description: "Portal vivo do Grupo de Pesquisa em Direito Internacional da UFSC: arquivo, pesquisa, hist\xF3ria e circula\xE7\xE3o de ideias jur\xEDdicas.",
        path: "/",
        origin,
        children: [
          /* @__PURE__ */ jsxDEV("section", { class: "semester-callout", "aria-labelledby": "semester-title", children: /* @__PURE__ */ jsxDEV("div", { class: "semester-inner", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "semester-copy", children: [
              /* @__PURE__ */ jsxDEV("p", { class: "semester-kicker", children: [
                "Inscri\xE7\xF5es abertas ",
                /* @__PURE__ */ jsxDEV("span", { children: "36\xAA edi\xE7\xE3o \xB7 2026/2" })
              ] }),
              /* @__PURE__ */ jsxDEV("h2", { id: "semester-title", children: "Doutrinas militares no direito internacional" }),
              /* @__PURE__ */ jsxDEV("p", { class: "semester-details", children: [
                "Encontros h\xEDbridos \xB7 Aberto ao p\xFAblico \xB7 ",
                semesterPeriod
              ] })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "semester-actions", children: [
              /* @__PURE__ */ jsxDEV("a", { class: "button button-light", href: semesterRegistrationUrl, children: [
                "Inscreva-se na UFSC ",
                /* @__PURE__ */ jsxDEV(Arrow, {})
              ] }),
              /* @__PURE__ */ jsxDEV("a", { class: "semester-details-link", href: "/semestre-2026-2", children: "Conhe\xE7a o semestre e os encontros \u2192" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxDEV("section", { class: "hero", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "hero-plate", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "plate-ring plate-ring-one" }),
              /* @__PURE__ */ jsxDEV("span", { class: "plate-ring plate-ring-two" }),
              /* @__PURE__ */ jsxDEV("img", { src: "/logo-300.webp", width: "300", height: "300", alt: "" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "hero-copy", children: [
              /* @__PURE__ */ jsxDEV("p", { class: "hero-kicker", children: [
                /* @__PURE__ */ jsxDEV("span", { children: "Caderno 01" }),
                " Grupo de Pesquisa \xB7 UFSC"
              ] }),
              /* @__PURE__ */ jsxDEV("h1", { children: [
                /* @__PURE__ */ jsxDEV("span", { children: "Ius" }),
                " ",
                /* @__PURE__ */ jsxDEV("em", { children: "Gentium" })
              ] }),
              /* @__PURE__ */ jsxDEV("p", { class: "hero-thesis", children: [
                "O direito atravessa fronteiras.",
                /* @__PURE__ */ jsxDEV("br", {}),
                /* @__PURE__ */ jsxDEV("i", { children: "As ideias tamb\xE9m." })
              ] }),
              /* @__PURE__ */ jsxDEV("div", { class: "hero-actions", children: [
                /* @__PURE__ */ jsxDEV("a", { class: "button button-dark", href: "/arquivo", children: [
                  "Entrar no arquivo ",
                  /* @__PURE__ */ jsxDEV(Arrow, {})
                ] }),
                /* @__PURE__ */ jsxDEV("a", { class: "text-link", href: "/sobre", children: [
                  "Conhecer o grupo ",
                  /* @__PURE__ */ jsxDEV("span", { children: "\u2192" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxDEV("aside", { class: "hero-note", children: [
              /* @__PURE__ */ jsxDEV("span", { class: "note-index", children: "I" }),
              /* @__PURE__ */ jsxDEV("p", { children: "Investigando a hist\xF3ria para compreender as novas fronteiras do direito internacional." }),
              /* @__PURE__ */ jsxDEV("div", { "data-live-highlight": true, children: "Hist\xF3ria \xB7 circula\xE7\xE3o \xB7 institui\xE7\xF5es" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "hero-scroll", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsxDEV("span", {}),
              " Percorrer"
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "topic-ribbon", "aria-label": "Eixos do grupo", children: /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("span", { children: "Hist\xF3ria do Direito Internacional" }),
            /* @__PURE__ */ jsxDEV("b", { children: "\u2726" }),
            /* @__PURE__ */ jsxDEV("span", { children: "Circula\xE7\xE3o de Modelos Jur\xEDdicos" }),
            /* @__PURE__ */ jsxDEV("b", { children: "\u2726" }),
            /* @__PURE__ */ jsxDEV("span", { children: "Integra\xE7\xE3o Regional" }),
            /* @__PURE__ */ jsxDEV("b", { children: "\u2726" }),
            /* @__PURE__ */ jsxDEV("span", { children: "Jurisdi\xE7\xF5es Internacionais" }),
            /* @__PURE__ */ jsxDEV("b", { children: "\u2726" }),
            /* @__PURE__ */ jsxDEV("span", { children: "Hist\xF3ria do Direito Internacional" }),
            /* @__PURE__ */ jsxDEV("b", { children: "\u2726" })
          ] }) }),
          /* @__PURE__ */ jsxDEV("section", { class: "manifesto section-pad", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "section-index", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "01" }),
              /* @__PURE__ */ jsxDEV("p", { children: "Manifesto" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "manifesto-copy reveal", children: [
              /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Uma disciplina vista por dentro" }),
              /* @__PURE__ */ jsxDEV("h2", { children: [
                "N\xE3o estudamos apenas as normas. Investigamos os ",
                /* @__PURE__ */ jsxDEV("em", { children: "mundos" }),
                " que as tornam poss\xEDveis."
              ] })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "manifesto-notes reveal", children: [
              /* @__PURE__ */ jsxDEV("p", { children: "O Ius Gentium observa o direito internacional como uma cultura em movimento: feita de textos, tradu\xE7\xF5es, institui\xE7\xF5es, viagens, disputas e escolhas editoriais." }),
              /* @__PURE__ */ jsxDEV("p", { children: "Da longa dura\xE7\xE3o dos conceitos \xE0s urg\xEAncias do clima, a pesquisa conecta hist\xF3ria e presente para formular perguntas mais precisas sobre a ordem internacional." }),
              /* @__PURE__ */ jsxDEV("a", { class: "text-link", href: "/pesquisa", children: [
                "Ver linhas de pesquisa ",
                /* @__PURE__ */ jsxDEV("span", { children: "\u2192" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("section", { class: "atlas-section section-pad section-ink", id: "rede", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "section-index section-index-light", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "02" }),
              /* @__PURE__ */ jsxDEV("p", { children: "Cartografia" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "atlas-heading", children: [
              /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Rede transatl\xE2ntica" }),
              /* @__PURE__ */ jsxDEV("h2", { children: [
                "Ideias t\xEAm",
                /* @__PURE__ */ jsxDEV("br", {}),
                /* @__PURE__ */ jsxDEV("em", { children: "itiner\xE1rios." })
              ] }),
              /* @__PURE__ */ jsxDEV("p", { children: "Toque em uma cidade para percorrer a rede de forma\xE7\xE3o, pesquisa e circula\xE7\xE3o do grupo." })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "atlas", "data-atlas": true, children: [
              /* @__PURE__ */ jsxDEV("div", { class: "atlas-orbit", "aria-hidden": "true", children: [
                /* @__PURE__ */ jsxDEV("span", {}),
                /* @__PURE__ */ jsxDEV("span", {}),
                /* @__PURE__ */ jsxDEV("span", {})
              ] }),
              /* @__PURE__ */ jsxDEV("div", { class: "atlas-nodes", role: "list", "aria-label": "Cidades da rede acad\xEAmica", children: network.map((node, index) => /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  class: `atlas-node node-${index + 1}`,
                  "data-atlas-node": true,
                  "data-city": node.city,
                  "data-country": node.country,
                  "data-institution": node.institution,
                  "data-relation": node.relation,
                  "data-period": node.period,
                  "aria-pressed": index === 0 ? "true" : "false",
                  children: [
                    /* @__PURE__ */ jsxDEV("i", {}),
                    /* @__PURE__ */ jsxDEV("span", { children: node.city })
                  ]
                }
              )) }),
              /* @__PURE__ */ jsxDEV("div", { class: "atlas-detail", "data-atlas-detail": true, "aria-live": "polite", children: [
                /* @__PURE__ */ jsxDEV("span", { children: "Brasil \xB7 presente" }),
                /* @__PURE__ */ jsxDEV("h3", { children: "Florian\xF3polis" }),
                /* @__PURE__ */ jsxDEV("p", { children: "Universidade Federal de Santa Catarina" }),
                /* @__PURE__ */ jsxDEV("small", { children: "Sede do grupo e eixo de forma\xE7\xE3o" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("section", { class: "research-preview section-pad", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "section-index", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "03" }),
              /* @__PURE__ */ jsxDEV("p", { children: "Investiga\xE7\xF5es" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "section-heading reveal", children: [
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Seis linhas, uma constela\xE7\xE3o" }),
                /* @__PURE__ */ jsxDEV("h2", { children: [
                  "Quest\xF5es que",
                  /* @__PURE__ */ jsxDEV("br", {}),
                  /* @__PURE__ */ jsxDEV("em", { children: "movem a pesquisa" })
                ] })
              ] }),
              /* @__PURE__ */ jsxDEV("a", { class: "round-link", href: "/pesquisa", "aria-label": "Ver todas as linhas de pesquisa", children: [
                "Ver todas ",
                /* @__PURE__ */ jsxDEV("span", { children: "\u2197" })
              ] })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "research-stack", children: researchLines.slice(0, 4).map((line) => /* @__PURE__ */ jsxDEV("a", { class: "research-row reveal", href: `/pesquisa#linha-${line.number}`, children: [
              /* @__PURE__ */ jsxDEV("span", { children: line.number }),
              /* @__PURE__ */ jsxDEV("h3", { children: line.title }),
              /* @__PURE__ */ jsxDEV("p", { children: line.thesis }),
              /* @__PURE__ */ jsxDEV("b", { children: "\u2197" })
            ] })) })
          ] }),
          /* @__PURE__ */ jsxDEV("section", { class: "archive-preview section-pad section-warm", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "section-index", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "04" }),
              /* @__PURE__ */ jsxDEV("p", { children: "Arquivo vivo" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "section-heading reveal", children: [
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Documentos em contexto" }),
                /* @__PURE__ */ jsxDEV("h2", { children: [
                  "O passado n\xE3o est\xE1",
                  /* @__PURE__ */ jsxDEV("br", {}),
                  /* @__PURE__ */ jsxDEV("em", { children: "encerrado." })
                ] })
              ] }),
              /* @__PURE__ */ jsxDEV("p", { class: "section-aside", children: "Publica\xE7\xF5es, eventos, tradu\xE7\xF5es e vest\xEDgios institucionais transformados em percursos de leitura." })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "featured-archive", children: featured.map((item, index) => /* @__PURE__ */ jsxDEV(ArchiveCard, { item, order: index + 1 })) }),
            /* @__PURE__ */ jsxDEV("a", { class: "button button-outline", href: "/arquivo", children: [
              "Explorar todo o arquivo ",
              /* @__PURE__ */ jsxDEV("span", { children: "\u2192" })
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("section", { class: "coordinator-preview section-pad", children: [
            /* @__PURE__ */ jsxDEV("div", { class: "section-index", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "05" }),
              /* @__PURE__ */ jsxDEV("p", { children: "Coordena\xE7\xE3o" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "monogram-panel reveal", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "A" }),
              /* @__PURE__ */ jsxDEV("span", { children: "D" }),
              /* @__PURE__ */ jsxDEV("span", { children: "R" }),
              /* @__PURE__ */ jsxDEV("img", { src: "/logo-300.webp", width: "220", height: "220", alt: "" })
            ] }),
            /* @__PURE__ */ jsxDEV("div", { class: "coordinator-copy reveal", children: [
              /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Professor Titular \xB7 UFSC" }),
              /* @__PURE__ */ jsxDEV("h2", { children: [
                "Arno",
                /* @__PURE__ */ jsxDEV("br", {}),
                "Dal Ri ",
                /* @__PURE__ */ jsxDEV("em", { children: "J\xFAnior" })
              ] }),
              /* @__PURE__ */ jsxDEV("p", { children: "Teoria e hist\xF3ria do direito internacional, circula\xE7\xE3o de modelos jur\xEDdicos e forma\xE7\xE3o de pesquisadores em uma trajet\xF3ria constru\xEDda entre Brasil, It\xE1lia, Fran\xE7a e B\xE9lgica." }),
              /* @__PURE__ */ jsxDEV("div", { class: "coordinator-facts", children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "2024\u201325" }),
                  /* @__PURE__ */ jsxDEV("p", { children: [
                    "Sarton medallist",
                    /* @__PURE__ */ jsxDEV("br", {}),
                    "Universiteit Gent"
                  ] })
                ] }),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "2026" }),
                  /* @__PURE__ */ jsxDEV("p", { children: [
                    "Semin\xE1rios no IREDIES",
                    /* @__PURE__ */ jsxDEV("br", {}),
                    "Paris 1 Panth\xE9on-Sorbonne"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxDEV("a", { class: "text-link", href: "/coordenador", children: [
                "Ler perfil intelectual ",
                /* @__PURE__ */ jsxDEV("span", { children: "\u2192" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("section", { class: "library-callout", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Biblioteca de campo" }),
              /* @__PURE__ */ jsxDEV("h2", { children: [
                "Uma mesa de trabalho",
                /* @__PURE__ */ jsxDEV("br", {}),
                "aberta ao mundo."
              ] })
            ] }),
            /* @__PURE__ */ jsxDEV("p", { children: "Fontes prim\xE1rias, jurisprud\xEAncia, livros raros, arquivos e bases acad\xEAmicas selecionados para pesquisa em direito internacional." }),
            /* @__PURE__ */ jsxDEV("a", { class: "button button-light", href: "/biblioteca", children: [
              "Abrir biblioteca ",
              /* @__PURE__ */ jsxDEV(Arrow, {})
            ] })
          ] })
        ]
      }
    )
  );
});
app.get("/sobre", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "O grupo \u2014 Ius Gentium", description: "Hist\xF3ria, miss\xE3o e m\xE9todo do Grupo de Pesquisa Ius Gentium da UFSC.", path: "/sobre", origin, children: [
      /* @__PURE__ */ jsxDEV(PageIntro, { index: "01", eyebrow: "O grupo", title: "Uma hist\xF3ria feita de circula\xE7\xE3o", lead: "O Ius Gentium conecta hist\xF3ria, teoria e experi\xEAncia institucional para investigar como o direito internacional ganha forma \u2014 e como pode ser transformado." }),
      /* @__PURE__ */ jsxDEV("section", { class: "prose-grid section-pad", children: [
        /* @__PURE__ */ jsxDEV("aside", { class: "margin-note", children: [
          /* @__PURE__ */ jsxDEV("span", { children: "Desde" }),
          /* @__PURE__ */ jsxDEV("strong", { children: [
            "UFSC",
            /* @__PURE__ */ jsxDEV("br", {}),
            "CNPq"
          ] }),
          /* @__PURE__ */ jsxDEV("p", { children: "Pesquisa, tradu\xE7\xE3o, publica\xE7\xE3o e forma\xE7\xE3o." })
        ] }),
        /* @__PURE__ */ jsxDEV("article", { class: "editorial-prose reveal", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "dropcap", children: "Vinculado \xE0 Universidade Federal de Santa Catarina, o Ius Gentium constituiu ao longo de sua trajet\xF3ria um espa\xE7o de leitura coletiva, forma\xE7\xE3o de pesquisadores e produ\xE7\xE3o editorial em direito internacional." }),
          /* @__PURE__ */ jsxDEV("p", { children: "Seu m\xE9todo come\xE7a por uma desconfian\xE7a produtiva: nenhuma categoria jur\xEDdica \xE9 natural, nenhum modelo viaja intacto, nenhuma institui\xE7\xE3o existe fora de sua hist\xF3ria. Por isso, o grupo combina fontes, conceitos, biografias, tradu\xE7\xF5es e arquivos." }),
          /* @__PURE__ */ jsxDEV("blockquote", { children: "\u201CInvestigar a hist\xF3ria para compreender as novas fronteiras do direito internacional.\u201D" }),
          /* @__PURE__ */ jsxDEV("p", { children: "Essa perspectiva torna poss\xEDvel aproximar problemas que frequentemente aparecem separados: soberania e moeda, guerra e tradu\xE7\xE3o, jurisdi\xE7\xE3o e circula\xE7\xE3o, integra\xE7\xE3o regional e crise clim\xE1tica." })
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("section", { class: "method-section section-pad section-warm", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "section-heading", children: /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "M\xE9todo em tr\xEAs movimentos" }),
          /* @__PURE__ */ jsxDEV("h2", { children: [
            "Encontrar.",
            /* @__PURE__ */ jsxDEV("br", {}),
            /* @__PURE__ */ jsxDEV("em", { children: "Contextualizar." }),
            /* @__PURE__ */ jsxDEV("br", {}),
            "Fazer circular."
          ] })
        ] }) }),
        /* @__PURE__ */ jsxDEV("div", { class: "method-grid", children: [
          /* @__PURE__ */ jsxDEV("article", { children: [
            /* @__PURE__ */ jsxDEV("span", { children: "01" }),
            /* @__PURE__ */ jsxDEV("h3", { children: "Encontrar" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Voltar \xE0s fontes, \xE0s edi\xE7\xF5es, aos programas, \xE0s correspond\xEAncias e aos vest\xEDgios que tornam uma hip\xF3tese demonstr\xE1vel." })
          ] }),
          /* @__PURE__ */ jsxDEV("article", { children: [
            /* @__PURE__ */ jsxDEV("span", { children: "02" }),
            /* @__PURE__ */ jsxDEV("h3", { children: "Contextualizar" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Reconstruir institui\xE7\xF5es, l\xE9xicos e conflitos para evitar que categorias do presente sejam projetadas sobre o passado." })
          ] }),
          /* @__PURE__ */ jsxDEV("article", { children: [
            /* @__PURE__ */ jsxDEV("span", { children: "03" }),
            /* @__PURE__ */ jsxDEV("h3", { children: "Fazer circular" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Traduzir, editar, ensinar e publicar: a pesquisa se completa quando reencontra uma comunidade de leitores." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("section", { class: "source-note section-pad", children: [
        /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "V\xEDnculo institucional" }),
        /* @__PURE__ */ jsxDEV("h2", { children: "Grupo de Pesquisa em Direito Internacional \xB7 PPGD/UFSC" }),
        /* @__PURE__ */ jsxDEV("p", { children: "O cadastro institucional do Programa de P\xF3s-Gradua\xE7\xE3o em Direito registra o Ius Gentium entre seus grupos de pesquisa." }),
        /* @__PURE__ */ jsxDEV("a", { class: "text-link", href: "https://ppgd.ufsc.br/grupos-de-pesquisa/", target: "_blank", rel: "noopener noreferrer", children: [
          "Consultar fonte institucional ",
          /* @__PURE__ */ jsxDEV(Arrow, {})
        ] })
      ] })
    ] })
  );
});
app.get("/pesquisa", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "Pesquisa \u2014 Ius Gentium", description: "Linhas e perguntas de pesquisa do Ius Gentium em direito internacional.", path: "/pesquisa", origin, children: [
      /* @__PURE__ */ jsxDEV(PageIntro, { index: "02", eyebrow: "Pesquisa", title: "Uma constela\xE7\xE3o de problemas", lead: "As linhas n\xE3o funcionam como compartimentos. Cada uma oferece um ponto de observa\xE7\xE3o para acompanhar conceitos, institui\xE7\xF5es e conflitos em movimento." }),
      /* @__PURE__ */ jsxDEV("section", { class: "lines-index section-pad", children: researchLines.map((line) => /* @__PURE__ */ jsxDEV("article", { class: "line-dossier reveal", id: `linha-${line.number}`, children: [
        /* @__PURE__ */ jsxDEV("div", { class: "line-number", children: line.number }),
        /* @__PURE__ */ jsxDEV("div", { class: "line-title", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Eixo de pesquisa" }),
          /* @__PURE__ */ jsxDEV("h2", { children: line.title }),
          /* @__PURE__ */ jsxDEV("div", { class: "tag-row", children: line.tags.map((tag) => /* @__PURE__ */ jsxDEV("span", { children: tag })) })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "line-thesis", children: /* @__PURE__ */ jsxDEV("p", { children: line.thesis }) }),
        /* @__PURE__ */ jsxDEV("ol", { class: "line-questions", children: line.questions.map((question) => /* @__PURE__ */ jsxDEV("li", { children: question })) })
      ] })) }),
      /* @__PURE__ */ jsxDEV("section", { class: "research-cta section-ink", children: [
        /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Do problema ao documento" }),
        /* @__PURE__ */ jsxDEV("h2", { children: "Veja como essas perguntas aparecem em publica\xE7\xF5es, eventos e fontes do grupo." }),
        /* @__PURE__ */ jsxDEV("a", { class: "button button-light", href: "/arquivo", children: [
          "Percorrer arquivo ",
          /* @__PURE__ */ jsxDEV(Arrow, {})
        ] })
      ] })
    ] })
  );
});
app.get("/arquivo", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "Arquivo vivo \u2014 Ius Gentium", description: "Arquivo pesquis\xE1vel de publica\xE7\xF5es, eventos, tradu\xE7\xF5es e mem\xF3rias do Ius Gentium.", path: "/arquivo", origin, children: [
      /* @__PURE__ */ jsxDEV(PageIntro, { index: "03", eyebrow: "Arquivo vivo", title: "Documentos que continuam a perguntar", lead: "O arquivo n\xE3o \xE9 dep\xF3sito. \xC9 uma m\xE1quina de rela\xE7\xF5es: aproxima tempos, temas e lugares para produzir novos percursos de pesquisa." }),
      /* @__PURE__ */ jsxDEV("section", { class: "archive-controls", "aria-label": "Filtros do arquivo", children: [
        /* @__PURE__ */ jsxDEV("label", { children: [
          /* @__PURE__ */ jsxDEV("span", { class: "sr-only", children: "Buscar no arquivo" }),
          /* @__PURE__ */ jsxDEV("span", { children: "\u2315" }),
          /* @__PURE__ */ jsxDEV("input", { type: "search", placeholder: "Filtrar por tema, lugar, t\xEDtulo\u2026", "data-archive-query": true })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "filter-pills", "data-archive-filters": true, children: [
          /* @__PURE__ */ jsxDEV("button", { type: "button", "aria-pressed": "true", "data-filter": "", children: "Todos" }),
          /* @__PURE__ */ jsxDEV("button", { type: "button", "aria-pressed": "false", "data-filter": "publica\xE7\xE3o", children: "Publica\xE7\xF5es" }),
          /* @__PURE__ */ jsxDEV("button", { type: "button", "aria-pressed": "false", "data-filter": "evento", children: "Eventos" }),
          /* @__PURE__ */ jsxDEV("button", { type: "button", "aria-pressed": "false", "data-filter": "cole\xE7\xE3o", children: "Cole\xE7\xE3o" }),
          /* @__PURE__ */ jsxDEV("button", { type: "button", "aria-pressed": "false", "data-filter": "mem\xF3ria", children: "Mem\xF3ria" })
        ] }),
        /* @__PURE__ */ jsxDEV("p", { children: [
          /* @__PURE__ */ jsxDEV("span", { "data-archive-count": true, children: archive.length }),
          " registros"
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("section", { class: "archive-list section-pad", "data-archive-results": true, "aria-live": "polite", children: archive.map((item, index) => /* @__PURE__ */ jsxDEV(ArchiveCard, { item, order: index + 1 })) })
    ] })
  );
});
app.get("/arquivo/:slug", (c) => {
  const item = archive.find((entry) => entry.slug === c.req.param("slug"));
  if (!item) return c.notFound();
  const origin = new URL(c.req.url).origin;
  const related = archive.filter((entry) => entry.slug !== item.slug && entry.tags.some((tag) => item.tags.includes(tag))).slice(0, 2);
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: `${item.title} \u2014 Ius Gentium`, description: item.summary, path: `/arquivo/${item.slug}`, origin, children: [
      /* @__PURE__ */ jsxDEV("article", { class: "dossier", children: [
        /* @__PURE__ */ jsxDEV("header", { class: "dossier-header", children: [
          /* @__PURE__ */ jsxDEV("a", { class: "back-link", href: "/arquivo", children: "\u2190 Voltar ao arquivo" }),
          /* @__PURE__ */ jsxDEV("div", { class: "dossier-code", children: [
            "IG / ",
            item.year,
            " / ",
            item.type.slice(0, 3).toUpperCase()
          ] }),
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: item.eyebrow }),
          /* @__PURE__ */ jsxDEV("h1", { children: item.title }),
          /* @__PURE__ */ jsxDEV("p", { class: "dossier-summary", children: item.summary }),
          /* @__PURE__ */ jsxDEV("div", { class: "tag-row", children: item.tags.map((tag) => /* @__PURE__ */ jsxDEV("span", { children: tag })) })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "dossier-body section-pad", children: [
          /* @__PURE__ */ jsxDEV("aside", { children: [
            /* @__PURE__ */ jsxDEV("span", { class: "dossier-year", children: item.year }),
            /* @__PURE__ */ jsxDEV("p", { children: item.type })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "editorial-prose", children: item.body.map((paragraph, index) => /* @__PURE__ */ jsxDEV("p", { class: index === 0 ? "dropcap" : "", children: paragraph })) }),
          /* @__PURE__ */ jsxDEV("div", { class: "source-card", children: [
            /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Fonte prim\xE1ria" }),
            /* @__PURE__ */ jsxDEV("h2", { children: item.sourceLabel }),
            /* @__PURE__ */ jsxDEV("p", { children: "Consulte o registro de origem para contexto documental e informa\xE7\xF5es institucionais." }),
            /* @__PURE__ */ jsxDEV("a", { href: item.sourceUrl, target: "_blank", rel: "noopener noreferrer", children: [
              "Abrir fonte ",
              /* @__PURE__ */ jsxDEV(Arrow, {})
            ] })
          ] })
        ] })
      ] }),
      related.length > 0 && /* @__PURE__ */ jsxDEV("section", { class: "related section-warm section-pad", children: [
        /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Continuar o percurso" }),
        /* @__PURE__ */ jsxDEV("div", { children: related.map((entry) => /* @__PURE__ */ jsxDEV(ArchiveCard, { item: entry })) })
      ] })
    ] })
  );
});
app.get("/biblioteca", (c) => {
  const origin = new URL(c.req.url).origin;
  const families = [...new Set(library.map((item) => item.family))];
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "Biblioteca de campo \u2014 Ius Gentium", description: "Recursos acad\xEAmicos selecionados para pesquisa em direito internacional.", path: "/biblioteca", origin, children: [
      /* @__PURE__ */ jsxDEV(PageIntro, { index: "04", eyebrow: "Biblioteca de campo", title: "Onde a pesquisa come\xE7a", lead: "Uma sele\xE7\xE3o naveg\xE1vel de fontes, arquivos, jurisprud\xEAncia e instrumentos de descoberta \u2014 organizada para reduzir a dist\xE2ncia entre uma pergunta e seu documento." }),
      /* @__PURE__ */ jsxDEV("section", { class: "library-shell section-pad", "data-library": true, children: [
        /* @__PURE__ */ jsxDEV("aside", { class: "library-sidebar", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Cole\xE7\xF5es" }),
          /* @__PURE__ */ jsxDEV("button", { type: "button", "aria-pressed": "true", "data-library-filter": "", children: "Todas" }),
          families.map((family) => /* @__PURE__ */ jsxDEV("button", { type: "button", "aria-pressed": "false", "data-library-filter": family, children: family })),
          /* @__PURE__ */ jsxDEV("div", { class: "library-count", children: [
            /* @__PURE__ */ jsxDEV("strong", { children: library.length }),
            /* @__PURE__ */ jsxDEV("span", { children: [
              "recursos",
              /* @__PURE__ */ jsxDEV("br", {}),
              "selecionados"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "library-main", children: [
          /* @__PURE__ */ jsxDEV("label", { class: "library-search", children: [
            /* @__PURE__ */ jsxDEV("span", { children: "\u2315" }),
            /* @__PURE__ */ jsxDEV("input", { type: "search", "data-library-query": true, placeholder: "Buscar fonte, tema ou institui\xE7\xE3o\u2026" }),
            /* @__PURE__ */ jsxDEV("span", { class: "sr-only", children: "Buscar na biblioteca" })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "library-grid", "data-library-results": true, children: library.map((resource, index) => /* @__PURE__ */ jsxDEV("article", { class: "resource-card reveal", "data-family": resource.family, "data-search": `${resource.title} ${resource.description} ${resource.tags.join(" ")}`.toLowerCase(), children: [
            /* @__PURE__ */ jsxDEV("div", { class: "resource-top", children: [
              /* @__PURE__ */ jsxDEV("span", { children: String(index + 1).padStart(2, "0") }),
              /* @__PURE__ */ jsxDEV("span", { children: resource.access })
            ] }),
            /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: resource.family }),
            /* @__PURE__ */ jsxDEV("h2", { children: resource.title }),
            /* @__PURE__ */ jsxDEV("p", { children: resource.description }),
            /* @__PURE__ */ jsxDEV("div", { class: "tag-row", children: resource.tags.map((tag) => /* @__PURE__ */ jsxDEV("span", { children: tag })) }),
            /* @__PURE__ */ jsxDEV("a", { href: resource.url, target: "_blank", rel: "noopener noreferrer", "aria-label": `Abrir ${resource.title}`, children: /* @__PURE__ */ jsxDEV(Arrow, {}) })
          ] })) }),
          /* @__PURE__ */ jsxDEV("p", { class: "empty-state", "data-library-empty": true, hidden: true, children: "Nenhum recurso corresponde a esse percurso." })
        ] })
      ] })
    ] })
  );
});
app.get("/anuncios", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "An\xFAncios \u2014 Ius Gentium", description: "Editais, avisos e comunicados oficiais do Grupo de Pesquisa Ius Gentium da UFSC.", path: "/anuncios", origin, children: [
      /* @__PURE__ */ jsxDEV(PageIntro, { index: "06", eyebrow: "Comunicados", title: "An\xFAncios", lead: "Editais, chamadas e avisos oficiais do grupo \u2014 processos seletivos e agenda p\xFAblica em um s\xF3 lugar." }),
      /* @__PURE__ */ jsxDEV("section", { class: "section-pad", children: /* @__PURE__ */ jsxDEV("article", { class: "dossier", children: [
        /* @__PURE__ */ jsxDEV("header", { class: "dossier-header", children: [
          /* @__PURE__ */ jsxDEV("div", { class: "dossier-code", children: "IG / 2026 / EDITAL" }),
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Edital \xB7 inscri\xE7\xF5es de 24 a 26 de agosto de 2026" }),
          /* @__PURE__ */ jsxDEV("h1", { children: "Sele\xE7\xE3o de Bolsista de Inicia\xE7\xE3o Cient\xEDfica 2026/2027 (PIBIC)" }),
          /* @__PURE__ */ jsxDEV("p", { class: "dossier-summary", children: "Aberto processo seletivo para 1 (uma) vaga de bolsista de inicia\xE7\xE3o cient\xEDfica (ampla concorr\xEAncia), com bolsa mensal de R$ 700,00 e dedica\xE7\xE3o de 20 horas semanais, no per\xEDodo de setembro de 2026 a agosto de 2027." }),
          /* @__PURE__ */ jsxDEV("div", { class: "tag-row", children: [
            /* @__PURE__ */ jsxDEV("span", { children: "PIBIC" }),
            /* @__PURE__ */ jsxDEV("span", { children: "Inicia\xE7\xE3o cient\xEDfica" }),
            /* @__PURE__ */ jsxDEV("span", { children: "UFSC \xB7 CCJ" })
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "dossier-body section-pad", children: [
          /* @__PURE__ */ jsxDEV("aside", { children: [
            /* @__PURE__ */ jsxDEV("span", { class: "dossier-year", children: "2026" }),
            /* @__PURE__ */ jsxDEV("p", { children: "edital" })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "editorial-prose", children: [
            /* @__PURE__ */ jsxDEV("p", { class: "dropcap", children: "O Grupo de Pesquisa Ius Gentium, sob coordena\xE7\xE3o do Prof. Arno Dal Ri Jr., seleciona bolsista de inicia\xE7\xE3o cient\xEDfica para atuar em pesquisa em direito internacional, com dedica\xE7\xE3o de 20 horas semanais entre setembro de 2026 e agosto de 2027." }),
            /* @__PURE__ */ jsxDEV("p", { children: [
              /* @__PURE__ */ jsxDEV("strong", { children: "Inscri\xE7\xF5es:" }),
              " 24 a 26 de agosto de 2026, pelo formul\xE1rio on-line, com hist\xF3rico escolar, espelho de matr\xEDcula e Curr\xEDculo Lattes."
            ] }),
            /* @__PURE__ */ jsxDEV("p", { children: [
              /* @__PURE__ */ jsxDEV("strong", { children: "Sele\xE7\xE3o:" }),
              " 28 de agosto de 2026, a partir das 9h, na sala 313 do CCJ/UFSC (entrevista e an\xE1lise de material)."
            ] }),
            /* @__PURE__ */ jsxDEV("p", { children: [
              /* @__PURE__ */ jsxDEV("strong", { children: "Resultado final:" }),
              " 31 de agosto de 2026."
            ] }),
            /* @__PURE__ */ jsxDEV("p", { children: [
              /* @__PURE__ */ jsxDEV("strong", { children: "Requisitos:" }),
              " matr\xEDcula ativa em curso de gradua\xE7\xE3o da UFSC, sem previs\xE3o de conclus\xE3o durante a vig\xEAncia da bolsa, e aprova\xE7\xE3o nas disciplinas Teoria Pol\xEDtica, Hist\xF3ria do Direito e Direito Internacional."
            ] }),
            /* @__PURE__ */ jsxDEV("p", { style: "display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;", children: [
              /* @__PURE__ */ jsxDEV("a", { class: "button button-dark", href: "/editais/edital-pibic-2026-2027.pdf", target: "_blank", rel: "noopener noreferrer", children: "Baixar edital (PDF)" }),
              /* @__PURE__ */ jsxDEV("a", { class: "button button-outline", href: "https://forms.gle/pshJPGekoP4AZdDF6", target: "_blank", rel: "noopener noreferrer", children: "Formul\xE1rio de inscri\xE7\xE3o" })
            ] })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { class: "source-card", children: [
            /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Documento oficial" }),
            /* @__PURE__ */ jsxDEV("h2", { children: "Edital PIBIC 2026/2027" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Consulte o texto integral do edital para cronograma, documenta\xE7\xE3o e crit\xE9rios de sele\xE7\xE3o." }),
            /* @__PURE__ */ jsxDEV("a", { href: "/editais/edital-pibic-2026-2027.pdf", target: "_blank", rel: "noopener noreferrer", children: [
              "Abrir edital ",
              /* @__PURE__ */ jsxDEV(Arrow, {})
            ] })
          ] })
        ] })
      ] }) })
    ] })
  );
});
app.get("/coordenador", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "Arno Dal Ri J\xFAnior \u2014 Ius Gentium", description: "Perfil intelectual do coordenador do Ius Gentium, professor titular da UFSC.", path: "/coordenador", origin, children: [
      /* @__PURE__ */ jsxDEV("section", { class: "profile-hero", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "profile-monogram", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxDEV("span", { children: "ADR" }),
          /* @__PURE__ */ jsxDEV("img", { src: "/logo-300.webp", alt: "" })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "profile-title", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Coordena\xE7\xE3o \xB7 Professor Titular da UFSC" }),
          /* @__PURE__ */ jsxDEV("h1", { children: [
            "Arno",
            /* @__PURE__ */ jsxDEV("br", {}),
            "Dal Ri ",
            /* @__PURE__ */ jsxDEV("em", { children: "J\xFAnior" })
          ] }),
          /* @__PURE__ */ jsxDEV("p", { children: "Teoria e hist\xF3ria do direito internacional" })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "profile-caption", children: [
          /* @__PURE__ */ jsxDEV("span", { children: "Florian\xF3polis" }),
          /* @__PURE__ */ jsxDEV("span", { children: "Paris" }),
          /* @__PURE__ */ jsxDEV("span", { children: "Gante" }),
          /* @__PURE__ */ jsxDEV("span", { children: "Mil\xE3o" })
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("section", { class: "profile-body section-pad", children: [
        /* @__PURE__ */ jsxDEV("aside", { class: "profile-index", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Eixos" }),
          /* @__PURE__ */ jsxDEV("span", { children: "Hist\xF3ria" }),
          /* @__PURE__ */ jsxDEV("span", { children: "Circula\xE7\xE3o" }),
          /* @__PURE__ */ jsxDEV("span", { children: "Institui\xE7\xF5es" }),
          /* @__PURE__ */ jsxDEV("span", { children: "Tradu\xE7\xE3o" })
        ] }),
        /* @__PURE__ */ jsxDEV("article", { class: "editorial-prose reveal", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "dropcap", children: "Professor Titular de Teoria e Hist\xF3ria do Direito Internacional na Universidade Federal de Santa Catarina, Arno Dal Ri J\xFAnior coordena uma agenda que acompanha a forma\xE7\xE3o hist\xF3rica das categorias jur\xEDdicas e a circula\xE7\xE3o transatl\xE2ntica de modelos." }),
          /* @__PURE__ */ jsxDEV("p", { children: "Sua trajet\xF3ria acad\xEAmica conecta a UFSC a institui\xE7\xF5es europeias e se desdobra em pesquisa, orienta\xE7\xE3o, tradu\xE7\xE3o de cl\xE1ssicos e constru\xE7\xE3o de projetos editoriais." }),
          /* @__PURE__ */ jsxDEV("p", { children: "Em 2024\u20132025, integrou a rela\xE7\xE3o de Sarton medallists da Universiteit Gent. Em 2026, apresentou no IREDIES da Universit\xE9 Paris 1 Panth\xE9on-Sorbonne semin\xE1rios sobre circula\xE7\xE3o de modelos jur\xEDdicos franceses e sobre o impacto brasileiro da Conven\xE7\xE3o n.\xBA 169 da OIT." })
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("section", { class: "trajectory section-ink section-pad", children: [
        /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Trajet\xF3ria documentada" }),
        /* @__PURE__ */ jsxDEV("div", { class: "trajectory-list", children: [
          /* @__PURE__ */ jsxDEV("article", { children: [
            /* @__PURE__ */ jsxDEV("span", { children: "2004" }),
            /* @__PURE__ */ jsxDEV("h2", { children: "Hist\xF3ria do Direito Internacional" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Com\xE9rcio, moeda, cidadania e nacionalidade." })
          ] }),
          /* @__PURE__ */ jsxDEV("article", { children: [
            /* @__PURE__ */ jsxDEV("span", { children: "2004\u201310" }),
            /* @__PURE__ */ jsxDEV("h2", { children: "Cole\xE7\xE3o de cl\xE1ssicos" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Grotius, Gentili, Kelsen e outros textos estruturantes em l\xEDngua portuguesa." })
          ] }),
          /* @__PURE__ */ jsxDEV("article", { children: [
            /* @__PURE__ */ jsxDEV("span", { children: "2024\u201325" }),
            /* @__PURE__ */ jsxDEV("h2", { children: "Sarton medallist" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Reconhecimento da Sarton Chair, Universiteit Gent." })
          ] }),
          /* @__PURE__ */ jsxDEV("article", { children: [
            /* @__PURE__ */ jsxDEV("span", { children: "2026" }),
            /* @__PURE__ */ jsxDEV("h2", { children: "Semin\xE1rios IREDIES" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Circula\xE7\xE3o de modelos e recep\xE7\xE3o do direito internacional no Brasil." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("section", { class: "sources-grid section-pad", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Fontes verific\xE1veis" }),
          /* @__PURE__ */ jsxDEV("h2", { children: "O perfil conduz aos documentos." })
        ] }),
        /* @__PURE__ */ jsxDEV("a", { href: "https://sartonchair.ugent.be/en/sarton-medallists/past-medallists", target: "_blank", rel: "noopener noreferrer", children: [
          /* @__PURE__ */ jsxDEV("span", { children: "01" }),
          /* @__PURE__ */ jsxDEV("p", { children: "Sarton Chair \xB7 Past medallists" }),
          /* @__PURE__ */ jsxDEV(Arrow, {})
        ] }),
        /* @__PURE__ */ jsxDEV("a", { href: "https://iredies.pantheonsorbonne.fr/evenements-passes", target: "_blank", rel: "noopener noreferrer", children: [
          /* @__PURE__ */ jsxDEV("span", { children: "02" }),
          /* @__PURE__ */ jsxDEV("p", { children: "IREDIES \xB7 Semin\xE1rios e eventos" }),
          /* @__PURE__ */ jsxDEV(Arrow, {})
        ] }),
        /* @__PURE__ */ jsxDEV("a", { href: "http://lattes.cnpq.br/2020985889273319", target: "_blank", rel: "noopener noreferrer", children: [
          /* @__PURE__ */ jsxDEV("span", { children: "03" }),
          /* @__PURE__ */ jsxDEV("p", { children: "Curr\xEDculo Lattes" }),
          /* @__PURE__ */ jsxDEV(Arrow, {})
        ] })
      ] })
    ] })
  );
});
app.get("/contato", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "Contato \u2014 Ius Gentium", description: "Contato institucional com o Grupo de Pesquisa Ius Gentium da UFSC.", path: "/contato", origin, children: [
      /* @__PURE__ */ jsxDEV(PageIntro, { index: "05", eyebrow: "Correspond\xEAncia", title: "Toda pesquisa come\xE7a com uma conversa", lead: "Para informa\xE7\xF5es institucionais, atividades e acesso a materiais do grupo, escreva por e-mail." }),
      /* @__PURE__ */ jsxDEV("section", { class: "contact-sheet section-pad", children: [
        /* @__PURE__ */ jsxDEV("div", { class: "contact-primary", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "E-mail do grupo" }),
          /* @__PURE__ */ jsxDEV("a", { href: `mailto:${groupEmail}`, children: groupEmail }),
          /* @__PURE__ */ jsxDEV("p", { children: "Ao escrever, indique no assunto o tema da mensagem: pesquisa, acervo, atividade ou coopera\xE7\xE3o." })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "contact-place", children: [
          /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Sede acad\xEAmica" }),
          /* @__PURE__ */ jsxDEV("h2", { children: "Centro de Ci\xEAncias Jur\xEDdicas" }),
          /* @__PURE__ */ jsxDEV("p", { children: [
            "Universidade Federal de Santa Catarina",
            /* @__PURE__ */ jsxDEV("br", {}),
            "Campus Universit\xE1rio Trindade",
            /* @__PURE__ */ jsxDEV("br", {}),
            "Florian\xF3polis \xB7 Santa Catarina \xB7 Brasil"
          ] }),
          /* @__PURE__ */ jsxDEV("a", { href: "https://ccj.ufsc.br/", target: "_blank", rel: "noopener noreferrer", children: [
            "Visitar CCJ/UFSC ",
            /* @__PURE__ */ jsxDEV(Arrow, {})
          ] })
        ] }),
        /* @__PURE__ */ jsxDEV("div", { class: "contact-code", "aria-hidden": "true", children: [
          "SC",
          /* @__PURE__ */ jsxDEV("br", {}),
          "27\xB0S",
          /* @__PURE__ */ jsxDEV("br", {}),
          "48\xB0W"
        ] })
      ] })
    ] })
  );
});
app.get("/api/archive", (c) => {
  const query = (c.req.query("q") || "").trim().toLocaleLowerCase("pt-BR");
  const type = (c.req.query("type") || "").trim().toLocaleLowerCase("pt-BR");
  const results = archive.filter((item) => {
    const haystack = [item.title, item.eyebrow, item.summary, item.type, item.year, ...item.tags].join(" ").toLocaleLowerCase("pt-BR");
    return (!query || haystack.includes(query)) && (!type || item.type === type);
  }).map(({ body: _body, ...item }) => item);
  c.header("Cache-Control", "public, max-age=60, s-maxage=300");
  return c.json({ query, type, count: results.length, results });
});
app.get("/api/highlight", (c) => {
  const day = Math.floor(Date.now() / 864e5);
  const item = archive[day % archive.length];
  c.header("Cache-Control", "public, max-age=300, s-maxage=3600");
  return c.json({ label: `${item.year} \xB7 ${item.type}`, title: item.title, href: `/arquivo/${item.slug}` });
});
app.get("/api/network", (c) => c.json({ count: network.length, nodes: network }));
var legacyRedirects = {
  "/index.html": "/",
  "/sobre.html": "/sobre",
  "/pessoas.html": "/coordenador",
  "/pesquisa.html": "/pesquisa",
  "/projetos.html": "/pesquisa",
  "/producao.html": "/arquivo",
  "/eventos.html": "/arquivo?type=evento",
  "/cooperacao.html": "/#rede",
  "/biblioteca.html": "/biblioteca",
  "/links.html": "/biblioteca",
  "/anuncios.html": "/anuncios",
  "/contato.html": "/contato",
  "/login.html": "/"
};
Object.entries(legacyRedirects).forEach(([from, to]) => app.get(from, (c) => c.redirect(to, 301)));
app.notFound((c) => {
  const origin = new URL(c.req.url).origin;
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "P\xE1gina n\xE3o encontrada \u2014 Ius Gentium", description: "O documento solicitado n\xE3o foi encontrado.", path: new URL(c.req.url).pathname, origin, children: /* @__PURE__ */ jsxDEV("section", { class: "not-found", children: [
      /* @__PURE__ */ jsxDEV("span", { children: "404" }),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { class: "micro-label", children: "Fora do arquivo" }),
        /* @__PURE__ */ jsxDEV("h1", { children: "Este documento ainda n\xE3o foi catalogado." }),
        /* @__PURE__ */ jsxDEV("a", { class: "button button-dark", href: "/arquivo", children: [
          "Voltar ao arquivo ",
          /* @__PURE__ */ jsxDEV("span", { children: "\u2192" })
        ] })
      ] })
    ] }) }),
    404
  );
});
app.onError((error, c) => {
  console.error(error);
  return c.text("O portal encontrou um erro tempor\xE1rio.", 500);
});
var index_default = app;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map

