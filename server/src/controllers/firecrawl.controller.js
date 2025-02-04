import asyncHandler from '../utils/customAsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import FireCrawlApp from '@mendable/firecrawl-js';
import extractJson from '../utils/extractJson.js';
import axios from 'axios';
import db from '../utils/astraDB.js';

const dataScraping = asyncHandler(async (req, res) => {
  const { baseUrl } = req.body;

  const app = new FireCrawlApp({ apiKey: "fc-f2ce38c1d53f442a8dbc7cebac39d9f3" });

  const scrapeResult = await app.scrapeUrl(baseUrl, {
    formats: ["markdown"],
  });

  if (!scrapeResult.success) {
    throw new ApiError(`Failed to crawl: ${crawlResponse.error}`)
  }
  console.log(scrapeResult.markdown);

  return res.status(200).json(
    new ApiResponse(200, scrapeResult.markdown, "Data fetched successfully")
  );
});

const fireCrawl = asyncHandler(async (req, res) => {
  const { baseUrl } = req.body;

  const app = new FireCrawlApp({ apiKey: "fc-f2ce38c1d53f442a8dbc7cebac39d9f3" });

  const scrapeResult = await app.scrapeUrl(baseUrl, {
    formats: ["markdown"],
  });

  if (!scrapeResult.success) {
    throw new ApiError(`Failed to crawl: ${crawlResponse.error}`)
  }

  const markdown = scrapeResult.markdown;

  // Split the input markdown into manageable chunks
  const chunks = chunksArray(markdown);

  const collection = db.collection('ART_FINDER');
  await collection.insertOne({ markdown: chunks, date: new Date() });

  console.log('data inserted')



  const payload = {
    "input_value": "Give me the latest data statistics you can find latest data base on date field in database",
    "output_type": "chat",
    "input_type": "chat",
    "tweaks": {
      "Prompt-HrYpk": {},
      "ParseData-Z6OIq": {},
      "GoogleGenerativeAIModel-7JcPZ": {},
      "ChatOutput-rDHpY": {},
      "AstraDBToolComponent-fNRH4": {},
      "ChatInput-6sTBw": {}
    }
  };

  console.log("api calling.....")

  const response = await axios({
    method: "post",
    url: "https://api.langflow.astra.datastax.com/lf/9bb3a128-8c2e-4416-866b-6ad45c278a17/api/v1/run/8a2133d4-fa14-447a-a860-8daaa6862153?stream=false",
    headers: {
      Authorization: `Bearer ${process.env.LANGFLOW_AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: payload,
  });

  console.log(response);

  const jsonResponseString = response.data?.outputs[0]?.outputs[0]?.results?.message?.data?.text;
  const extractedJsonData = extractJson(jsonResponseString);
  const parseJsonData = JSON.parse(extractedJsonData[0].code);
  console.log(parseJsonData);
  console.log(extractedJsonData[0].language)

  return res.status(200).json(
    new ApiResponse(200, { 'originalData': response.data, 'parseData': parseJsonData }, "Data fetched successfully")
  )
});

export { fireCrawl, dataScraping };



function chunksArray(markdown) {

  try {
    // Define maximum document size (in bytes)
    const MAX_SIZE = 8000;

    function splitIntoChunks(markdown) {
      let chunks = [];
      let currentChunk = '';
      let currentSize = 0;

      // Split the markdown into smaller parts of 8000 bytes or less
      for (let i = 0; i < markdown.length; i++) {
        currentChunk += markdown[i];
        currentSize += Buffer.byteLength(markdown[i]);

        // Check if adding the next character would exceed the limit
        if (currentSize >= MAX_SIZE) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
          currentSize = 0;
        }
      }

      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
      }

      return chunks;
    }

    // Split the input markdown into manageable chunks
    const chunks = splitIntoChunks(markdown);

    // Insert into database using markdown1, markdown2, ...properties
    // let insertObject = {};

    // for (let i = 0; i < chunks.length; i++) {
    //   if (i < chunks.length) {
    //     insertObject[`markdown${i + 1}`] = chunks[i];
    //   }
    // }

    // // await collection.insertOne(insertObject);
    // console.log(`Inserted document with ${chunks.length} parts`);
    // console.log(insertObject);

    // const collection = db2.collection('ART_FINDER');
    // await collection.insertOne({markdown: chunks});
    // await collection.deleteAll();

    return chunks;
  } catch (error) {
    console.log(error.message);
  }
}

