// must stay first: ES imports are hoisted, and the modules below read process.env
import 'dotenv/config';
import connectDB from './database/database.js';
import app from './app.js';
import { failInterrupted } from './jobs/runResearch.js';

connectDB().then(async () => {
    // a research that was running when the server stopped cannot be resumed
    const interrupted = await failInterrupted();
    if (interrupted > 0) {
        console.log(`Marked ${interrupted} interrupted research(es) as failed`);
    }

    app.listen(process.env.PORT || 3000, process.env.SERVER_HOST, () => {
        console.log(`Server is running at on : http://${process.env.SERVER_HOST}:${process.env.PORT}`);
    })
}).catch((err) => {
    console.log('MongoDB Failed !!!', err);
});
