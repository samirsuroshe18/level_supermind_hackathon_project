import mongoose, { Schema } from "mongoose";

// fewer posts than this cannot support a report
export const MIN_POSTS = 15;
export const STATUSES = ['queued', 'running', 'done', 'failed'];
export const ACTIVE_STATUSES = ['queued', 'running'];
export const STAGES = ['collecting', 'analysing', 'writing'];

const subdocument = { _id: false, id: false };

const postSchema = new Schema({
    source: String,
    id: String,
    text: String,
    author: String,
    url: String,
    score: Number,
    createdAt: Date,
}, subdocument);

const reportSchema = new Schema({
    // { overall: { positive, neutral, negative }, bySource: { <source>: { ... } } }
    sentiment: Schema.Types.Mixed,
    // posts per month for the last 12 months
    volume: [new Schema({ month: String, count: Number }, subdocument)],
    // ids of the highest-scored posts of each source
    topPosts: [String],
    // absent when the language model could not be reached
    insights: Schema.Types.Mixed,
    insightsAvailable: { type: Boolean, default: false },
    // the posts the report refers to; nothing else that was collected is kept
    evidence: [postSchema],
}, subdocument);

const researchSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    topic: {
        type: String,
        required: true,
        trim: true,
    },

    status: {
        type: String,
        enum: STATUSES,
        default: 'queued',
    },

    // what a running research is doing right now
    stage: {
        type: String,
        enum: STAGES,
    },

    // why a failed research failed, written for the user
    error: String,

    sourcesUsed: [new Schema({ name: String, label: String, count: Number }, subdocument)],
    sourcesSkipped: [new Schema({ name: String, label: String, reason: String }, subdocument)],
    postCount: Number,
    report: reportSchema,
    finishedAt: Date,

    // a deleted research is emptied but kept, so it still counts towards its day
    deletedAt: Date,

}, { timestamps: true });

// a user can have one research in progress; the database refuses a second one even
// when two requests arrive at the same moment
researchSchema.index(
    { user: 1 },
    { name: 'one_active_per_user', unique: true, partialFilterExpression: { status: { $in: ACTIVE_STATUSES } } }
);

// the history list and the daily count both read one user's researches by date
researchSchema.index({ user: 1, createdAt: -1 });

export const Research = mongoose.model("Research", researchSchema);
