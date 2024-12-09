import http from 'http';
import https from 'https';
import {URL} from 'url';
import fs from 'fs';
import xml2js from 'xml2js';
import querystring from 'querystring';
import FormData from 'form-data';

const HttpMethods = {
    Get: 'GET',
    Post: 'POST',
    Put: 'PUT',
    Patch: 'PATCH',
    Delete: 'DELETE'
};

const HttpContentTypes = {
    Json: 'application/json',
    Xml: 'application/xml',
    Form: 'application/x-www-form-urlencoded',
    FormData: 'multipart/form-data',
    Plain: 'text/plain',
    Html: 'text/html',
    Css: 'text/css',
    Javascript: 'application/javascript',
};

const AcceptTypes = {
    Json: 'application/json',
    Xml: 'application/xml',
    Plain: 'text/plain',
    Html: 'text/html',
    Css: 'text/css',
    Javascript: 'application/javascript',
    Steam: 'application/octet-stream',
    Any: '*/*',
};

class HttpClient {
    async constructor(url) {
        this.url = url;
        this.method = 'GET';
        this.headers = {};
        this.body = null;
        this.timeout = 0;
        this.cert = null;
        this.key = null;
        this.ca = null;
    }

    static new = async (url) => new HttpClient(url);

    static newPost = async (url) => (await HttpClient.new(url)).setMethod(HttpMethods.Post);

    static newPut = async (url) => (await HttpClient.new(url)).setMethod(HttpMethods.Put);

    static newPatch = async (url) => (await HttpClient.new(url)).setMethod(HttpMethods.Patch);

    static newDelete = async (url) => (await HttpClient.new(url)).setMethod(HttpMethods.Delete);

    async setCert(certPath, keyPath, caPath) {
        this.cert = fs.readFileSync(certPath);
        this.key = fs.readFileSync(keyPath);
        this.ca = fs.readFileSync(caPath);
        return this;
    }

    async setUrl(url) {
        this.url = url;
        return this;
    }

    async setMethod(method) {
        this.method = method;
        return this;
    };

    async addHeaders(headers) {
        this.headers = {...this.headers, ...headers};
        return this;
    }

    async setAuthorization(username, password, title) {
        this.headers['Authorization'] = `${title} ${Buffer.from(`${username}:${password}`).toString('base64')}`;
        return this;
    }

    async setHeaderContentType(key) {
        const value = await this.getHeaderContentType(key);
        if (value) {
            this.headers['Content-Type'] = value;
        }
        return this;
    }

    async getHeaderContentType(key) {
        return HttpContentTypes[key] || '';
    }

    async setHeaderAccept(key){
        const value = AcceptTypes[key];
        if (value) {
            this.headers['Accept'] = [value];
        }

        return this;
    }

    async getHeaderAccept(key){
        return AcceptTypes[key] || '';
    }

    async setBody(body) {
        this.body = body;
        return this;
    }

    async setJsonBody(body) {
        await this.setHeaderContentType(HttpContentTypes.Json);
        this.body = JSON.stringify(body);

        return this;
    }

    async setXmlBody() {
        await this.setHeaderContentType(HttpContentTypes.Xml);
        this.body = (xml2js.Builder()).buildObject(body);

        return this;
    }

    async setFormBody(body) {
        await this.setHeaderContentType(HttpContentTypes.Form);
        this.body = querystring.stringify(body);

        return this;
    }

    async setFormDataBody(texts, files) {
        await this.setHeaderContentType(HttpContentTypes.FormData);
        const form = new FormData();

        if (texts) {
            for (const [key, value] of Object.entries(texts)) {
                form.append(key, value);
            }
        }

        if (files) {
            for (const [key, filePath] of Object.entries(files)) {
                form.append(key, fs.createReadStream(filePath));
            }
        }

        this.body = form;

        return this;
    }

    async setPlainBody(body) {
        await this.setHeaderContentType(HttpContentTypes.Plain);
        this.body = Buffer.from(body, 'utf-8');

        return this;
    }

    async setCssBody(body) {
        await this.setHeaderContentType(HttpContentTypes.Css);
        this.body = Buffer.from(body, 'utf-8');

        return this;
    }

    async setJavascriptBody(body) {
        await this.setHeaderContentType(HttpContentTypes.Javascript);
        this.body = Buffer.from(body, 'utf-8');

        return this;
    }

    async setSteamBody(filename) {
        try {
            const file = fs.readFileSync(filename);
            const size = file.length;

            this.body = file;
            this.headers['Content-Length'] = size.toString();
        } catch (err) {
            this.err = err;
        }

        return this;
    }

    async setTimeout(timeout) {
        this.timeout = timeout;
        return this;
    }

    async send() {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(this.url);
            const options = {
                method: this.method,
                headers: this.headers,
                timeout: this.timeout,
                cert: this.cert,
                key: this.key,
                ca: this.ca,
            };

            const lib = urlObj.protocol === 'https:' ? https : http;
            const req = lib.request(urlObj, options, (res) => {
                let data = [];
                res.on('data', (chunk) => data.push(chunk));
                res.on('end', () => resolve(Buffer.concat(data)));
            });

            req.on('error', reject);

            if (this.body) {
                req.write(this.body);
            }

            req.end();
        });
    }
}