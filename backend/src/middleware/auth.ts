import {NextFunction, Request, Response} from "express";
import bcrypt from "bcrypt";
import {AppResponse} from "../app-response";
import {Database} from "sqlite";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: string;
        authenticated: boolean;
    };
}

export class AuthMiddleware {
    constructor(private db: Database) {}

    async authenticateBasic(req: AuthRequest, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
            return res.status(401).json(AppResponse.error("Authentication required"));
        }

        try {
            const credentials = this.extractCredentials(authHeader);
            const user = await this.validateCredentials(credentials.username, credentials.password);

            if (!user) {
                res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
                return res.status(401).json(AppResponse.error("Invalid credentials"));
            }

            req.user = {
                id: user.id,
                username: user.username,
                role: 'admin',
                authenticated: true
            };

            next();
        } catch (error) {
            console.error("Authentication error:", error);
            return res.status(500).json(AppResponse.error("Authentication error"));
        }
    }

    private extractCredentials(authHeader: string): { username: string; password: string } {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        if (!username || !password) {
            throw new Error("Invalid credentials format");
        }

        return { username, password };
    }

    private async validateCredentials(username: string, password: string): Promise<any> {
        const adminUser = await this.db.get("SELECT * FROM admin_users WHERE username = ?", username);

        if (!adminUser) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);
        return isPasswordValid ? adminUser : null;
    }
}