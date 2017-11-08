module.exports = (function () {
    var data = {};
    var fs = require("fs");
    var url = require("url");

    function register(pathName, fn) {
        if (typeof fn === 'function') {
            if (typeof pathName === 'string' || pathName.startsWith("/")) {
                pathName = pathName.replace(' ', '%20');
                data[pathName] = fn;
            }else { throw new Error('url/path name id iligel'); }
        }else { throw new Error('2nd argument is not a function'); }
    };

    function router(request, response) {
        if (request && response) {
            if (typeof request.url === 'string' && response.writeHead) {


                var urlParts = url.parse(request.url);
                var urlPath = urlParts.pathname;

                if (data.hasOwnProperty(urlPath)) {
                    data[urlPath](request, response);
                } else {

                    var arr = (urlPath.match(/[^\/]+/g));
                    if (arr.length > 1) {

                        var j = arr.length - 1;
                        var params_FromTo = [];
                        params_FromTo.push(arr[arr.length - 1]);
                        while (j >= 0) {
                            var str = "";
                            for (var i = 0; i <= j; i++) {
                                str += "/" + arr[i];
                            }
                            if (data.hasOwnProperty(str)) {
                                params_FromTo.unshift(response);
                                params_FromTo.unshift(request);
                                data[str].apply(this, params_FromTo);
                            } else {
                                params_FromTo.unshift(arr[i - 1]);
                            }
                            j--;
                        }
                    } else {
                        var path = urlPath.replace("/", "");
                        fs.access(path, fs.constants.R_OK, function (err) {
                            if (!err) {
                                ReadFile(response, path);
                            } else {
                                fs.access(path + ".html", fs.constants.R_OK, function (err) {
                                    if (!err) {
                                        ReadFile(response, path + ".html");
                                    } else {
                                        pageNotFound(request, response)
                                    }
                                });
                            }
                        });
                    }
                }

            } else { throw new Error('expect for url in the request and write function in responce. dont have it!!!'); }
        } else { throw new Error('expect for two parameters (request, response). please check it!!!'); }


    };

    function getContentType(file) {
        var extensions = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".png": "image/png",
            ".gif": "image/gif",
            ".jpg": "image/jpeg"
        };
        var l = file.match(/(\.)\w+/);
        if (l !== null) {
            for (extension in extensions) {
                if (l[0] === extension) {
                    return { "content-type": extensions[extension] };
                }
            }
        } else {
            return undefined;
        }
    };

    function ReadFile(response, path) {
        var contentType = getContentType(path);
        fs.readFile(path, function (err, data) {
            response.writeHead(200, contentType);
            response.write(data);
            response.end();
        });
    };

    function pageNotFound(request, response) {
        response.writeHead(404, { "content-type": "text/html" });
        response.write("<h1>404: Page not found </h1>");
        response.end();
    }

    return {
        register: register,
        route: router,
    };

})();