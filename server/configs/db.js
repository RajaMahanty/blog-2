import mongoose from "mongoose";

// Cache the connection for serverless (reuse across function invocations)
let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};

		cached.promise = mongoose
			.connect(process.env.MONGODB_URI, {
				...opts,
				// Prefer explicit dbName to avoid accidental double slashes in URI
				dbName: process.env.MONGODB_DB_NAME || "quickblog",
			})
			.then((mongoose) => {
				console.log("Database Connected");
				return mongoose;
			});
	}

	try {
		cached.conn = await cached.promise;
	} catch (error) {
		cached.promise = null;
		console.log("Database connection error:", error.message);
		throw error;
	}

	return cached.conn;
};

export default connectDB;
