
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:764064350 @TheZ3ro/proxyfire
/*
              ██                                    ██                ██                
              ████                  ██                                ████        ██    
  ██          ████                              ██                    ████              
            ██████        ██      ██            ██                  ██████      ██      
  ██      ██▒▒▒▒████    ██        ████        ██████              ██▒▒▒▒████    ████    
████      ██▒▒░░▒▒██  ████      ██████        ██▒▒██              ██▒▒░░▒▒██  ██████    
██████  ██▒▒░░░░▒▒██  ████      ██▒▒▒▒██    ██▒▒░░▒▒██████      ██▒▒░░░░▒▒██  ██▒▒▒▒██  
██▒▒▒▒████▒▒░░▒▒██████▒▒▒▒██  ████░░▒▒██    ██▒▒░░▒▒██▒▒▒▒██    ██▒▒░░▒▒████████░░▒▒██  
▒▒░░▒▒████▒▒░░▒▒████▒▒░░▒▒██  ██▒▒░░▒▒██    ██░░░░▒▒▒▒░░░░▒▒██████▒▒░░▒▒██████▒▒░░▒▒████
░░░░▒▒██▒▒░░▒▒██████▒▒░░▒▒████▒▒░░░░▒▒██  ██▒▒░░▒▒██▒▒▒▒░░▒▒████▒▒░░▒▒██████▒▒░░░░▒▒████
░░░░▒▒██▒▒░░░░████▒▒░░░░▒▒████▒▒░░░░▒▒██████▒▒░░▒▒████▒▒░░░░▒▒██▒▒░░░░██████▒▒░░░░▒▒████
▒▒░░▒▒████░░░░▒▒██▒▒▒▒░░░░▒▒████▒▒░░░░▒▒████▒▒░░░░▒▒██▒▒░░▒▒██████░░░░▒▒██████▒▒░░░░▒▒██
▒▒░░▒▒██▒▒▒▒░░▒▒██▒▒▒▒░░▒▒▒▒██▒▒▒▒░░░░░░▒▒██▒▒░░░░▒▒▒▒░░░░▒▒████▒▒▒▒░░▒▒████▒▒▒▒░░░░░░▒▒
░░░░░░▒▒░░░░░░░░▒▒▒▒▒▒░░░░▒▒▒▒▒▒░░░░░░░░▒▒▒▒░░░░░░▒▒▒▒░░░░░░▒▒▒▒░░░░░░░░▒▒▒▒▒▒░░░░░░░░▒▒
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

ProxyFire (https://github.com/TheZ3ro/proxyfire)

Author: Davide TheZero <io@thezero.org>
*/


/*
int
connectx(int socket, const sa_endpoints_t *endpoints, sae_associd_t associd,
    unsigned int flags, const struct iovec *iov, unsigned int iovcnt, size_t *len,
    sae_connid_t *connid);

int connect (int sockfd, const struct sockaddr *addr, socklen_t addrlen)

typedef struct sa_endpoints {
unsigned int     sae_srcif;      /* optional source interface   *
struct sockaddr *sae_srcaddr;    /* optional source address     *
socklen_t        sae_srcaddrlen; /* size of source address      *
struct sockaddr *sae_dstaddr;    /* destination address         *
socklen_t        sae_dstaddrlen; /* size of destination address *
}sa_endpoints_t;

struct sockaddr {
__uint8_t       sa_len;         /* total length *
sa_family_t     sa_family;      /* [XSI] address family *
char            sa_data[14];    /* [XSI] addr value (actually larger) *
};
*/
const pointerSize = Process.pointerSize;
const byteSize = 1;
const AF_INET = 2;
const AF_INET6 = 30;

class Port {
    /*
     * Port class stores a 2 byte long ArrayBuffer containing the hex representation of a TCP/UDP port
     * - constructor() accept an ArrayBuffer
     * - fromInt() static function return a Port object from a decimal port value
     * - length stores the size in byte of the Port object
     * - toString() return a string representation of the port
     * - toInt() return a decimal representation of the port
     */
    constructor(port_array) {
        if (port_array?.length != Port.length) { console.error('Invalid Port length') }
        this.port = port_array;
    }
    static fromInt(port) {
        let high = Math.floor(port / 256);
        let low = port % 256;
        return new Port([high, low])
    }
    static length = 2;
    toString() {
        return this.toInt().toString()
    }
    toInt() {
        return this.port[0]*256 + this.port[1]
    }
}
class IPv4 {
    /*
     * IPv4 class stores a 4 byte long ArrayBuffer containing the hex representation of an IPv4 address
     * - constructor() accept an ArrayBuffer
     * - length stores the size (in bytes) of the IPv4 object
     * - toString() return a 4-octect string representation of the IPv4
     */
    constructor(ip_array) {
        if (ip_array?.length != IPv4.length) { console.error('Invalid IPv4 length') }
        this.octets = ip_array;
    }
    static length = 4;
    static localhost = [127, 0, 0, 1];
    toString() {
        return this.octets[0]+'.'+this.octets[1]+'.'+this.octets[2]+'.'+this.octets[3]
    }
}
class IPv6 {
    /*
     * IPv6 class stores a 16 byte long ArrayBuffer containing the hex representation of an IPv6 address
     * - constructor() accept an ArrayBuffer
     * - length stores the size (in bytes) of the IPv6 object
     * - toString() return a 8-part string representation of the IPv6
     */
    constructor(ip_array) {
        if (ip_array?.length != IPv6.length) { console.error('Invalid IPv6 length') }
        this.parts = ip_array;
    }
    static length = 16;
    static localhost = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
    toString() {
        const results = [];
        for (let i = 0; i <= 14; i += 2) {
            results.push(((this.parts[i] << 8) | this.parts[i + 1]).toString(16));
        }
        return results.join(':');
    }
}

function proxy(sockaddr_ptr, f) {
    // The proxy function accept a pointer to a sockaddr struct (AF_INET or AF_INET6 type)
    const sock = sockaddr_ptr;
    // We read the sa_len and sa_family fields
    let sa_len = sock.readU8();
    const sa_family = sock.add(byteSize*1).readU8();

    if (sa_family === AF_INET) {
        // the sockaddr is IPv4
        // if we don't have lenght information, we fix its length
        if (sa_len === 0) { sa_len = Port.length + IPv4.length; }
        // and read the sockaddr data
        const sa_data = new Uint8Array(sock.add(byteSize*2).readByteArray(sa_len));
        
        // we parse the port and the ipv4 address
        const port = new Port(sa_data.slice(0, Port.length));
        const ip = new IPv4(sa_data.slice(Port.length, Port.length+IPv4.length));
        if (port.toInt() === 80 || port.toInt() === 443) {
            // the port is either HTTP or HTTPS so needs to be proxied
            console.info('['+f+'] Proxied IPv4 request to ' + ip + ':' + port);

            //sock.add(byteSize*2).writeByteArray(port.port);
            // we write the IPv4 loopback address into the sockaddr struct
            sock.add(byteSize*(2+Port.length)).writeByteArray(IPv4.localhost);
        } else {
            console.warn('['+f+'] got AF_INET packet with port ' + port.toString())
        }
    } else if (sa_family === AF_INET6) {
        // the sockaddr is IPv6
        // fix length. in between Port and IPv6 we have the flow information
        if (sa_len === 0) { sa_len = Port.length + 4 + IPv6.length; }
        const sa_data = new Uint8Array(sock.add(byteSize*2).readByteArray(sa_len));

        // we parse the port and the ipv6 address
        const port = new Port(sa_data.slice(0, Port.length));
        const ip = new IPv6(sa_data.slice(Port.length+4, Port.length+4+IPv6.length));
        if (port.toInt() === 80 || port.toInt() === 443) {
            // the port is either HTTP or HTTPS so needs to be proxied
            console.info('['+f+'] Proxied IPv6 request to ' + ip + ' on port ' + port);

            //sock.add(byteSize*2).writeByteArray(port.port);
            // we write the IPv6 loopback address into the sockaddr struct
            sock.add(byteSize*(2+Port.length+4)).writeByteArray(IPv6.localhost);
        } else {
            console.warn('['+f+'] got AF_INET6 packet with port ' + port.toString())
        }
    }
    else {
        console.warn('['+f+'] got packet with family ' + sa_family)
    }
}

function inject_connect_syscall_hooks() {
    // hook the connectx macOS Darwin/XNU syscall
    const connectx = Module.findExportByName(null, 'connectx');
    Interceptor.attach(connectx, {
        onEnter(args) {
            // connectx accept sa_endpoints that is a struct with a pointer to the sockaddr struct
            const sa_endpoints = ptr(args[1]);
            const sae_dstaddr = sa_endpoints.add(pointerSize*3).readPointer();
            const sae_dstaddrlen = sa_endpoints.add(pointerSize*4).readInt();
            // dereference sockaddr pointer
            proxy(ptr(sae_dstaddr), 'connextx');
        }
    });
    console.info('[+] connectx syscall hook installed!');
    const connect = Module.findExportByName(null, 'connect');
    Interceptor.attach(connect, {
        onEnter(args) {
            // connect accept sockaddr struct directly
            const sockaddr = ptr(args[1]);
            proxy(sockaddr, 'connect');
        }
    });
    console.info('[+] connect syscall hook installed!');
}
inject_connect_syscall_hooks();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:764064350 @TheZ3ro/proxyfire
