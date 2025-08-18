import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import {open} from "sqlite";
import cors from "cors";
import fetch from "node-fetch";
import {nanoid} from "nanoid";
import {Dto} from "./dto";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let db: any;
const PORT = 4000;

// --- API CACHE ---
let cachedData: Dto[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat

async function getApiData() {
    const now = Date.now();
    if (cachedData.length && now - lastFetchTime < CACHE_DURATION) {
        return cachedData;
    }

    const res = await fetch("https://evccost.com/api.php");
    if (!res.ok) {
        console.error("API fetch hatası");
        return cachedData;
    }

    const apiData = await res.json() as any;
    if (apiData.success !== true) {
        return cachedData;
    }

    cachedData = apiData.data as Dto[];
    lastFetchTime = now;
    return cachedData;
}

// --- SQLite init ---
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
            visibility
            INTEGER
            DEFAULT
            1,
            created_at
            DATETIME
            DEFAULT
            CURRENT_TIMESTAMP
        )
    `);
}

// --- API endpointleri ---
app.get("/data", async (req, res) => {
    try {
        const {filter, sortBy, order} = req.query as any;

        let filtered = await getApiData();
        if (filter) {
            filtered = filtered.filter((d: any) =>
                d.name.toLowerCase().includes(filter.toLowerCase())
            );
        }

        if (sortBy) {
            filtered = filtered.sort((a: any, b: any) => {
                if (a[sortBy] < b[sortBy]) return order === "desc" ? 1 : -1;
                if (a[sortBy] > b[sortBy]) return order === "desc" ? -1 : 1;
                return 0;
            });
        }

        res.json(filtered);
    } catch (err: any) {
        res.status(500).json({error: err.message});
    }
});

app.post("/searches", async (req, res) => {
    const {criteria, visibility} = req.body;
    const shortId = nanoid(6);

    await db.run(
        "INSERT INTO searches (short_id, criteria, visibility) VALUES (?, ?, ?)",
        shortId,
        JSON.stringify(criteria),
        visibility ? 1 : 0
    );

    res.json({shortId});
});

app.get("/searches/:shortId", async (req, res) => {
    const row = await db.get(
        "SELECT * FROM searches WHERE short_id = ?",
        req.params.shortId
    );
    if (!row) return res.status(404).json({error: "Not found"});
    res.json({criteria: JSON.parse(row.criteria), visibility: row.visibility});
});

app.get("/searches", async (_req, res) => {
    const rows = await db.all("SELECT * FROM searches");
    res.json(rows.map((r: { criteria: string; }) => ({...r, criteria: JSON.parse(r.criteria)})));
});

// Sil
app.delete("/searches/:shortId", async (req, res) => {
    await db.run("DELETE FROM searches WHERE short_id = ?", [req.params.shortId]);
    res.json({ok: true});
});

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});
