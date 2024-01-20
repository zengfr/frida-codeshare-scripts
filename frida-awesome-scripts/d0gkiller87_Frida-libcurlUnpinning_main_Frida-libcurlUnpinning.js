/*
  you can find more enums from:
  https://github.com/curl/curl/blob/master/packages/OS400/curl.inc.in
*/

const CURLOPT_CUSTOMREQUEST = 10036;
const CURLOPT_URL = 10002;
const CURLOPT_POSTFIELDS = 10015;
const CURLOPT_HTTPHEADER = 10023;

const CURLOPT_SSL_VERIFYPEER = 64;
const CURLOPT_SSL_VERIFYHOST = 81;
const CURLOPT_PINNEDPUBLICKEY = 10230;

const NUL = ptr( '0x00' );

function hook_curl_easy_setopt( _export ) {
    Interceptor.attach( _export , {
        onEnter: function ( args ) {
            let opt = args[1].toInt32();

            // log requests for a quick view
            switch ( opt ) {
                case CURLOPT_CUSTOMREQUEST:
                    console.log( `Method = ${ args[2].readCString() }` );
                break;
                case CURLOPT_URL:
                    console.log( `URL = ${ args[2].readCString() }` );
                break;
                case CURLOPT_POSTFIELDS:
                    console.log( 'Method = POST' );
                break;
            }

            // skip options related to ssl pinning
            if (
                opt == CURLOPT_SSL_VERIFYPEER ||
                opt == CURLOPT_SSL_VERIFYHOST ||
                opt == CURLOPT_PINNEDPUBLICKEY
            ){
                args[2] = NUL;
                console.log( `[+] Bypassed libcurl SSL Pinning ( opt = ${opt} )` );
            }
        }
    });
}

function main() {
    let is_curl_located = false;
    let modules = Process.enumerateModules();

    for ( let _module of modules ) {
        let _export = _module.findExportByName( 'curl_easy_setopt' );

        if ( _export != null ) {
            is_curl_located = true;
            console.log( `[+] Located curl_easy_setopt in ${_module.name}` )
            hook_curl_easy_setopt( _export );
        }
    }

    if ( !is_curl_located ) {
        console.log( '[-] Cannot locate export curl_easy_setopt' );
    }
}

Java.perform(
    main()
);