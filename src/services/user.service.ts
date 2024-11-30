import { Status, STATUS_TEXT } from "@oak/oak";
import { WebAuthnCredential } from "@simplewebauthn/types";
import { ObjectId } from "mongodb";
import db from "../config/db.ts";
import { throwError } from "../middleware/errorHandler.middleware.ts";
import { ApiKeys, User } from "../models/user.model.ts";

export default class UserService {
    public static async insert(user: User): Promise<User> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const userDup = await usersCollection.findOne({
            email: user.email,
        });
        if (userDup) {
            throwError({
                status: Status.Conflict,
                name: "User already exists",
                path: "user.service.insert",
                message: `User ${user.name} already inserted`,
                type: STATUS_TEXT[Status.Conflict],
            });
        }
        const { insertedId } = await usersCollection.insertOne(user, {
            ignoreUndefined: true,
        });

        return { ...user, _id: insertedId };
    }

    public static async findByEmail(email: string): Promise<User | null> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const user = await usersCollection.findOne({
            email: email,
        });
        return user;
    }

    public static async findById(id: string): Promise<User | null> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const user = await usersCollection.findOne({
            _id: new ObjectId(id),
        });
        return user;
    }

    public static async findByApiKey(apiKey: string): Promise<User | null> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const user = await usersCollection.findOne({
            apiKeys: { $in: [apiKey] },
        });
        return user;
    }

    public static async updatePasskey(
        email: string,
        newPasskey: WebAuthnCredential,
    ): Promise<void> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const user = await usersCollection.findOne({
            email,
        });
        if (user) {
            const passkeyIndex = user.passkeys.findIndex(
                (cred) => cred.id === newPasskey.id,
            );
            if (passkeyIndex) {
                user.passkeys[passkeyIndex] = newPasskey;
                await usersCollection.updateOne(
                    { email },
                    { $set: { passkeys: user.passkeys } },
                );
            }
        }
    }

    public static async update(id: string, user: User): Promise<User | null> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: user },
            { upsert: true },
        );
        if (updateResult.modifiedCount === 0) {
            return null;
        }
        return user;
    }

    public static async delete(id: string): Promise<boolean> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const deleteResult = await usersCollection.deleteOne({
            _id: new ObjectId(id),
        });
        return deleteResult.deletedCount > 0;
    }

    public static async createApiKey(
        id: string,
    ): Promise<ApiKeys | null> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const user = await usersCollection.findOne({
            _id: new ObjectId(id),
        });
        if (user) {
            const apiKey = crypto.randomUUID();
            if (user.apiKeys === undefined) {
                user.apiKeys = [apiKey];
            } else {
                user.apiKeys.push(apiKey);
            }
            await usersCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { apiKeys: user.apiKeys } },
            );
            return { apiKeys: [apiKey] };
        }
        return null;
    }

    public static async getApiKeys(id: string): Promise<ApiKeys> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const user = await usersCollection.findOne({
            _id: new ObjectId(id),
        });
        return { apiKeys: user?.apiKeys ?? [] };
    }

    public static async removeApiKey(
        id: string,
        apiKey: string,
    ): Promise<void> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const user = await usersCollection.findOne({
            _id: new ObjectId(id),
        });
        if (user) {
            const apiKeyIndex = user.apiKeys.findIndex((key) => key === apiKey);
            if (apiKeyIndex !== -1) {
                user.apiKeys.splice(apiKeyIndex, 1);
                await usersCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { apiKeys: user.apiKeys } },
                );
            }
        }
    }
}
