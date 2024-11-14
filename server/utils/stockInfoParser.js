// utils/stockInfoParser.js
module.exports = function stockInfoParser(data) {
    console.log("Parsing data:", data); // Log incoming data
    
    try {
        const currentPrice = (Number(data["2. high"]) + Number(data["3. low"])) / 2;
        const parsedInfo = {
            price: currentPrice.toFixed(2),
            opening_price: Number(data["1. open"]).toFixed(2)
        }
        console.log("Parsed result:", parsedInfo); // Log result
        return parsedInfo;
    } catch (err) {
        console.error("Parse error:", err);
        throw err;
    }
}