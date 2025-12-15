const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/fetch", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 15000
    });

    const html = response.data;
    const $ = cheerio.load(html);
   //  Usage ------------------------- http://localhost:3000/fetch?url=https://itsikhwal.netlify.app/
    // Remove unwanted tags   
    $("script, style, noscript, iframe, svg").remove();

    const title = $("title").text().trim();
    const description = $("meta[name='description']").attr("content") || "";

    // Headings
    const headings = [];
    $("h1,h2,h3,h4,h5,h6").each((_, el) => {
      headings.push({
        tag: el.tagName,
        text: $(el).text().trim()
      });
    });

    // Links
    const links = [];
    $("a").each((_, el) => {
      links.push({
        text: $(el).text().trim(),
        href: $(el).attr("href")
      });
    });

    // Lists
    const lists = [];
    $("li").each((_, el) => {
      const text = $(el).text().trim();
      if (text) lists.push(text);
    });

    // Paragraphs
    const paragraphs = [];
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text) paragraphs.push(text);
    });

    // 🔥 ALL VISIBLE TEXT
    let allText = $("body").text()
      .replace(/\s+/g, " ")
      .trim();

    res.json({
      url,
      title,
      description,
      headings,
      paragraphs,
      lists,
      links,
      fullText: allText
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch website" });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
