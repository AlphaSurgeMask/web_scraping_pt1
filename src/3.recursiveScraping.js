const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const j2csv = require("json2csv").Parser;

let fullArray = [];

recursiveScraping(1);

async function recursiveScraping(page) {
  try {
    const axiosResponse = await axios.request({
      method: "GET",
      url: "https://scrapeme.live/shop/page/" + page,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: "https://scrapeme.live/shop/page/", // The URL of the website you're scraping from
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        TE: "Trailers",
      },
    });

    // Process the data

    const $ = cheerio.load(axiosResponse.data);
    const htmlElement = $("li.product")
      .map(function (e, pokemon) {
        // 'e' is the index
        //'pokemon' is the current Element
        let item = $(pokemon); //pokemon is an object, item is now a JQuery Object

        const name = item.find(".woocommerce-loop-product__title").text();
        const price = item.find(".woocommerce-Price-amount").text();

        return { name: name, price: price };
      })
      .toArray();

    // console.log(htmlElement);

    fullArray = fullArray.concat(htmlElement);

    console.log("Data fetched successfully, page " + page);
    return recursiveScraping(page + 1);
  } catch (error) {
    // Handle the error
    console.error("Error fetching data:", error.message);

    const parser = new j2csv();
    const csv = parser.parse(fullArray);

    //fs.appendFile

    fs.appendFile("../data/pokemonFull.csv", csv, function (err) {
      if (err) {
        console.log(
          "Some error occured - file either not saved or corrupted file saved.",
        );
      } else {
        console.log("Saved file successfully!");
      }
    });
  }
}
