import express from "express";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import cors from "cors";
import { Request, Response } from "express";
import { Browser, Page } from "puppeteer";

const app = express()
const port = process.env.PORT || 3000
const host = "https://www.adafruit.com";
const allowedOrigins = ["http://localhost:3001"];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options)); /* NEW */

interface Image {
  src: string,
  alt: string,
}

interface Video {
  source: string,
  poster: string,
}

interface Product {
  image: Image,
  video: Video,
  href: string,
  title: string,
  description: string,
  price: string,
  merchant: string,
}

app.get("/search/:q", (req: Request, res: Response) => {
  // TODO: need to add validations for the query
  
  const query = encodeURI(req.params?.q);
  const url = `${host}/?q=${query}&sort=BestMatch`;
  puppeteer
    .launch()
    .then(function(browser: Browser) {
      return browser.newPage();
    })
    .then(function(page: Page) {
      return page.goto(url).then(function() {
        return page.content();
      });
    })
    .then(function(html: string) {
      const $ = cheerio.load(html)
      const products:Product[] = [];

      $(".product-listing").each(function(this: string) {
        const product = $(this);
        const image:Image = {
          src: product.find(".img-responsive")?.attr("src") ?? "",
          alt: product.find(".img-responsive").attr("alt")?.trim() ?? "",
        };
        const video:Video = {
          source: product.find("video").attr("poster") ?? "",
          poster: product.find("source").attr("source") ?? "",
        };

        products.push({
          image,
          video,
          href: host + product.find("a").attr("href"),
          title: product.find(".ec_click_product").text().trim(),
          description: product.find(".product-description").text().trim(),
          price: product.find(".normal-price").text(),
          merchant: "adafruit",
        });
      });

      return res.json({ data: products });
    })
    .catch((err: Error) => {
      console.log(err)
      //handle error
    });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
