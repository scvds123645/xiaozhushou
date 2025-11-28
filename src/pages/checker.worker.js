// public/checker.worker.js

// --- Worker Configuration ---
// Maximum number of batch requests to run at the same time.
// Adjust this based on testing. 5-10 is a safe and fast range.
const CONCURRENT_BATCH_LIMIT = 10;
// Number of IDs to include in a single batch request (max 50).
const BATCH_SIZE = 50;
// How often to send progress updates back to the main thread (in milliseconds).
const UI_UPDATE_INTERVAL = 500;


/**
 * Processes a single batch of IDs using Facebook's Graph API.
 * @param {string[]} idChunk - An array of up to 50 user IDs.
 * @returns {Promise<object[]>} - A promise that resolves to an array of parsed results.
 */
async function processBatch(idChunk) {
  const batch = idChunk.map(id => ({
    method: 'GET',
    relative_url: `/${id}/picture?redirect=false`,
  }));

  const body = new URLSearchParams();
  body.append('batch', JSON.stringify(batch));
  // Note: An access token is not required for this specific public picture check,
  // but would be for other API calls.
  // body.append('access_token', 'APP_ACCESS_TOKEN'); 

  try {
    const response = await fetch('https://graph.facebook.com', {
      method: 'POST',
      body: body,
    });

    if (!response.ok) {
        // If the whole batch request fails, treat all as 'Die'
        return idChunk.map(id => ({ id, status: 'Die', url: '' }));
    }

    const results = await response.json();

    // Process the results of the batch request
    return results.map((result, index) => {
      const originalId = idChunk[index];
      if (result === null || result.code !== 200) {
        return { id: originalId, status: 'Die', url: '' };
      }
      try {
        const data = JSON.parse(result.body);
        const url = data?.data?.url || '';
        // The logic remains: if the URL points to a 'static' image, it's a 'Die' account.
        const status = url.includes('static') ? 'Die' : 'Live';
        return { id: originalId, status, url };
      } catch (e) {
        return { id: originalId, status: 'Die', url: '' };
      }
    });
  } catch (error) {
    // On network error, treat all in the chunk as 'Die'
    return idChunk.map(id => ({ id, status: 'Die', url: '' }));
  }
}

// --- Main Worker Logic ---
self.onmessage = async (event) => {
  const { type, ids } = event.data;
  if (type !== 'start') return;

  const allResults = [];
  let completedCount = 0;
  const startTime = Date.now();
  
  // Split all IDs into chunks of BATCH_SIZE
  const idChunks = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    idChunks.push(ids.slice(i, i + BATCH_SIZE));
  }

  // Timer to periodically send updates to the main thread
  const uiUpdateTimer = setInterval(() => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const itemsPerSecond = elapsedSeconds > 0 ? Math.round(completedCount / elapsedSeconds) : 0;
    
    self.postMessage({
      type: 'update',
      payload: {
        results: [...allResults],
        progress: completedCount,
        itemsPerSecond,
      },
    });
  }, UI_UPDATE_INTERVAL);

  const activePromises = new Set();
  const chunksIterator = idChunks.values();

  try {
    for (const chunk of chunksIterator) {
        const promise = processBatch(chunk).then(batchResults => {
            allResults.push(...batchResults);
            completedCount += chunk.length;
            activePromises.delete(promise);
        });
        
        activePromises.add(promise);

        if (activePromises.size >= CONCURRENT_BATCH_LIMIT) {
            await Promise.race(activePromises);
        }
    }
    await Promise.all(activePromises);

  } catch (e) {
    console.error('An error occurred in the worker:', e);
  } finally {
    // Final cleanup and message
    clearInterval(uiUpdateTimer);

    // Send the final, complete results
    self.postMessage({
        type: 'update',
        payload: {
            results: allResults,
            progress: ids.length, // Ensure progress is 100%
            itemsPerSecond: 0,
        },
    });

    self.postMessage({ type: 'finish' });
  }
};
