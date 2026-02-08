import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import {open} from "sqlite";
import {nanoid} from "nanoid";
import bcrypt from "bcrypt";
import {PriceDto} from "./price-dto";
import {AppResponse} from "./app-response";
import process from 'process';
import path from "path";
import {Database} from "sqlite/build/Database";
import {AuthMiddleware, AuthRequest} from "./middleware/auth";
import {AdminService} from "./services/admin-service";
import {DataService} from "./utils/data-service";
import {environment} from "./config/environment";

const PORT = environment.get('PORT');
const DB_FILE = environment.get('DB_FILE');
const CACHE_DURATION = environment.get('CACHE_DURATION');
const ADMIN_DEFAULT_PASSWORD = environment.get('ADMIN_DEFAULT_PASSWORD');

const app = express();
app.use(bodyParser.json());

let db: Database;
let dataService: DataService;
let adminService: AdminService;
let authMiddleware: AuthMiddleware;

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

    // Initialize services
    dataService = new DataService(db, CACHE_DURATION);
    adminService = new AdminService(db);
    authMiddleware = new AuthMiddleware(db);

    // Configure admin routes after services are initialized
    configureAdminRoutes();
}

async function getApiData(): Promise<PriceDto[]> {
    return await dataService.getData();
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

// Define admin routes (will be configured after services are initialized)
const adminRouter = express.Router();

function configureAdminRoutes() {
    // Auth check endpoint
    adminRouter.get("/auth", authMiddleware.authenticateBasic.bind(authMiddleware), async (req: AuthRequest, res) => {
        res.json(AppResponse.success({
            authenticated: true,
            username: req.user?.username,
            role: req.user?.role
        }));
    });

    adminRouter.get("/prices", authMiddleware.authenticateBasic.bind(authMiddleware), async (req, res) => {
        try {
            const prices = await adminService.getAllPrices();
            res.json(AppResponse.success(prices));
        } catch (err: any) {
            res.status(400).json(AppResponse.error(err.message));
        }
    });

    adminRouter.post("/prices", authMiddleware.authenticateBasic.bind(authMiddleware), async (req, res) => {
        const {name, acPrice, dcPrice} = req.body;

        try {
            await adminService.createPrice(name, acPrice, dcPrice);
            dataService.clearCache(); // Clear cache to force refresh
            res.json(AppResponse.success("Price created successfully"));
        } catch (err: any) {
            res.status(400).json(AppResponse.error(err.message));
        }
    });

    adminRouter.put("/prices/:id", authMiddleware.authenticateBasic.bind(authMiddleware), async (req, res) => {
        // @ts-ignore
        const {id}: { id: string } = req.params;
        const {name, acPrice, dcPrice} = req.body;

        try {
            await adminService.updatePrice(parseInt(id), name, acPrice, dcPrice);
            dataService.clearCache(); // Clear cache to force refresh
            res.json(AppResponse.success("Price updated successfully"));
        } catch (err: any) {
            res.status(400).json(AppResponse.error(err.message));
        }
    });

    adminRouter.delete("/prices/:id", authMiddleware.authenticateBasic.bind(authMiddleware), async (req, res) => {
        // @ts-ignore
        const {id}: { id: string } = req.params;

        try {
            await adminService.deletePrice(parseInt(id));
            dataService.clearCache(); // Clear cache to force refresh
            res.json(AppResponse.success("Price deleted successfully"));
        } catch (err: any) {
            res.status(400).json(AppResponse.error(err.message));
        }
    });

    // Import data from external source
    adminRouter.post("/import", authMiddleware.authenticateBasic.bind(authMiddleware), async (req, res) => {
        const {source} = req.body;

        try {
            let importUrl: string;

            // Check if source is a full URL or a predefined source
            if (source.startsWith('http://') || source.startsWith('https://')) {
                importUrl = source.trim();
            } else {
                return res.status(400).json(AppResponse.error("Geçersiz URL formatı. http:// veya https:// ile başlamalıdır"));
            }

            const result = await adminService.importData(importUrl);
            res.json(AppResponse.success(result));

        } catch (error: any) {
            console.error("Import error:", error);
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                res.status(400).json(AppResponse.error(`URL'e ulaşılamadı: ${source}`));
            } else {
                res.status(400).json(AppResponse.error(error.message));
            }
        }
    });

    // Confirm and execute import
    adminRouter.post("/import/confirm", authMiddleware.authenticateBasic.bind(authMiddleware), async (req, res) => {
        const {importData, overwrite = false, selectedItems = []} = req.body;

        try {
            const result = await adminService.confirmImport(importData, overwrite, selectedItems);
            dataService.clearCache(); // Clear cache to force refresh
            res.json(AppResponse.success(result));
        } catch (error: any) {
            console.error("Import confirm error:", error);
            res.status(400).json(AppResponse.error(error.message));
        }
    });
}


app.use("/api", router);
app.use("/api/admin", adminRouter);

app.use("/static", express.static(path.join(__dirname, "frontend/static")));

app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(__dirname, "frontend/index.html"));
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    if (db) {
        db.close().then(() => process.exit(0));
    } else {
        process.exit(0);
    }
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    if (db) {
        db.close().then(() => process.exit(0));
    } else {
        process.exit(0);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    if (db) {
        db.close().then(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    if (db) {
        db.close().then(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

async function startServer() {
    try {
        await initDb();

        app.listen(PORT, () => {
            console.info(`🚀 Server started successfully at http://localhost:${PORT}`);
            console.info(`📊 Environment: ${environment.get('NODE_ENV')}`);
            console.info(`📁 Database: ${DB_FILE}`);

            if (environment.isDevelopment()) {
                console.info('🛠️  Development mode - Hot reload enabled');
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
