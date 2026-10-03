// Creates the demo account and runs a few real researches for it, so a visitor can
// read finished reports without signing up. Only the demo account's data is removed,
// so it is safe to run again. It calls the sources and the language model for real.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../database/database.js';
import { User } from '../models/user.model.js';
import { Research } from '../models/research.model.js';
import { runResearch } from '../jobs/runResearch.js';

const DEMO_EMAIL = 'demo@advise.demo';
const DEMO_PASSWORD = 'Demo@123';
const TOPICS = ['standing desks', 'meal kit delivery', 'budget android phones'];
const DAY_MS = 24 * 60 * 60 * 1000;

const seed = async () => {
    await connectDB();

    const existing = await User.findOne({ email: DEMO_EMAIL });
    if (existing) {
        await Research.deleteMany({ user: existing._id });
        await User.deleteOne({ _id: existing._id });
    }

    // User.create runs the password hashing hook
    const user = await User.create({ userName: 'Demo User', email: DEMO_EMAIL, password: DEMO_PASSWORD, isVerified: true, isDemo: true });

    console.log(`\nDemo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}\n`);

    // one after another: a user can have only one research in progress
    for (const topic of TOPICS) {
        const research = await Research.create({ user: user._id, topic });
        await runResearch(research._id);

        // dated a day back, so the demo account starts with its full daily allowance.
        // The driver is used directly because Mongoose keeps createdAt fixed.
        await Research.collection.updateOne({ _id: research._id }, { $set: { createdAt: new Date(Date.now() - DAY_MS) } });

        const { status, postCount, error } = await Research.findById(research._id);
        console.log(`${topic}: ${status}${postCount ? `, ${postCount} posts` : ''}${error ? ` (${error})` : ''}`);
    }
};

seed()
    .then(() => mongoose.disconnect())
    .catch(async (error) => {
        console.log('Seeding failed:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    });
