import { executeApiRequest } from "#services/request.service.js";
import Request from "#models/request.js";
import mongoose from "mongoose";

/**
 * POST /api/request
 * Forwards an API request on behalf of the user and logs the result.
 */
export const sendRequest = async (req, res) => {
  const { url, method, headers, body } = req.body;
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
  // console.log('requestBod', requestBody);

  if (!url || !method) {
    return res.status(400).json({ error: "url and method are required." });
  }
  // console.log(req.body);

  try {
    const { responseData, statusCode } = await executeApiRequest({
      userId: req.user.id,
      url,
      method,
      headers,
      body: requestBody,
    });
    // console.log('responseData', responseData);

    return res.status(statusCode).json(responseData);
  } catch (error) {
    // console.log('error from req controller', error);

    // Structured error from service layer
    const status = error.statusCode ?? 500;
    // console.log('error', error);

    const message = error.upstream ? error.upstream : "An unexpected error occurred.";

    return res.status(status).json({ error: message });
  }
};

// export const bulkCreateRequests = async (req, res) => {
//   try {
//     const requests = req.body;
//     // console.log(requests);

//     if (!Array.isArray(requests) || requests.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or empty data",
//       });
//     }

//     // Transform $oid -> ObjectId
//     const formattedData = requests.map((item) => ({
//       name: item.name,
//       method: item.method,
//       url: item.url,
//       collectionId: new mongoose.Types.ObjectId(
//         item.collectionId.$oid
//       ),
//     }));

//     const savedRequests = await Request.insertMany(formattedData);

//     return res.status(201).json({
//       success: true,
//       message: "Requests saved successfully",
//       data: savedRequests,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

export const sendLocalAgentRequest = async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    if (!url || !method) {
      return res.status(400).json({ error: "url and method are required." });
    }

    const { responseData, statusCode } = await executeApiRequest({
      userId: req.user.id,
      url,
      method,
      headers,
      data: body,
    });
    return res.status(statusCode).json(responseData);

  } catch (error) {
    const status = error.statusCode ?? 500;
    const message = error.message ?? "An unexpected error occurred.";

    return res.status(status).json({ error: message });
  }
};