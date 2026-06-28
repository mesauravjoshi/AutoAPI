import express from "express";
import { protect } from "#middlewares/auth.middleware.js";
// import { protect } from '#models/user.js';

const router = express.Router();

// TEST ROUTE
router.put("/data", (req, res) => {
  console.log("Request query:", req.query);
  res.status(200).json({ message: "success", query: req.query });
});

router.get("/error_test", (req, res) => {
  // console.log("req hit ...");
  res.status(200).json({ message: "Success" });
});

export default router;
