
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1662295269 @oleavr/gobject-lifetime-tracker
/*
 * E.g. to attach to a running GIMP:
 *
 *   $ frida gimp-2.10 --codeshare oleavr/gobject-lifetime-tracker
 *
 * Then use GIMP's GUI to open an image, and return to the REPL and try:
 *
 *   count()
 *   summarize()
 *   list()
 *
 * You can also snapshot() and later do a diff() to see which objects are new.
 *
 * Use reset() to go back to the initial state.
 */

var ENABLE_REFLOG = false;
var MAX_REFLOG_SIZE = 3;

var instances = {};
var snapshotInstances = {};

function reset() {
  instances = {};
  snapshotInstances = {};
}

function count() {
  return Object.keys(instances).length;
}

function summarize() {
  var countByType = Object.keys(instances)
    .reduce(function (counts, handle) {
      var type = instances[handle].type;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {});

  var typeNames = Object.keys(countByType);
  typeNames.sort(function (a, b) {
    var result = countByType[b] - countByType[a];
    if (result === 0) {
      return a.localeCompare(b);
    }
    return result;
  });

  if (typeNames.length === 0) {
    console.log('No tracked objects.');
    return;
  }

  var widestTypeName = typeNames
    .reduce(function (widest, name) {
      return Math.max(name.length, widest);
    }, 0);

  var indent = '  ';
  var lines =
    [
      '',
      indent + '*** TOTAL: ' + count() + ' ***',
      '',
      indent + rightAdjust('TYPE', ' ', widestTypeName) + ' | COUNT',
      indent + rightAdjust('=', '=', widestTypeName)    + '=+========',
    ]
    .concat(typeNames.map(function (name) {
      return indent + rightAdjust(name, ' ', widestTypeName) + ' | ' + countByType[name];
    }))
    .concat([
      ''
    ]);
  console.log(lines.join('\n'));
}

function list() {
  var lines = Object.keys(instances)
    .map(function (handle) {
      var details = instances[handle];
      return handle + ': ' + JSON.stringify(details, null, 2);
    });
  console.log(lines.join('\n'));
}

function snapshot() {
  snapshotInstances = Object.keys(instances)
    .reduce(function (result, address) {
      result[address] = true;
      return result;
    }, {});
}

function diff() {
  var newInstances = Object.keys(instances)
    .filter(function (handle) {
      return !snapshotInstances.hasOwnProperty(handle);
    });

  var lines =
    ['*** ' + newInstances.length + ' new instances:']
    .concat(newInstances.map(function (handle) {
      var details = instances[handle];
      return handle + ': ' + JSON.stringify(details, null, 2);
    }));
  console.log(lines.join('\n'));
}

var _glibTypeName = null;
var _glibTypeCache = {};
var _gstListeners = {};

function initialize() {
  var glibTypeNameImpl = Module.findExportByName(null, 'g_type_name');
  if (glibTypeNameImpl === null) {
    console.error('GLib not loaded.');
    console.error('FIXME: Statically linked version could be supported by using the DebugSymbol API.');
    return;
  }

  _glibTypeName = new NativeFunction(glibTypeNameImpl, 'pointer', ['pointer']);

  hook('g_type_create_instance', {
    onLeave: function (retval) {
      instances[retval] = {
        type: glibTypeName(glibTypeFromInstance(retval)),
        creator: backtrace(this.context),
        log: []
      };
    }
  });

  if (ENABLE_REFLOG) {
    hookRefCountFunc('g_object_ref');
    hookRefCountFunc('g_object_unref');
  }

  hook('g_type_free_instance', onFree);

  var gstMiniObjectInitImpl = Module.findExportByName(null, 'gst_mini_object_init');
  if (gstMiniObjectInitImpl !== null) {
    Interceptor.attach(gstMiniObjectInitImpl, function (args) {
      var miniObject = args[0];
      var gtype = args[2];

      var free = args[5];
      if (free.isNull()) {
        return;
      }

      instances[miniObject] = {
        type: glibTypeName(gtype),
        creator: backtrace(this.context),
        log: []
      };

      var key = free.toString();
      if (_gstListeners[key] === undefined) {
        _gstListeners[key] = Interceptor.attach(free, onFree);
      }
    });

    hook('gst_mini_object_copy', {
      onLeave: function (retval) {
        instances[retval] = {
          type: glibTypeName(glibTypeFromMiniObject(retval)),
          creator: backtrace(this.context),
          log: []
        };
      }
    });

    if (ENABLE_REFLOG) {
      hookRefCountFunc('gst_mini_object_ref');
      hookRefCountFunc('gst_mini_object_unref');
    }
  }

  console.log('Ready. GStreamer detected: ' + ((gstMiniObjectInitImpl !== null) ? 'yes' : 'no'));
}

function hookRefCountFunc(name) {
  hook(name, function (args) {
    var details = instances[args[0]];
    if (details === undefined) {
      return;
    }

    var log = details.log;
    log.push({
      event: name,
      caller: backtrace(this.context)
    });
    if (log.length > MAX_REFLOG_SIZE) {
      log.shift();
    }
  });
}

function onFree(args) {
  var handle = args[0];
  delete instances[handle];
}

function glibTypeFromInstance(instance) {
  var klass = instance.readPointer();
  var gtype = klass.readPointer();
  return gtype;
}

function glibTypeFromMiniObject(miniObject) {
  var gtype = miniObject.readPointer();
  return gtype;
}

function glibTypeName(type) {
  var key = type.toString();

  var name = _glibTypeCache[key];
  if (name !== undefined) {
    return name;
  }

  name = _glibTypeName(type).readUtf8String();
  _glibTypeCache[key] = name;

  return name;
}

function hook(name, callbacks) {
  Interceptor.attach(Module.getExportByName(null, name), callbacks);
}

function backtrace(context) {
  return Thread.backtrace(context)
    .map(DebugSymbol.fromAddress)
    .map(function (symbol) {
      return symbol.toString();
    });
}

function rightAdjust(str, character, width) {
  while (str.length < width) {
    str = character + str;
  }
  return str;
}

initialize();
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1662295269 @oleavr/gobject-lifetime-tracker
