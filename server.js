var http = require("http");
var hostName = "localhost";
var port = 8888;
var router = require("./router");
var idList = [];
var usersMemory = [];
var dataBase;
var fs = require("fs");

function loadShop(request, response) {
    var result = fs.readFileSync("index.html");
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(result);
    response.end();
}

function loadShopFirst(request, response) {
    var result = fs.readFileSync("index.html");
    // var jsonString = fs.readFileSync("./api/products.json", "utf8");
    dataBase = fs.readFileSync("./api/products.json", "utf8");
    var tempObject = JSON.parse(dataBase);
     for (var cat in tempObject) {
        router.register("/" + cat, loadAllProducts);
    }
    
    response.writeHead(302, { location:'/comics' });
    response.end();
}

function loadAllProducts(request, response, from, to , path){
    if(from){
        // var jsonString = fs.readFileSync("./api/products.json", "utf8");
        var jsonString = dataBase;
        var tempObject = JSON.parse(jsonString);
        var tempCategoryName = request.url;
        var categoryName = tempCategoryName.replace('/', '');
        var cleanCategoryName = categoryName.split('/')[0];
        var categoryObject = tempObject[cleanCategoryName];
        tempObject = categoryObject.slice(parseInt(from), parseInt(to) + 1);
        var tempResult = JSON.stringify(tempObject);
        response.writeHead(200, { "Content-type": "application/json" });
        response.write(tempResult);
        response.end();
    }else{
        loadShop(request, response);
    }
}

function askForId(request,response) {
    var newId = idList.length+1;
    idList.length++;
    var result = JSON.stringify({'cartUserId':newId});
    response.writeHead(200, { 'Content-type': 'application/json' });
    response.write(result);
    response.end();
}

function askCart(request,response, id){
    var usersMemoryIndex = id - 1;
    if(usersMemory[ usersMemoryIndex ]){
        var tempResult = usersMemory[usersMemoryIndex].substring(0, usersMemory[usersMemoryIndex].length-2);
        response.writeHead(200, { 'Content-type': 'application/json' });
        response.write(tempResult);
        response.end();
    }
}

function saveCart(request,response, urlExt){
    var urlParsed = decodeURI(urlExt);
    var index = urlParsed.substr(urlParsed.length - 1) - 1;
    usersMemory[index] = urlParsed;
}

function categoriesInShop(request,response){
    var jsonString = dataBase;
    response.writeHead(200, { 'Content-type': 'application/json' });
    response.write(jsonString);
    response.end();
}

router.register("/", loadShopFirst);
router.register("/askId", askForId);
router.register("/askCart", askCart);
router.register("/serverCart", saveCart);
router.register("/askForCategories", categoriesInShop);


http.createServer(onRequest).listen(port, hostName).on("connection", function (socket) {
    // console.log("socket :" + JSON.stringify(socket.address()))
});

function onRequest(request, response) {
    router.route(request, response);
}