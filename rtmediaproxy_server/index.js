import { config } from "dotenv";

import fetch from "node-fetch";

import http from 'node:http';
import https from 'node:https';

import Keyv from "keyv";
import KeyvSqlite from '@keyv/sqlite';

import path from "path";

config();

const httpAgent = new http.Agent({
	keepAlive: true
});
const httpsAgent = new https.Agent({
	keepAlive: true
});

// https://github.com/node-fetch/node-fetch?tab=readme-ov-file#custom-agent
const defaultFetchConfig = {
    agent: function(_parsedURL) {
		if (_parsedURL.protocol == 'http:') {
			return httpAgent;
		} else {
			return httpsAgent;
		}
	}
};

const dbUrl = process.env.DB_URL || "sqlite://database.sqlite";
const roomDb = new Keyv({
    store: new KeyvSqlite(dbUrl),
    namespace: "room"
});
const keyDb = new Keyv({
    store: new KeyvSqlite(dbUrl),
    namespace: "key"
});
const channelDb = new Keyv({
    store: new KeyvSqlite(dbUrl),
    namespace: "channel"
});

import express from "express";
import basicAuth from "express-basic-auth"

const usersStr = (process.env.BASIC_AUTH_CONFIG || ":");
const users = Object.fromEntries(usersStr.split(",").map((item) => item.split(":")));
// console.log(users);

const basicAuthConfig = {
    users: users,
    challenge: true,
    realm: "RTMediaProxy Admin",
};

const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND_ROOT = process.env.FRONTEND_ROOT || path.join(process.cwd(), "../rtmediaproxy_frontend/dist");
const downstreamUrl = process.env.DOWNSTREAM_URL || "http://localhost:4000";

app.use(express.json());

const serveStatic = function(filePath)  {
    return function(req, res) {
        res.sendFile(path.join(FRONTEND_ROOT, filePath));
    };
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Record<string,string>} [headersOverride={}]
 */
async function proxyDownstream(req, res, headersOverride = {}){
    const path = req.originalUrl;

    const headers = {
        ...req.headers,
        ...headersOverride,
    }
    if(headers.host) delete headers.host; // remove host header to avoid conflicts
    if(headers.origin) delete headers.origin; // remove origin header
    console.log("computed",headers);
    // proxy
    console.log(downstreamUrl + path);
    const resp = await fetch(downstreamUrl + path, {
        ...defaultFetchConfig,
        method: req.method,
        headers: headers,
        body: req.body, // pipe/stream magic
    });

    res.status(resp.status);
    res.contentType(resp.headers.get("content-type") || "application/octet-stream"); // default to octet-stream if no content-type is set
    for (const [key, value] of resp.headers) {
        console.log(key, value);
        res.setHeader(key, value);
    }
    resp.body.pipe(res); // support stream stuff
}

async function proxyDownstreamWithPermissionCheck(req, res) {
    const authorization = req.headers.authorization;
    if(!authorization || !authorization.startsWith("Bearer ")) {
        res.status(401).send("Unauthorized (authorization format incorrect)");
        return;
    }
    const token = authorization.slice("Bearer ".length);
    const roomId =  await keyDb.get(token);
    if(!roomId) {
        console.log("Invalid bearer token", token);
        res.status(401).send("Unauthorized (invalid token)");
        return;
    }

    proxyDownstream(req, res, {
        "x-room-id": roomId,
        "authorization": `Bearer ${roomId}`
    });
}

// api routes
app.all("/api/whep", proxyDownstream);
app.all("/api/sse", proxyDownstream);
app.all("/api/sse/:unused", proxyDownstream);
app.all("/api/layer", proxyDownstream);
app.all("/api/layer/:unused", proxyDownstream);
app.all("/api/status", proxyDownstream);
// authed api routes
app.all("/api/whip", proxyDownstreamWithPermissionCheck);
// frontend
app.all("/assets/:unused", proxyDownstream);
app.all("/statistics", proxyDownstream);
app.all("/publish/:unused", proxyDownstream);


app.get("/", express.static(FRONTEND_ROOT));
app.get("/_astro", express.static(FRONTEND_ROOT));
app.get("/", serveStatic("index.html"));

app.get("/room/:unused", serveStatic("room/index.html"));

const adminRouter = new express.Router();
adminRouter.use(basicAuth(basicAuthConfig));
adminRouter.get("/", serveStatic("admin/index.html"));

adminRouter.post("/room", async (req, res) => {
    if(!req.body || !req.body.roomId || typeof req.body.roomId !== "string") {
        res.status(400).send("Bad Request (string roomId is required)");
        return;
    }
    const roomId = req.body.roomId;
    const roomExists = await roomDb.has(roomId);
    if(roomExists) {
        res.status(409).send("Conflict (room already exists)");
        return;
    }
    await roomDb.set(roomId, {
        channels: [],
        keys: [],
        desc: "No description provided",
        createdAt: new Date().toISOString(),
    });
    res.json({
        roomId: roomId,
        message: "Room created successfully."
    });
});

// basic auth

app.use("/admin", adminRouter);

// passthrough player as well for now
app.all("/:unused", proxyDownstream);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Configured downstream URL: ${downstreamUrl}`);
});
