import express, {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import {open} from "sqlite";
import fetch from "node-fetch";
import {nanoid} from "nanoid";
import bcrypt from "bcrypt";
import {PriceDto} from "./price-dto";
import {AppResponse} from "./app-response";
import process from 'process';
import path from "path";
import {Database} from "sqlite/build/Database";

// Custom request interface with user property
interface AuthRequest extends Request {
    user?: any;
}

const PORT = process.env.PORT || 4000;
const DB_FILE = process.env.DB_FILE || "./data.db";
const CACHE_DURATION = process.env.CACHE_DURATION ? parseInt(process.env.CACHE_DURATION) : 24 * 60 * 60 * 1000;
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_TOKEN;

const app = express();
app.use(bodyParser.json());

let db: Database;

async function initDb() {
    db = await open({
        filename: DB_FILE,
        driver: sqlite3.Database,
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS searches
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            short_id TEXT UNIQUE NOT NULL,
            name TEXT,
            criteria TEXT NOT NULL,
            sort_field TEXT NOT NULL,
            sort_order TEXT NOT NULL,
            price_min DOUBLE NOT NULL,
            price_max DOUBLE NOT NULL,
            socket TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS prices
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            ac_price DOUBLE,
            dc_price DOUBLE,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS admin_users
        (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create default admin user if not exists
    const existingAdmin = await db.get("SELECT * FROM admin_users WHERE username = 'admin'");
    if (!existingAdmin && ADMIN_DEFAULT_PASSWORD) {
        console.warn("Creating default admin user with password: " + ADMIN_DEFAULT_PASSWORD + " - Please change this in production!");
        const hashedPassword = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10);
        await db.run(
            "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
            "admin",
            hashedPassword
        );
    }
}

let cachedData: PriceDto[] = [];
let lastFetchTime = 0;

async function getApiData() {
    const now = Date.now();
    if (cachedData.length && now - lastFetchTime < CACHE_DURATION) {
        return cachedData;
    }

    try {
        const prices = await db.all("SELECT name, ac_price as ac, dc_price as dc FROM prices ORDER BY name");
        if (prices.length > 0) {
            cachedData = prices.map((row: any) => ({
                id: Math.round(Math.random() * 1000000),
                name: row.name,
                ac: row.ac,
                dc: row.dc,
            } as PriceDto));
            lastFetchTime = now;
            return cachedData;
        }
    } catch (error) {
        console.error("Database fetch hatası:", error);
    }

    // Return cached data if available, otherwise empty array
    return cachedData.length ? cachedData : [];
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
    const {name, criteria, sortField, sortOrder, priceMin, priceMax, socket} = req.body;
    const shortId = nanoid(8);

    await db.run(
        "INSERT INTO searches (short_id, name, criteria, sort_field, sort_order, price_min, price_max, socket) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        shortId,
        name,
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
        name: row.name,
        shortId: req.params.shortId,
        criteria: JSON.parse(row.criteria),
        sortField: row.sort_field,
        sortOrder: row.sort_order,
        priceMin: row.price_min,
        priceMax: row.price_max,
        socket: row.socket,
    }));
});

// Basic Authentication Middleware with database check
async function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
        return res.status(401).json(AppResponse.error("Authentication required"));
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
        return res.status(401).json(AppResponse.error("Invalid credentials format"));
    }

    try {
        const adminUser = await db.get("SELECT * FROM admin_users WHERE username = ?", username);
        if (!adminUser) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
            return res.status(401).json(AppResponse.error("Invalid credentials"));
        }

        const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);
        if (!isPasswordValid) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
            return res.status(401).json(AppResponse.error("Invalid credentials"));
        }

        req.user = {
            id: adminUser.id,
            username: adminUser.username,
            role: 'admin',
            authenticated: true,
            authMethod: 'basic'
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json(AppResponse.error("Authentication error"));
    }
}

// Admin routes
const adminRouter = express.Router();

// Auth check endpoint
adminRouter.get("/auth", authenticateAdmin, async (req: AuthRequest, res) => {
    res.json(AppResponse.success({
        authenticated: true,
        username: req.user?.username,
        role: req.user?.role
    }));
});

adminRouter.get("/prices", authenticateAdmin, async (req, res) => {
    try {
        const prices = await db.all("SELECT * FROM prices ORDER BY name");
        res.json(AppResponse.success(prices));
    } catch (err: any) {
        res.status(400).json(AppResponse.error(err.message));
    }
});

adminRouter.post("/prices", authenticateAdmin, async (req, res) => {
    const {name, acPrice, dcPrice} = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json(AppResponse.error("Firma adı boş olamaz"));
    }

    if (acPrice !== undefined && (isNaN(acPrice) || acPrice < 0)) {
        return res.status(400).json(AppResponse.error("AC fiyatı geçerli bir sayı olmalı"));
    }

    if (dcPrice !== undefined && (isNaN(dcPrice) || dcPrice < 0)) {
        return res.status(400).json(AppResponse.error("DC fiyatı geçerli bir sayı olmalı"));
    }

    try {
        await db.run(
            "INSERT INTO prices (name, ac_price, dc_price) VALUES (?, ?, ?)",
            name.trim(),
            acPrice || null,
            dcPrice || null
        );

        // Clear cache to force refresh
        cachedData = [];
        lastFetchTime = 0;

        res.json(AppResponse.success("Price created successfully"));
    } catch (err: any) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json(AppResponse.error("Bu firma adı zaten mevcut"));
        }
        res.status(400).json(AppResponse.error(err.message));
    }
});

adminRouter.put("/prices/:id", authenticateAdmin, async (req, res) => {
    const {id} = req.params;
    const {name, acPrice, dcPrice} = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json(AppResponse.error("Firma adı boş olamaz"));
    }

    if (acPrice !== undefined && (isNaN(acPrice) || acPrice < 0)) {
        return res.status(400).json(AppResponse.error("AC fiyatı geçerli bir sayı olmalı"));
    }

    if (dcPrice !== undefined && (isNaN(dcPrice) || dcPrice < 0)) {
        return res.status(400).json(AppResponse.error("DC fiyatı geçerli bir sayı olmalı"));
    }

    try {
        const result = await db.run(
            "UPDATE prices SET name = ?, ac_price = ?, dc_price = ? WHERE id = ?",
            name.trim(),
            acPrice || null,
            dcPrice || null,
            id
        );

        if (result.changes === 0) {
            return res.status(404).json(AppResponse.error("Fiyat kaydı bulunamadı"));
        }

        // Clear cache to force refresh
        cachedData = [];
        lastFetchTime = 0;

        res.json(AppResponse.success("Price updated successfully"));
    } catch (err: any) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json(AppResponse.error("Bu firma adı zaten mevcut"));
        }
        res.status(400).json(AppResponse.error(err.message));
    }
});

adminRouter.delete("/prices/:id", authenticateAdmin, async (req, res) => {
    const {id} = req.params;

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(AppResponse.error("Geçersiz ID"));
    }

    try {
        const result = await db.run("DELETE FROM prices WHERE id = ?", parseInt(id));

        if (result.changes === 0) {
            return res.status(404).json(AppResponse.error("Fiyat kaydı bulunamadı"));
        }

        // Clear cache to force refresh
        cachedData = [];
        lastFetchTime = 0;

        res.json(AppResponse.success("Price deleted successfully"));
    } catch (err: any) {
        res.status(400).json(AppResponse.error(err.message));
    }
});

// Import data from external source
adminRouter.post("/import", authenticateAdmin, async (req, res) => {
    const {source} = req.body;

    if (!source || typeof source !== 'string') {
        return res.status(400).json(AppResponse.error("URL belirtilmelidir"));
    }

    try {
        let importUrl;

        // Check if source is a full URL or a predefined source
        if (source.startsWith('http://') || source.startsWith('https://')) {
            importUrl = source.trim();
        } else {
            return res.status(400).json(AppResponse.error("Geçersiz URL formatı. http:// veya https:// ile başlamalıdır"));
        }

        // Validate URL format
        try {
            new URL(importUrl);
        } catch (urlError) {
            return res.status(400).json(AppResponse.error("Geçersiz URL formatı"));
        }

        console.info(`Importing data from: ${importUrl}`);
        const response = await fetch(importUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'EV-Charger-Search-Import/1.0',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            return res.status(400).json(AppResponse.error(`API isteği başarısız: ${response.status} - ${response.statusText}`));
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return res.status(400).json(AppResponse.error("API yanıtı JSON formatında değil"));
        }

        const apiData = await response.json() as any;
        if (apiData.success !== true) {
            return res.status(400).json(AppResponse.error("API yanıtı başarısız: " + (apiData.error || "Bilinmeyen hata")));
        }

        if (!Array.isArray(apiData.data) || apiData.data.length === 0) {
            return res.status(400).json(AppResponse.error("İçe aktarılacak veri bulunamadı"));
        }

        // Prepare import data with flexible field mapping
        const importData = apiData.data.map((item: any) => {
            return {
                name: item.firma || item.name || item.company || item.brand || '',
                ac_price: item.acFiyat || item.ac_price || item.ac || null,
                dc_price: item.dcFiyat || item.dc_price || item.dc || null
            };
        }).filter((item: any) => item.name && item.name.trim() !== '');

        if (importData.length === 0) {
            return res.status(400).json(AppResponse.error("Geçerli veri bulunamadı - tüm kayıtlarda firma adı eksik"));
        }

        // Get existing data for comparison
        const existingData = await db.all("SELECT * FROM prices ORDER BY name");
        const existingMap = new Map(existingData.map((item: any) => [item.name.toLowerCase(), item]));

        // Compare import data with existing data
        const comparisonData = importData.map((item: any) => {
            const existing = existingMap.get(item.name.toLowerCase());

            if (!existing) {
                // New item
                return {
                    name: item.name,
                    ac_price: item.ac_price,
                    dc_price: item.dc_price,
                    existing_ac: null,
                    existing_dc: null,
                    action: 'new',
                    changes: []
                };
            } else {
                // Compare prices
                const changes = [];
                let hasChanges = false;

                if (existing.ac_price !== item.ac_price) {
                    changes.push({
                        field: 'ac_price',
                        old: existing.ac_price,
                        new: item.ac_price
                    });
                    hasChanges = true;
                }

                if (existing.dc_price !== item.dc_price) {
                    changes.push({
                        field: 'dc_price',
                        old: existing.dc_price,
                        new: item.dc_price
                    });
                    hasChanges = true;
                }

                return {
                    name: item.name,
                    ac_price: item.ac_price,
                    dc_price: item.dc_price,
                    existing_ac: existing.ac_price,
                    existing_dc: existing.dc_price,
                    action: hasChanges ? 'update' : 'unchanged',
                    changes: changes
                };
            }
        });

        // Calculate statistics
        const stats = {
            total: comparisonData.length,
            new: comparisonData.filter((item: any) => item.action === 'new').length,
            update: comparisonData.filter((item: any) => item.action === 'update').length,
            unchanged: comparisonData.filter((item: any) => item.action === 'unchanged').length
        };

        res.json(AppResponse.success({
            source: importUrl,
            totalItems: importData.length,
            stats,
            preview: comparisonData,
            importData
        }));

    } catch (error: any) {
        console.error("Import error:", error);
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            res.status(400).json(AppResponse.error(`URL'e ulaşılamadı: ${source}`));
        } else if (error.type === 'invalid-json') {
            res.status(400).json(AppResponse.error("API yanıtı geçersiz JSON formatında"));
        } else {
            res.status(400).json(AppResponse.error(`İçe aktarma hatası: ${error.message}`));
        }
    }
});

// Confirm and execute import
adminRouter.post("/import/confirm", authenticateAdmin, async (req, res) => {
    const {importData, overwrite = false, selectedItems = []} = req.body;

    if (!Array.isArray(importData) || importData.length === 0) {
        return res.status(400).json(AppResponse.error("İçe aktarma verisi gerekli"));
    }

    // Filter items to process based on selection
    const itemsToProcess = selectedItems.length > 0
        ? importData.filter((item: any, index: number) => selectedItems.includes(index))
        : importData;

    if (itemsToProcess.length === 0) {
        return res.status(400).json(AppResponse.error("İşlenecek seçili öğe bulunamadı"));
    }

    try {
        let updatedCount = 0;
        let createdCount = 0;
        let skippedCount = 0;

        for (const item of itemsToProcess) {
            if (!item.name || item.name.trim() === '') {
                skippedCount++;
                continue;
            }

            const existingItem = await db.get("SELECT id FROM prices WHERE name = ?", item.name.trim());

            if (existingItem) {
                if (overwrite) {
                    await db.run(
                        "UPDATE prices SET ac_price = ?, dc_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                        item.ac_price,
                        item.dc_price,
                        existingItem.id
                    );
                    updatedCount++;
                } else {
                    skippedCount++;
                }
            } else {
                await db.run(
                    "INSERT INTO prices (name, ac_price, dc_price) VALUES (?, ?, ?)",
                    item.name.trim(),
                    item.ac_price,
                    item.dc_price
                );
                createdCount++;
            }
        }

        // Clear cache to force refresh
        cachedData = [];
        lastFetchTime = 0;

        res.json(AppResponse.success({
            message: "İçe aktarma başarıyla tamamlandı",
            summary: {
                total: importData.length,
                selected: itemsToProcess.length,
                processed: itemsToProcess.length,
                created: createdCount,
                updated: updatedCount,
                skipped: skippedCount
            }
        }));

    } catch (error: any) {
        console.error("Import confirm error:", error);
        res.status(400).json(AppResponse.error(`İçe aktarma onayı hatası: ${error.message}`));
    }
});

app.use("/api", router);
app.use("/api/admin", adminRouter);

app.use("/static", express.static(path.join(__dirname, "frontend/static")));

app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(__dirname, "frontend/index.html"));
});

process.on('SIGINT', () => {
    console.info("Stopping Server");
    db.close().then();
    process.exit(0);
});

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});
