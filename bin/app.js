"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var puppeteer_1 = __importDefault(require("puppeteer"));
var cheerio_1 = __importDefault(require("cheerio"));
var cors_1 = __importDefault(require("cors"));
var app = express_1.default();
var port = 3000;
var host = "https://www.adafruit.com";
var allowedOrigins = ["http://localhost:3001"];
var options = {
    origin: allowedOrigins
};
app.use(cors_1.default(options)); /* NEW */
app.get("/search/:q", function (req, res) {
    // TODO: need to add validations for the query
    var _a;
    var query = encodeURI((_a = req.params) === null || _a === void 0 ? void 0 : _a.q);
    var url = host + "/?q=" + query + "&sort=BestMatch";
    puppeteer_1.default
        .launch()
        .then(function (browser) {
        return browser.newPage();
    })
        .then(function (page) {
        return page.goto(url).then(function () {
            return page.content();
        });
    })
        .then(function (html) {
        var $ = cheerio_1.default.load(html);
        var products = [];
        $(".product-listing").each(function () {
            var _a, _b, _c, _d, _e, _f;
            var product = $(this);
            var image = {
                src: (_b = (_a = product.find(".img-responsive")) === null || _a === void 0 ? void 0 : _a.attr("src")) !== null && _b !== void 0 ? _b : "",
                alt: (_d = (_c = product.find(".img-responsive").attr("alt")) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : "",
            };
            var video = {
                source: (_e = product.find("video").attr("poster")) !== null && _e !== void 0 ? _e : "",
                poster: (_f = product.find("source").attr("source")) !== null && _f !== void 0 ? _f : "",
            };
            products.push({
                image: image,
                video: video,
                href: host + product.find("a").attr("href"),
                title: product.find(".ec_click_product").text().trim(),
                description: product.find(".product-description").text().trim(),
                price: product.find(".normal-price").text(),
                merchant: "adafruit",
            });
        });
        return res.json({ data: products });
    })
        .catch(function (err) {
        console.log(err);
        //handle error
    });
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
