var http = require("http");
var hostName = "localhost";
var port = 8888;
var router = require("./router");

function loadShop(request, response) {
    var fs = require("fs");
    var result = fs.readFileSync("index.html");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(result);
    response.end();
}

function loadAllProducts(request, response, from, to) {
    var fs = require("fs");
    var jsonString = fs.readFileSync("./api/products.json", "utf8");
    var tempObject = JSON.parse(jsonString);
    tempObject = tempObject.slice(parseInt(from), parseInt(to) + 1);
    var result = JSON.stringify(tempObject);
    response.writeHead(200, { "Content-type": "application/json" });
    response.write(result);
    response.end();
}

router.register("/api/products", loadAllProducts)
router.register("/", loadShop);

http.createServer(onRequest).listen(port, hostName).on("connection", function (socket) {
    // console.log("socket :" + JSON.stringify(socket.address()))
});

function onRequest(request, response) {
    router.route(request, response);
}