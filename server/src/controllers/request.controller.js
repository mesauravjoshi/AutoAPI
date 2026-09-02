// server/src/controllers/request.controller.js
import { executeApiRequest, saveHistory } from "#services/request.service.js";

/**
 * POST /api/request
 * Forwards an API request on behalf of the user and logs the result.
 */
export const sendRequest = async (req, res) => {
  const { url, method, headers, body } = req.body;

  if (!url || !method) {
    return res.status(400).json({ error: "url and method are required." });
  }

  let requestBody;

  if (body?.type === "formData") {
    requestBody = new FormData();

    for (const [key, value] of body.data) {
      requestBody.append(key, value);
    }
  } else if (body?.type === "urlSearchParams") {
    requestBody = new URLSearchParams(body.data);
  } else {
    requestBody = body?.data;
  }
  // here need to update -> based on body type update requestBody type for string : string for  JSON :object, XML to XML like in postman
  try {
    const result = await executeApiRequest({
      userId: req.user.id,
      url, method, headers,
      body: requestBody,
    });

    // ALWAYS 200 here — your proxy succeeded.
    // The target's real status/headers/body live inside `result`.
    return res.status(200).json(result);

  } catch (error) {
    // Only true proxy failures land here (network/DNS/timeout)
    const status = error.statusCode ?? 500;
    return res.status(status).json({ error: error.message });
  }
};

export const sendLocalAgentRequest = async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    if (!url || !method) {
      return res.status(400).json({ error: "url and method are required." });
    }

    const responseData = await saveHistory({
      userId: req.user.id,
      url,
      method,
      headers,
      responseBody: body,
    });

    return res.status(200).json(responseData);

  } catch (error) {
    const status = error.statusCode ?? 500;
    const message = error.message ?? "An unexpected error occurred.";

    return res.status(status).json({ error: message });
  }
};