import { Status, STATUS_TEXT } from "@oak/oak";
import { WebAuthnCredential } from "@simplewebauthn/types";
import db from "../config/db.ts";
import { throwError } from "../middleware/errorHandler.middleware.ts";
import { User } from "../models/user.model.ts";

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
                message: `Expense ${user.name} already inserted`,
                type: STATUS_TEXT[Status.Conflict],
            });
        }
        const { insertedId } = await usersCollection.insertOne(user, {
            ignoreUndefined: true,
        });

        return { _id: insertedId, ...user };
    }

    public static async getByEmail(email: string): Promise<User | null> {
        const usersCollection = db.getDatabase.collection<User>("users");
        const user = await usersCollection.findOne({
            email: email,
        });
        return user ?? null;
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
}
