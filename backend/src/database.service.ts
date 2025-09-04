/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// database.service.ts
import { neon } from '@neondatabase/serverless';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface User {
    id: number;
    [key: string]: any;
}

@Injectable()
export class DatabaseService {
    private readonly sql: any;

    constructor(private configService: ConfigService) {
        const databaseUrl = this.configService.get<string>('DATABASE_URL');
        this.sql = neon(databaseUrl!);
    }

    async getData(): Promise<User[]> {
        const data = await this.sql`SELECT * FROM users`;
        return data as User[];
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const users = await this.sql`SELECT * FROM users`;
            return users as User[];
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }
}
