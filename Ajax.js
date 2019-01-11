// Compatible ie forEach function

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

    Array.prototype.forEach = function (callback, thisArg) {

        var T, k;

        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling toObject() passing the
        // |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get() internal
        // method of O with the argument "length".
        // 3. Let len be toUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If isCallable(callback) is false, throw a TypeError exception. 
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let
        // T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while (k < len) {

            var kValue;

            // a. Let Pk be ToString(k).
            //    This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty
            //    internal method of O with argument Pk.
            //    This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                // method of O with argument Pk.
                kValue = O[k];

                // ii. Call the Call internal method of callback with T as
                // the this value and argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}

// NodeList object has not forEach function
if (!NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {

        var index = 0;

        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }

        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }

        while (this.length > index) {

            var value = this[index];

            callback.call(thisArg, value, index, this);

            index++;
        }
    };
}

// var object = {
//     url: 'localhost:5000', // url require
//     method: 'get', // method 
//     requestType: 'json', // request.setRequestHeader('content-type','application/json')
//     responseType: 'json', // response.setHeader('content-type,'appliction/json')
//     sendData: 'data', // send data to server
//     successed: callback, // if successed next do callback successed use xhr.readyState === 4
//     error: callback, // if error next do callbackk error use xhr.readyState !== 4
//     processing: callback // before xhr.readyState === 4 successed running this callback
// }
// self defined Ajax function 
// has features: jsonp' feature
// @parameter: Object {}
// @return: void
var Ajax = function (object) {

    var url, method, fromOrigin, responseContent;

    var sendData = object.sendData ? object.sendData : '';

    var contentType = object.requestType ? object.requestType : 'application/x-www-form-urlencoded';

    var responseType = object.responseType ? object.responseType : '';

    if (!object.url) {
        throw new TypeError('in' + object + 'not find url property.')
    }

    fromOrigin = window.location.origin;

    url = object.url;

    method = object.method ? object.method.toUpperCase() : 'GET';

    var origin = url.split('/');

    origin = origin[0] + '//' + origin[2];

    var ajaxFunction = function () {

        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('content-type', contentType);
        // xhr.responseType = responseType;
        xhr.send(sendData);
        // 2 mintiue timeout
        // xhr.timeout = 1000 * 60 * 2;
        // resolve IE xhr.timeout InvalidStateError

        // on this place use onload event is successfull
        // onerror is error event
        // onprocess is progress event
        // xhr.onreadystatechange = function () {

        //     if (this.readyState === 4 && this.status === 200) {

        //         object.successed && (typeof object.successed === 'function') && object.successed.call(this, this.response);
        //         console.log('successed');

        //     } else if (this.status === 404 | this.status === 500) {

        //         object.error && (typeof object.error === 'function') && object.error();
        //         console.log('error');

        //     } else {

        //         object.processing && (typeof object.processing === 'function') && object.processing();
        //         console.log('processing............');

        //     }
        // };
        xhr.onload = function () {

            var responseContentType = xhr.getResponseHeader('content-type') !== null ? xhr.getResponseHeader('content-type') : ' ';

            if (responseType === 'json' && responseContentType.indexOf('application/json') !== -1) {
                responseContent = JSON.parse(this.responseText);
            } else {
                responseContent = this.responseText;
            }
            object.successed && (typeof object.successed === 'function') && object.successed.call(this, responseContent);

        };

        xhr.onprogress = function () {

            object.processing && (typeof object.processing === 'function') && object.processing();

        };

        xhr.onerror = function () {

            object.error && (typeof object.error === 'function') && object.error();

        };

    };

    var jsonpFunction = function () {

        var random = Math.floor(Math.random() * 100000);

        var functionName = 'jsonp_' + random;

        window[functionName] = function (para) {
            console.log(window[functionName]);
            object.successed && (typeof object.successed === 'function') && object.successed.call(null, para);
            html.removeChild(scriptHtml);
            console.log('success');
        };


        var html = document.documentElement;

        var scriptHtml = document.createElement('script');

        scriptHtml.src = url + '?jsonpFunction=' + functionName;

        html.appendChild(scriptHtml);


    };


    if (origin === fromOrigin) {
        ajaxFunction();
    } else {
        jsonpFunction();
        console.log('jsonp');
    }


}


// test
// Ajax({
//     url: 'http://localhost:5000/',
//     successed: function (a) {
//         console.log(a);
//     },
//     responseType: 'json'
// });
