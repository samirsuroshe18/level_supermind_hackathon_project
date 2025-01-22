import asyncHandler from '../utils/customAsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import sentiment from 'sentiment';
import fs from 'fs';
import FirecrawlApp from '@mendable/firecrawl-js';
import astraDB from '../utils/astraDB.js';
import extractJson from '../utils/extractJson.js';
import { response } from 'express';
import axios from 'axios';

// Initialize Sentiment and TF-IDF for keyword extraction
// const sentimentAnalyzer = new sentiment();
// const tfidf = new TfIdf();

const insetData = asyncHandler(async (req, res) => {
  try {
    const astraClient = await astraDB();
    console.log("Connected to AstraDB");
  
    // const query = `INSERT INTO default_keyspace.advise (id, markdown) VALUES (123, ?)`;
    // const params = [data]; // Pass data as a parameter array
  
    // await astraClient.execute(query, params, { prepare: true }); // Use parameterized query
    // await astraClient.shutdown();
  
    // console.log("Data inserted successfully");
    // return res.status(200).json(new ApiResponse(200, {}, "Data inserted successfully"));
  
  } catch (error) {
    console.error("Database error:", error);
    throw new ApiError(500, "Failed to insert data into database");
  }
  
});


const fireCrawl = asyncHandler(async (req, res) => {
  const {baseUrl, endPoint} = req.body;
  console.log('data scraping...', baseUrl);
  const app = new FirecrawlApp({ apiKey: "fc-6134c37b375848919e3c113751f1cae9" });
  const crawlResponse = await app.crawlUrl(`${baseUrl}`, {
    scrapeOptions: {
      formats: ['markdown', 'html'],
    }
  });

  if (!crawlResponse.success) {
    throw new ApiError(`Failed to crawl: ${crawlResponse.error}`)
  }
  console.log('datastraping complete..')

  const markdown = crawlResponse.data[0].markdown;
  console.log(crawlResponse.data[0].markdown);
  // fs.writeFileSync('D:\\output.md', crawlResponse.data[0].markdown, 'utf8');
  // console.log(`Successfully saved markdown to D:\output.md`);

  const astraClient = await astraDB();
  console.log('astra db connection successfull');
  const truncateQuery = 'TRUNCATE default_keyspace.advise;';
  await astraClient.execute(truncateQuery);

  const query = `INSERT INTO default_keyspace.advise (id,markdown) VALUES (123,'${markdown}')`;
  await astraClient.execute(query);
  console.log('data inserted')

  const payload = {
    input_value: "give me the statistics that you have told to do. do you understand",
    input_type: "chat",
    output_type: "chat",
    tweaks: {
      "ChatInput-sb0kn": {},
      "Prompt-laWRx": {},
      "ParseData-EHGrZ": {},
      "AstraDBToolComponent-IHNnw": {},
      "GoogleGenerativeAIModel-socrv": {},
      "ChatOutput-95XP6": {},
      "JSONCleaner-if8NZ": {},
      "ParseData-uh6W9": {},
    },
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

  const jsonResponseString =response.data?.outputs[0]?.outputs[0]?.results?.message?.data?.text;
  const extractedJsonData = extractJson(jsonResponseString);
    const parseJsonData = JSON.parse(extractedJsonData[0].code);
    console.log(parseJsonData);
    console.log(parseJsonData[0].language)

  return res.status(200).json(
    new ApiResponse(200, {'originalData':response.data, 'parseData': parseJsonData}, "Data fetched successfully")
  )
});

function saveMarkdownToFile(data, filename) {
  try {
    fs.writeFileSync(filename, {'originalData':response.data, 'parseData': parseJsonData}, 'utf8');
    console.log(`Successfully saved markdown to ${filename}`);
  } catch (error) {
    console.error('Error saving markdown:', error);
  }
}


export { fireCrawl, insetData };






// import asyncHandler from '../utils/customAsyncHandler.js';
// import ApiError from '../utils/ApiError.js';
// import ApiResponse from '../utils/ApiResponse.js';
// import fs from 'fs';
// import FirecrawlApp from '@mendable/firecrawl-js';
// import astraDB from '../utils/astraDB.js';
// import extractJson from '../utils/extractJson.js';
// import axios from 'axios';

// // Static data for testing purposes
// // const data = `[![Flipkart](https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/flipkart-plus_8d85f4.png)](https://www.flipkart.com/)...`;

// // Insert static data into the database
// const insertData = asyncHandler(async (req, res) => {
//   try {
//     const astraClient = await astraDB();

//     const query = `INSERT INTO default_keyspace.data (id, markdown) VALUES (uuid(), ?)`;
//     const params = [data];

//     await astraClient.execute(query, params, { prepare: true });
//     await astraClient.shutdown();

//     console.log('Data inserted successfully');
//     return res.status(200).json(new ApiResponse(200, {}, 'Data inserted successfully'));
//   } catch (error) {
//     console.error('Error inserting data:', error.message);
//     throw new ApiError(500, `Failed to insert data: ${error.message}`);
//   }
// });

// // Crawl data and store it in the database
// const fireCrawl = asyncHandler(async (req, res) => {
//   try {
//     const { baseUrl, endPoint } = req.body;

//     if (!baseUrl || !endPoint) {
//       throw new ApiError(400, 'baseUrl and endPoint are required');
//     }

//     const app = new FirecrawlApp({ apiKey: 'fc-6134c37b375848919e3c113751f1cae9' });
//     const crawlResponse = await app.crawlUrl(`${baseUrl}${endPoint}`, {
//       scrapeOptions: { formats: ['markdown', 'html'] },
//     });

//     if (!crawlResponse.success) {
//       console.error('Crawling failed:', crawlResponse.error);
//       throw new ApiError(500, `Crawling failed: ${crawlResponse.error}`);
//     }

//     const markdown = crawlResponse.data[0]?.markdown;
//     if (!markdown) {
//       throw new ApiError(400, 'Crawled data does not contain markdown');
//     }

//     console.log('Crawled Markdown:', markdown);

//     const astraClient = await astraDB();
//     await astraClient.execute('TRUNCATE default_keyspace.data');

//     const query = `INSERT INTO default_keyspace.data (id, markdown) VALUES (uuid(), ?)`;
//     const params = [markdown];
//     await astraClient.execute(query, params, { prepare: true });

//     console.log('Data stored in the database');

//     return res.status(200).json(new ApiResponse(200, { markdown }, 'Data crawled and stored successfully'));
//   } catch (error) {
//     console.error('Error in fireCrawl:', error.message);
//     throw new ApiError(500, `Failed to crawl and store data: ${error.message}`);
//   }
// });

// // Save Markdown data to a file
// function saveMarkdownToFile(data, filename) {
//   try {
//     fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
//     console.log(`Successfully saved markdown to ${filename}`);
//   } catch (error) {
//     console.error('Error saving markdown to file:', error.message);
//   }
// }

// export { fireCrawl, insertData };
