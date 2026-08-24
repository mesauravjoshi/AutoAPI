import axios from "axios";
import RequestHistory from "#models/history.js";

export const executeApiRequest = async ({ userId, url, method, headers, body }) => {
  const startTime = Date.now();

  try {
    const response = await axios({
      url,
      method,
      headers,
      data: body,
      validateStatus: () => true, // treat all HTTP responses as "success" for us
    });

    const responseTime = Date.now() - startTime;

    await saveHistory({
      userId, url, method, headers,
      requestBody: body,
      responseBody: response.data,
      statusCode: response.status,
      responseTime,
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      responseTime,
    };
  } catch (err) {
    // This now ONLY fires for actual network-level failures
    const responseTime = Date.now() - startTime;

    await saveHistory({
      userId, url, method, headers,
      requestBody: body,
      responseBody: null,
      statusCode: 0,
      responseTime,
    });

    const serviceError = new Error("Could not reach the target API — network or DNS error");
    serviceError.statusCode = 502; // Bad Gateway — accurate: YOUR server failed to proxy
    throw serviceError;
  }
};

/**
 * Persists a history record. Wrapped in its own try/catch so that
 * a DB write failure never silently swallows the upstream error.
 */
const saveHistory = async ({ userId, url, method, headers, requestBody, responseBody, statusCode, responseTime }) => {
  try {
    // console.log('saving data......');

    await RequestHistory.create({
      userId,
      url: url,
      method: method.toUpperCase(),
      headers,
      requestBody,
      responseBody,
      statusCode,
      responseTime,
    });
  } catch (dbError) {
    // Log and continue — history persistence should not break the main flow
    console.error("[HistoryService] Failed to save history record:", dbError.message);
  }
};