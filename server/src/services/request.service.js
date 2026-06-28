import axios from "axios";
import RequestHistory from "#models/history.js";

export const executeApiRequest = async ({ userId, url, method, headers, data }) => {

  const startTime = Date.now();

  try {
    const response = await axios({ url, method, headers, data });
    const responseTime = Date.now() - startTime;

    await saveHistory({
      userId,
      url,
      method,
      headers,
      requestBody: data,
      responseBody: response.data,
      statusCode: response.status,
      responseTime,
    });

    return { responseData: response.data, statusCode: response.status };
  } catch (err) {
    const responseTime = Date.now() - startTime;

    // axios wraps HTTP error responses inside err.response
    const axiosResponse = err.response;

    await saveHistory({
      userId,
      url,
      method,
      headers,
      requestBody: data,
      responseBody: axiosResponse?.data ?? null,
      statusCode: axiosResponse?.status ?? 0,
      responseTime,
    });

    // Re-throw a clean, enriched error for the controller
    const serviceError = new Error(
      axiosResponse
        ? `Upstream API returned ${axiosResponse.status}`
        : "API request failed — network or DNS error"
    );
    serviceError.statusCode = axiosResponse?.status ?? 502;
    serviceError.upstream = axiosResponse?.data ?? null;

    throw serviceError;
  }
};

/**
 * Persists a history record. Wrapped in its own try/catch so that
 * a DB write failure never silently swallows the upstream error.
 */
const saveHistory = async ({ userId, url, method, headers, requestBody, responseBody, statusCode, responseTime }) => {
  try {
    console.log('saving data......');
    
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