import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import {open} from "sqlite";
import fetch from "node-fetch";
import {nanoid} from "nanoid";
import {PriceDto} from "./price-dto";
import {AppResponse} from "./app-response";
import path from "path";

const app = express();
app.use(bodyParser.json());

let db: any;
const PORT = process.env.PORT || 4000;

let cachedData: PriceDto[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function getApiData() {
    const now = Date.now();
    if (cachedData.length && now - lastFetchTime < CACHE_DURATION) {
        return cachedData.sort(() => Math.random() - 0.5);
    }

    console.info("Send Request to Remote API")
    const res = await fetch("https://evccost.com/api.php");
    if (!res.ok) {
        console.error("API fetch hatası");
        return cachedData.sort(() => Math.random() - 0.5);
    }

    const apiData = await res.json() as any;
    if (apiData.success !== true) {
        return cachedData.sort(() => Math.random() - 0.5);
    }

    cachedData = apiData.data.map((row: any) => {
        return {
            name: row.firma,
            ac: row.acFiyat,
            dc: row.dcFiyat,
        } as PriceDto
    });
    lastFetchTime = now;
    return cachedData.sort(() => Math.random() - 0.5);
}

async function initDb() {
    db = await open({
        filename: "./data.db",
        driver: sqlite3.Database,
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS searches
        (
            id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            short_id
            TEXT
            UNIQUE
            NOT
            NULL,
            criteria
            TEXT
            NOT
            NULL,
            sort_field
            TEXT
            NOT
            NULL,
            sort_order
            TEXT
            NOT
            NULL,
            price_min
            DOUBLE
            NOT
            NULL,
            price_max
            DOUBLE
            NOT
            NULL,
            socket
            TEXT
            NOT
            NULL,
            created_at
            DATETIME
            DEFAULT
            CURRENT_TIMESTAMP
        )
    `);
}


const router = express.Router();

router.get("/data", async (req, res) => {
    try {
        res.json(AppResponse.success(await getApiData()));
    } catch (err: any) {
        res.status(400).json(AppResponse.error(err.message));
    }
});

router.post("/searches", async (req, res) => {
    const {criteria, sortField, sortOrder, priceMin, priceMax, socket} = req.body;
    const shortId = nanoid(6);

    await db.run(
        "INSERT INTO searches (short_id, criteria, sort_field, sort_order, price_min, price_max, socket) VALUES (?, ?, ?, ?, ?, ?, ?)",
        shortId,
        JSON.stringify(criteria),
        sortField,
        sortOrder,
        priceMin,
        priceMax,
        socket
    );

    res.json(AppResponse.success(shortId));
});

router.get("/searches/:shortId", async (req, res) => {
    const row = await db.get(
        "SELECT * FROM searches WHERE short_id = ?",
        req.params.shortId
    );
    if (!row) return res.status(400).json(AppResponse.error("Not found"));

    res.json(AppResponse.success({
        criteria: JSON.parse(row.criteria),
        sortField: row.sort_field,
        sortOrder: row.sort_order,
        priceMin: row.price_min,
        priceMax: row.price_max,
        socket: row.socket,
    }));
});

app.use("/api", router);

app.use("/static", express.static(path.join(__dirname, "frontend/static")));

app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "frontend/index.html"));
});
app.get("/index.html", (_req, res) => {
    res.sendFile(path.join(__dirname, "frontend/index.html"));
});
app.get("/s/*", (_req, res) => {
    res.sendFile(path.join(__dirname, "frontend/index.html"));
});

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});
