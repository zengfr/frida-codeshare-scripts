/* 
 * Log okhttp3 http(s) communication
 *
 * Targeted application must use RetryAndFollowUpInterceptor, which this
 * script overloads. 
 *
 * By default uses `console.log()`. If an error is caught during processing,
 * uses `console.warn()`.
 *
 * Requests and responses are by default formatted with JSON.stringify().
 *
 * Additionally accepts parameters:
 * 
 * `{"format": "text"}` - output is formated in curl-like text
 *
 * `{"raw": true}` - includes representation of original request and response
 * objects
 *
 * Original Git Repository: https://github.com/scrool/frida-okhttp3-log-retry-and-followup-requests
 * 
 * Author: Pavol Babinčák <scroolik@gmail.com>
 *
 * License: MIT
 *
 */

'use strict';

function process_request(request) {
    var request_msg = {
        request: request.toString(),
        method: request.method().toString(),
        url: request.url().toString(),
        headers: request.headers().toString().split('\n').filter(Boolean),
        errors: [],
    };
    var requestBody = request.body();
    var requestContentLength = requestBody ? requestBody.contentLength() : 0;
    if (requestContentLength >= 0) {
        request_msg.length = requestContentLength;
    }
    if (requestContentLength === 0) {
        return request_msg;
    }
    var Buffer = Java.use("okio.Buffer");
    var buffer = Buffer.$new();
    try {
        requestBody.writeTo(buffer);
    } catch (error) {
        request_msg.errors = request_msg.errors.concat({
            message: error,
            place: "Write buffer body",
        });
    }

    var Utf8Kt = Java.use('okhttp3.logging.Utf8Kt');
    if (Utf8Kt.isProbablyUtf8(buffer)) {
        try {
            request_msg.body = buffer.readUtf8();
        } catch (error) {
            request_msg.errors = request_msg.errors.concat({
                message: error,
                place: "Decoding UTF-8",
            });
        }
    } else {
        try {
            var ByteString = Java.use("com.android.okhttp.okio.ByteString");
            request_msg.bodyByteArrayHex = ByteString.of(buffer.readByteArray()).hex();
        } catch (error) {
            request_msg.errors = request_msg.errors.concat({
                message: error,
                place: "Reading ByteArray as hex",
            });
        }
    }
    return request_msg;
}

function process_response(response) {
    var response_msg = {
        response: response.toString(),
        protocol: response.protocol().toString(),
        code: response.code().toString(),
        message: response.message().toString(),
        headers: response.headers().toString().split('\n').filter(Boolean),
        errors: [],
    };
    var responseBody = response.body();
    var responseContentLength = responseBody ? responseBody.contentLength() : 0;
    if (responseContentLength >= 0) {
        response_msg.length = responseContentLength;
    }
    if (responseContentLength === 0) {
        return response_msg;
    }
    var source = responseBody.source();
    var content_encoding = response.headers().get("Content-Encoding");
    var buffer;
    if (content_encoding == "gzip") {
        var GzipSource = Java.use('okio.GzipSource');
        var Buffer = Java.use("okio.Buffer");
        buffer = Buffer.$new();
        try {
            var gzipSourceObj = GzipSource.$new(source);
            buffer.writeAll(gzipSourceObj);
        } catch (error) {
            response_msg.errors = response_msg.errors.concat({
                message: error,
                place: "Ungzip",
            });
        }
    } else {
        buffer = source.getBuffer();
    }
    var Utf8Kt = Java.use('okhttp3.logging.Utf8Kt');
    if (Utf8Kt.isProbablyUtf8(buffer)) {
        try {
            response_msg.body = source.readUtf8();
        } catch (error) {
            response_msg.errors = response_msg.errors.concat({
                message: error,
                place: "Decoding UTF-8",
            });
        }
    } else {
        try {
            var ByteString = Java.use("com.android.okhttp.okio.ByteString");
            response_msg.bodyByteArrayHex = ByteString.of(source.readByteArray()).hex();
        } catch (error) {
            response_msg.errors = response_msg.errors.concat({
                message: error,
                place: "Reading ByteArray as hex",
            });
        }
    }
    return response_msg;
}


class TEXT {
    constructor(debug_raw = false) {
        this.debug_raw = debug_raw;
    }

    stringify_request(request) {
        let lines = [];
        if (this.debug_raw && request.request) {
            lines.push("[*] Request: " + JSON.stringify(request.request));
        }
        lines.push("[>] " + request.method + " " + request.url);
        if (request.headers && request.headers.length > 0) {
            lines.push("[>] " + request.headers.join("\n[>] "));
        }
        if (request.length) {
            lines.push("[*] Request Length: " + request.length);
        }
        if (request.body) {
            lines.push("[*] Request Body: " + request.body);
        } else if (request.bodyByteArrayHex) {
            lines.push("[*] Request Body ByteArray hex: " + request.bodyByteArrayHex);
        }
        for (var i = 0; i < request.errors.length; i++) {
            lines.push("[!] Request Error #" + i + " Message: " + request.errors[i].message);
            lines.push("[!] Request Error #" + i + " Place: " + request.errors[i].place);
        }
        return lines;
    }

    stringify_response(response) {
        let lines = [];
        if (this.debug_raw && response.response) {
            lines.push("[*] Response: " + JSON.stringify(response.response));
        }
        lines.push("[<] " + response.protocol + " " + response.code + " " + response.message);
        if (response.headers && response.headers.length > 0) {
            lines.push("[<] " + response.headers.join("\n[<] "));
        }
        if (response.length) {
            lines.push("[*] Response Length: " + response.length);
        }
        if (response.body) {
            lines.push("[*] Response Body: " + response.body);
        } else if (response.bodyByteArrayHex) {
            lines.push("[*] Response Body ByteArray hex: " + response.bodyByteArrayHex);
        }
        for (var i = 0; i < response.errors.length; i++) {
            lines.push("[!] Response Error #" + i + " Message: " + response.errors[i].message);
            lines.push("[!] Response Error #" + i + " Place: " + response.errors[i].place);
        }
        return lines;
    }

    stringify(input) {
        let msg = [];
        if (input.request) {
            msg = msg.concat(this.stringify_request(input.request));
        }
        if (input.response) {
            if (msg.length > 0) {
                msg.push("[*]");
            }
            msg = msg.concat(this.stringify_response(input.response));
        }
        if (msg.length > 0) {
            msg.push("[*] ---");
        }
        return msg.join("\n");
    }
}

function hook_retry_and_follow_up_interceptor(output_func) {
    var RetryAndFollowUpInterceptor = Java.use(
        "okhttp3.internal.http.RetryAndFollowUpInterceptor"
    );
    var followUpRequest = RetryAndFollowUpInterceptor.followUpRequest.overload(
        'okhttp3.Response',
        'okhttp3.internal.connection.Exchange'
    );
    followUpRequest.implementation = function(response, exchange) {
        var request_msg = {
            errors: []
        };
        var response_msg = {
            errors: []
        };
        try {
            request_msg = process_request(response.request());
        } catch (error) {
            request_msg.errors = request_msg.errors.concat({
                message: error,
                place: "Uncaugth process_request",
            });
        }
        try {
            response_msg = process_response(response);
        } catch (error) {
            response_msg.errors = response_msg.errors.concat({
                message: error,
                place: "Uncaugth process_response",
            });
        }
        output_func({
            request: request_msg,
            response: response_msg
        });
        return followUpRequest.call(this, response, exchange);
    };
}

function format_output(input, format = "json", raw = false) {
    var msg;
    if (format == "text") {
        msg = new TEXT(raw).stringify(input);
    } else {
        msg = JSON.stringify(input);
    }
    if ((input.request && input.request.errors.length > 0) || (input.response && input.response.errors.length > 0)) {
        console.warn(msg);
    } else {
        console.log(msg);
    }
}

rpc.exports = {
    init: function(stage, parameters) {
        var output_func = function(input) {
            format_output(input, parameters.format, parameters.raw);
        };

        // Wait until Java is available. Attempt to avoid process crash: Bad access due
        // to invalid address
        // Possibly https://github.com/frida/frida/issues/1091 ?
        let interval = setInterval(function() {
            if (Java.available) {
                clearInterval(interval);
                Java.perform(function() {
                    hook_retry_and_follow_up_interceptor(output_func);
                });
            }
        }, 1);
    },
};
//https://github.com/zengfr/frida-codeshare-scripts
//-804813603 @scrool/okhttp3-log-retry-and-follow-up-requests