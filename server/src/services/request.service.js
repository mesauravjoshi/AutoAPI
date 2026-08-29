import axios from "axios";
import RequestHistory from "#models/history.js";

// Content-types we can safely decode as UTF-8 text (JSON, HTML, plain text, XML, etc).
// Anything else (images, video, pdf, zip, octet-stream, fonts...) is treated as binary.
const isTextLikeContentType = (contentType = "") => {
  const ct = contentType.toLowerCase();
  if (!ct) return true; // unknown -> safest to treat as text and let the client sniff it
  return (
    ct.includes("application/json") ||
    ct.includes("text/") ||
    ct.includes("xml") ||
    ct.includes("javascript") ||
    ct.includes("urlencoded")
  );
};

export const executeApiRequest = async ({ userId, url, method, headers, body }) => {
  const startTime = Date.now();

  try {
    const response = await axios({
      url,
      method,
      headers,
      data: body,
      // CRITICAL: fetch raw bytes, don't let axios UTF-8-decode the body for us.
      // Without this, binary responses (png/jpg/pdf/mp4/zip...) get silently corrupted
      // before we ever see them.
      responseType: "arraybuffer",
      validateStatus: () => true,
    });

    const responseTime = Date.now() - startTime;
    const contentType = response.headers["content-type"] || "";
    const buffer = Buffer.from(response.data); // response.data is an ArrayBuffer/Buffer here

    let data;
    let dataUrl;

    if (isTextLikeContentType(contentType)) {
      const text = buffer.toString("utf-8");
      if (contentType.toLowerCase().includes("application/json")) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text; // not actually valid JSON despite the header, fall back to raw text
        }
      } else {
        data = text; // html / plain text / xml / etc.
      }
    } else {
      // Binary: keep the raw bytes out of `data`, hand back a ready-to-use data URL instead.
      dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
      data = null;
    }

    await saveHistory({
      userId, url, method, headers,
      requestBody: body,
      // Don't shove megabytes of base64 into the DB history record.
      responseBody: isTextLikeContentType(contentType) ? data : `[binary ${contentType || "unknown"}, ${buffer.length} bytes]`,
      statusCode: response.status,
      responseTime,
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data,
      dataUrl,           // undefined for text/json/html responses
      size: buffer.length, // exact byte length, correct for binary AND text
      responseTime,
    };
  } catch (err) {
    // console.log();

    const responseTime = Date.now() - startTime;

    await saveHistory({
      userId, url, method, headers,
      requestBody: body,
      responseBody: null,
      statusCode: 0,
      responseTime,
    });

    const serviceError = new Error("Could not reach the target API — network or DNS error");
    serviceError.statusCode = 502;
    throw serviceError;
  }
};

const saveHistory = async ({ userId, url, method, headers, requestBody, responseBody, statusCode, responseTime }) => {
  try {
    await RequestHistory.create({
      userId,
      url,
      method: method.toUpperCase(),
      headers,
      requestBody,
      responseBody,
      statusCode,
      responseTime,
    });
  } catch (dbError) {
    console.error("[HistoryService] Failed to save history record:", dbError.message);
  }
};