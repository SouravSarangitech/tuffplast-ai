import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const Lead = mongoose.model("Lead", {
  name: String,
  phone: String,
  requirement: String,
  createdAt: { type: Date, default: Date.now }
});

const websiteData = `
Tuffplast manufactures PVC, HDPE pipes, fittings, water tanks and hoses.
Used in irrigation, plumbing and drainage.
Known for durability and corrosion resistance.
`;

app.post("/chat", async (req, res) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Tuffplast AI.

- Act like premium sales assistant
- Suggest products
- Add customer feedback
- Ask for lead if user interested

Company info:
${websiteData}
`
        },
        { role: "user", content: req.body.message }
      ]
    })
  });

  const data = await response.json();
  res.json({ reply: data.choices[0].message.content });
});

app.post("/lead", async (req, res) => {
  const lead = await Lead.create(req.body);
  res.json(lead);
});

app.get("/leads", async (req, res) => {
  const leads = await Lead.find();
  res.json(leads);
});

app.listen(5000);