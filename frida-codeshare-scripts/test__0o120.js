
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1937184980 @0o120/test
setTimeout(function() {
    Java.perform(function() {

        var sock = Java.use("java.net.Socket");

        // Socket.bind()
        sock.bind.implementation = function(localAddress) {
            console.log("Socket.bind(" + localAddress.toString() + ")");
            sock.bind.call(this, localAddress);
        }

        // Socket.connect(endPoint)
        sock.connect.overload("java.net.SocketAddress").implementation = function(endPoint) {
            console.log("Socket.connect(" + endPoint.toString() + ")");
            sock.connect.overload("java.net.SocketAddress").call(this, endPoint);
        }

        // Socket.connect(endPoint, timeout)
        sock.connect.overload("java.net.SocketAddress", "int").implementation = function(endPoint, tmout) {
            console.log("Socket.connect(" + endPoint.toString() + ", Timeout: " + tmout + ")");
            sock.connect.overload("java.net.SocketAddress", "int").call(this, endPoint, tmout);
        }

        // Socket.getInetAddress()
        sock.getInetAddress.implementation = function() {
            ret = sock.getInetAddress.call(this);
            console.log(ret.toString() + " Socket.getInetAddress()");
            return ret;
        }

        // Socket.getInputStream()
        sock.getInputStream.implementation = function() {
            console.log("Socket.getInputStream()");
            return sock.getInputStream.call(this);
        }

        // Socket.getOutputStream()
        sock.getOutputStream.implementation = function() {
            console.log("Socket.getOutputStream()");
            return sock.getOutputStream.call(this);
        }

    });
}, 0);

/*
Author: secretdiary.ninja
License: (CC BY-SA 4.0) 
 * */

setTimeout(function() {
    Java.perform(function() {

        var sock = Java.use("java.net.Socket");

        // socket constructors

        //new Socket()
        sock.$init.overload().implementation = function() {
            console.log("new Socket() called");
            this.$init.overload().call(this);
        }

        // new Socket(inetAddress, port)
        sock.$init.overload("java.net.InetAddress", "int").implementation = function(inetAddress, port) {
            console.log("new Socket('" + inetAddress.toString() + "', " + port + ") called");
            this.$init.overload("java.net.InetAddress", "int").call(this, inetAddress, port);
        }

        // new Socket(inetAddress address, port, localInetAddress, localPort)
        sock.$init.overload("java.net.InetAddress", "int", "java.net.InetAddress", "int").implementation = function(inetAddress, port, localInet, localPort) {
            console.log("new Socket(RemoteInet: '" + inetAddress.toString() + "', RemotePort" + port + ", LocalInet: '" + localInet + "', LocalPort: " + localPort + ") called");
            this.$init.overload("java.net.InetAddress", "int", "java.net.InetAddress", "int").call(this, inetAddress, port);
        }

        // new Socket(Proxy)
        sock.$init.overload("java.net.Proxy").implementation = function(proxy) {
            console.log("new Socket(Proxy: '" + proxy.toString() + "') called");
            this.$init.overload("java.net.Proxy").call(this, proxy);
        }

        // new Socket(SocketImp)
        sock.$init.overload("java.net.SocketImpl").implementation = function(si) {
            console.log("new Socket(SocketImpl: '" + si.toString() + "') called");
            this.$init.overload("java.net.SocketImpl").call(this, si);
        }

        // new Socket(host, port, localInetAddr, localPort)
        sock.$init.overload("java.lang.String", "int", "java.net.InetAddress", "int").implementation = function(host, port, localInetAddress, localPort) {
            console.log("new Socket(Host: '" + host + "', RemPort: " + port + ", LocalInet: '" + localInetAddress + "', localPort: " + localPort + ") called");
            this.$init.overload("java.lang.String", "int", "java.net.InetAddress", "int").call(this, si);
        }


    });
}, 0);
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:1937184980 @0o120/test
