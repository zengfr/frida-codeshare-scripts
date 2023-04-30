/*
    About:
        Script for dynamically tracing Java function calls within a given package.
        If you get any errors try increasing or decreasing the timeout.
        Be aware that some errors may be due to tampering protection.

        The program won't look for the exact same package you entered, instead it'll
        verify if any class definition contains the `package` string (work as a filter).

    Documentation:
        - `printSummary` prints the summary of all the classes and methods
        that exist within the chosen scope.

        - `printDefinition` prints the full definition (aka signature)
        of the method (including package, return type, and argument types).

        - `printArgs` prints the argument values passed during method calls.

        - `printReturn` prints the return value passed during method calls.

        - `excludeStrings` ignores any string within the searching scope.

        - `timeout` is self explanatory.
    
    Run:
        frida -U -f com.example.app -l trace.js
*/

var config = {
    package: 'com.example.app',
    printSummary: true,
    printDefinition: true,
    printArgs: true,
    printReturn: true,
    excludeStrings: [],
    timeout: 500
};
var levels = {
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR'
};
var colors = {
    reset: '\x1b[39;49;00m',
    black: '\x1b[30;01m',
    blue: '\x1b[34;01m',
    cyan: '\x1b[36;01m',
    gray: '\x1b[37;11m',
    green: '\x1b[32;01m',
    purple: '\x1b[35;01m',
    red: '\x1b[31;01m',
    yellow: '\x1b[33;01m',
    light: {
        black: '\x1b[30;11m',
        blue: '\x1b[34;11m',
        cyan: '\x1b[36;11m',
        gray: '\x1b[37;01m',
        green: '\x1b[32;11m',
        purple: '\x1b[35;11m',
        red: '\x1b[31;11m',
        yellow: '\x1b[33;11m'
    }
};

function log (level, text) {
    console.log(
        `${
            level === levels.info
                ? colors.light.blue
                : level === levels.warn
                ? colors.light.yellow
                : colors.light.red
        }[${level}]${colors.reset} ${text}`
    );
}

function tracePackage () {
    console.log();
    Java.enumerateLoadedClassesSync()
        .filter(c => c.includes(config.package))
        .forEach(c => {
            try {
                if (config.printSummary) {
                    log(levels.info, `+ Class: ${c}`);
                }

                if (
                    config.excludeStrings.filter(e => c.toString().includes(e))
                        .length
                ) {
                    return;
                }

                var obj = Java.use(c);
                var methods = obj.class.getDeclaredMethods();
                methods.forEach(m => {
                    var name = m.getName();
                    var method = obj[name];
                    if (!method) {
                        return;
                    }

                    if (config.printSummary) {
                        log(levels.info, `\t\t- Method: ${name}`);
                    }

                    var overloads = method.overloads;
                    for (var overload of overloads) {
                        overload.implementation = function () {
                            log(
                                levels.warn,
                                `+ Call: ${
                                    config.printDefinition
                                        ? m
                                        : m.getDeclaringClass().getName() +
                                          '.' +
                                          name
                                }`
                            );

                            if (config.printArgs) {
                                var i = 0;
                                for (var arg of arguments) {
                                    if (arg !== null && arg !== undefined) {
                                        log(
                                            levels.warn,
                                            `\t\t- Args[${i}]: ${arg.toString()}`
                                        );
                                    }

                                    i++;
                                }
                            }

                            var ret = this[name].apply(this, arguments);
                            if (config.printReturn) {
                                if (ret !== null && ret !== undefined) {
                                    log(
                                        levels.warn,
                                        `\t\t- Return: ${ret.toString()}`
                                    );
                                }
                            }
                            return ret;
                        };
                    }
                });
            } catch (e) {
                log(levels.error, e);
            }
        });
}

setTimeout(function () {
    Java.perform(function () {
        tracePackage();
    });
}, config.timeout);
//https://github.com/zengfr/frida-codeshare-scripts
//517407478 @d3z3n0v3/trace-function-calls