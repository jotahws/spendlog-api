import { MongoClient } from "@db/mongo";
import config from "./config.ts";

const { dbName, mongoUri } = config;
/**
 * Reusable database connection
 */
class Database {
    public client: MongoClient;

    /**
     * Constructor function for Database
     * @param dbName
     * @param url
     */
    constructor(public dbName: string, public url: string) {
        this.dbName = dbName;
        this.url = url;
        this.client = {} as MongoClient;
    }

    /**
     * Function to connect to MongoDB with retry logic
     */
    async connect(retries = 5, delay = 1000) {
        console.info(`MongoDB Server connecting...`);
        const client: MongoClient = new MongoClient();

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await client.connect(this.url);
                this.client = client;
                console.info("Database connected!");
                return;
            } catch (error) {
                console.error(`Attempt ${attempt} failed: ${error}`);
                if (attempt < retries) {
                    console.info(`Retrying in ${delay}ms...`);
                    await new Promise((res) => setTimeout(res, delay));
                    delay *= 2; // exponential backoff
                } else {
                    console.error(
                        "All attempts to connect to the database failed.",
                    );
                    throw error;
                }
            }
        }
    }

    /**
     * returns database
     */
    get getDatabase() {
        return this.client.database(this.dbName);
    }
}

const db = new Database(dbName, mongoUri);
await db.connect();

export default db;
