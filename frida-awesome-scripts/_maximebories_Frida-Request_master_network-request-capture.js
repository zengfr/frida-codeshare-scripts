// Copyright (C) 2023 Maxime Bories
// 
// This file is part of Frida-Request.
// 
// Frida-Request is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Frida-Request is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Frida-Request.  If not, see <http://www.gnu.org/licenses/>.

// Capture network requests using NSURLSession
function captureNetworkUsingNSURL() {
	try {
		var className = "NSURLSession";
		var funcName = "- dataTaskWithRequest:completionHandler:";
		var requestMethodHook = eval('ObjC.classes.' + className + '["' + funcName + '"]');

		Interceptor.attach(requestMethodHook.implementation, {
			onEnter: function (args) {
				// Get the request object
				var request = new ObjC.Object(args[2]);

				// Get the request method (e.g., GET, POST)
				var requestMethod = request.HTTPMethod;

				// Get the request URL
				var requestURL = request.URL;

				// Get the request body
				var requestBody = request.HTTPBody;

				// Print the captured data to the console
				console.log('{\n\t"interceptor" : "NSURLSession",');
				console.log('\t"requestType" : "' + requestMethod + '",');
				console.log('\t"url" : "' + requestURL + '",');
				console.log('\t"body" : "' + requestBody + '",');
			},
			onLeave: function (retVal) {
				// Get the response object
				var response = new ObjC.Object(retVal).response();

				// Get the response status code
				var responseStatusCode = response.statusCode;

				// Get the response body
				var responseBody = response.body;

				// Print the captured data to the console
				console.log('\t"responseStatusCode" : "' + responseStatusCode + '",');
				console.log('\t"responseBody" : "' + responseBody + '"\n\},');
			},
		});
	} catch (error) {
		console.log(error);
	}
}

// Capture network requests using NSURLConnection
function captureNetworkUsingNSURLConnection() {
	if (ObjC.available) {
		try {
			var className = "NSURLConnection";
			var funcName = "+ sendSynchronousRequest:returningResponse:error:";
			var requestMethodHook = eval('ObjC.classes.' + className + '["' + funcName + '"]');

			Interceptor.attach(requestMethodHook.implementation, {
				onEnter: function (args) {
					// Get the request object
					var request = new ObjC.Object(args[2]);

					// Get the request method
					var requestMethod = request.HTTPMethod;

					// Get the request URL
					var requestURL = request.URL;

					// Get the request body
					var requestBody = request.HTTPBody;

					// Print the captured data to the console
					console.log('{\n\t"interceptor" : "NSURLConnection",');
					console.log('\t"requestType" : "' + requestMethod + '",');
					console.log('\t"url" : "' + requestURL + '",');
					console.log('\t"body" : "' + requestBody + '"\n\},');
				},
			});
		} catch (error) {
			console.log(error);
		}
	}
}

// Capture network requests using AFHTTPSessionManager
function captureNetworkUsingAFHTTPSessionManager() {
	try {
		var className = "AFHTTPSessionManager";
		var funcName = "- POST:parameters:success:failure:";
		var requestMethodHook = eval('ObjC.classes.' + className + '["' + funcName + '"]');

		Interceptor.attach(requestMethodHook.implementation, {
			onEnter: function (args) {
				// Get the request URL
				var requestURL = new ObjC.Object(args[4]).URL;

				// Get the request body
				var requestBody = new ObjC.Object(args[2]);

				// Print the captured data to the console
				console.log('{\n\t"interceptor" : "AFHTTPSessionManager",');
				console.log('\t"requestType" : "POST",');
				console.log('\t"url" : "' + requestURL + '",');
				console.log('\t"body" : "' + requestBody + '",');
			},
			onLeave: function (retVal) {
				// Get the response object
				var response = new ObjC.Object(retVal).response();

				// Get the response status code
				var responseStatusCode = response.statusCode;

				// Get the response body
				var responseBody = response.body;

				// Print the captured data to the console
				console.log('\t"responseStatusCode" : "' + responseStatusCode + '",');
				console.log('\t"responseBody" : "' + responseBody + '"\n\},');
			},
		});
	} catch (error) {
		console.log(error);
	}
}

// Capture network requests using Alamofire
function captureNetworkUsingAlamofire() {
	try {
		var className = "Alamofire.SessionManager";
		var funcName = "- dataTaskWithRequest:uploadProgress:downloadProgress:completionHandler:";
		var requestMethodHook = eval('ObjC.classes.' + className + '["' + funcName + '"]');

		Interceptor.attach(requestMethodHook.implementation, {
			onEnter: function (args) {
				// Get the request object
				var request = new ObjC.Object(args[2]);

				// Get the request method
				var requestMethod = request.method;

				// Get the request URL
				var requestURL = request.URL;

				// Get the request body
				var requestBody = request.HTTPBody;

				// Print the captured data to the console
				console.log('{\n\t"interceptor" : "Alamofire",');
				console.log('\t"requestType" : "' + requestMethod + '",');
				console.log('\t"url" : "' + requestURL + '",');
				console.log('\t"body" : "' + requestBody + '",');
			},
			onLeave: function (retVal) {
				// Get the response object
				var response = new ObjC.Object(retVal).response();

				// Get the response status code
				var responseStatusCode = response.statusCode();

				// Get the response body
				var responseBody = response.body().toString();

				// Print the captured data to the console
				console.log('\t"responseStatusCode" : "' + responseStatusCode + '",');
				console.log('\t"responseBody" : "' + responseBody + '"\n\},');
			},
		});
	} catch (error) {
		console.log(error);
	}
}

function captureNetworkUsingVolley() {
	try {
		var className = "com.android.volley.RequestQueue";
		var funcName = "+ add:tag:";
		var requestMethodHook = eval('Java.use("' + className + '").' + funcName);

		requestMethodHook.implementation = function (request, tag) {
			// Get the request URL
			var requestURL = request.getUrl();

			// Get the request method
			var requestMethod = request.getMethod();

			// Get the request body
			var requestBody = request.getBody();

			// Print the captured data to the console
			console.log('{\n\t"interceptor" : "Volley",');
			console.log('\t"requestType" : "' + requestMethod + '",');
			console.log('\t"url" : "' + requestURL + '",');
			console.log('\t"body" : "' + requestBody + '",');

			// Call the original implementation
			this.add(request, tag);
		};
	} catch (error) {
		console.log(error);
	}
}

// Main function to execute all the capturing functions
function main(captureVolley, captureAFNetworking, captureAlamoFire) {
	// Check if Java is available (Android)
	if (Java.available) {
		// Capture network requests using Volley
		captureNetworkUsingVolley();
	}
	// Check if ObjC is available (iOS/iPadOS/macOS/tvOS/watchOS/bridgeOS)
	else if (ObjC.available) {
		// Capture network requests using NSURL
		captureNetworkUsingNSURL();

		// Capture network requests using NSURLConnection
		captureNetworkUsingNSURLConnection();
	} else {
		console.log("Unsupported platform");
	}

	// Check if AFNetworking is available and captureAFNetworking flag is set
	if (Module.findExportByName("AFNetworking") && captureAFNetworking) {
		// Capture network requests using AFHTTPSessionManager
		captureNetworkUsingAFHTTPSessionManager();
	}

	// Check if AlamoFire is available and captureAlamoFire flag is set
	if (Module.findExportByName("Alamofire") && captureAlamoFire) {
		// Capture network requests using AlamoFire
		captureNetworkUsingAlamoFire();
	}

	// Check if Volley is available and captureVolley flag is set
	if (Module.findExportByName("com.android.volley.Request") && captureVolley) {
		// Capture network requests using Volley
		captureNetworkUsingVolley();
	}
}

// Set the flags to specify which network request methods to capture
var captureVolley = false;
var captureAFNetworking = true;
var captureAlamoFire = true;

// Execute the main function
main(captureVolley, captureAFNetworking, captureAlamoFire);