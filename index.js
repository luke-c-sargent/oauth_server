// simple oauth server
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const local_creds = require('./oauth_creds.js');
const CryptoJS = require('crypto-js');

const shared_secret = local_creds.shared_secret;
const consumer_key = local_creds.consumer_key;

const port = 6666;

var _method = "POST";
var _url = "http://platform.fatsecret.com/rest/server.api";

const error_json = {
	"error":"invalid request"
};

var default_args = {
	"oauth_signature_method": "HMAC-SHA1",
	"oauth_consumer_key": consumer_key,
	"oauth_version": "1.0",
	"format":"json"
}

// HANDLE REQUESTS
function handleReq(request, response){
	var url_parse = url.parse("http://www.dummyaddr.com"+request.url);
	if ( typeof path_functions[url_parse.pathname] !== 'undefined' && url_parse){
		response.end(JSON.stringify(path_functions[url_parse.pathname](url_parse.query)));
	}
	else{
		response.end(JSON.stringify(error_json));
	}
}


// execute server
var server = http.createServer(handleReq);
server.listen(port, function(){
	// callback on success

	console.log("server listening on port " + port);
});

// HELPER FUNCTIONS


function oauth(input_string){
	var input_json = querystring.parse(input_string);
	// required arguments
	required = ["oauth_timestamp", "oauth_nonce", "method", "parameter", "search_string"];
	var _args = default_args;
	// for every element in required, add to _args; if any fail, whole operation fails
	for ( req_arg of required){
		if ( typeof input_json[req_arg] == 'undefined' ) {
			console.log("ERROR: MISSING ARGUMENT '" + req_arg + "'");
			return error_json;
		}
		if( req_arg !== 'search_string' && req_arg !== 'parameter')
			_args[req_arg] = input_json[req_arg];
	}
	_args[input_json['parameter']] = input_json['search_string'];

	// construct signature base string
    var encoded_params = encodeURIComponent( create_parameter_string(_args) );
    var encoded_url = encodeURIComponent(_url);
    var sig_base_str = _method + 
                        "&" + 
                        encoded_url + 
                        "&" + 
                        encoded_params ;
    var key = shared_secret + "&";
    var encoded = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(sig_base_str,key));
	var oauth_signature = encodeURIComponent(encoded);

	return {"oauth_signature":oauth_signature};
}

path_functions = {
	"/oauth/":oauth
}

function create_parameter_string(args){
    var keys = Object.keys(args);
    // sort by keys
    keys.sort();
    // create parameter string
    var params = "";
    for(var i=0; i< keys.length; ++i){
        var k = keys[i];
        params += (k  + "=" + args[k]+"&");
    }
    return params.substring(0, (params.length - 1) );
}

function param(arg1, arg2){
        return arg1 + "=" + arg2;
}