const https = require("https");
const http = require("http");
const querystring = require("querystring"); 

module.exports.fetch =
function fetch({path, method="GET", headers={}, data=null, hostname, protocol="http:", port=80}) {
    const options = {
        protocol,
        hostname,
        port,
        path,
        method,
        headers
    };

    let proto = http;
    switch (protocol) {
        case "http:":
            proto = http;
            break;
        case "https:":
            proto = https;
            break;
    }

    switch (method) {
        case "GET":
            options.path += "?" + querystring.stringify(data);
            break;
        case "POST": // Do not forget about "Content-Type".
            if (data !== null) {
                data = JSON.stringify(data);
                options.headers["Content-Length"] = Buffer.byteLength(data);
            }
            break;
    }

    return new Promise((resolve, reject) => {
        const req = proto.request(options, res => {
                res.setEncoding("utf8")
                    .on("error", (err) => reject(e))
                    .on("data", (data) => {
                        resolve(data);
                    })
            }
        ).on("error", (e) => reject(e))

        switch (method) {
            case "POST":
                if (data !== null) req.write(data);
                break;
        }

        req.end();
    });
}
