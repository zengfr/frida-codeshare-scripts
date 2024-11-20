
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1414886825 @oleavr/who-does-it-call
/*
 * To find out who the function at 0x1234 calls the next time it is called:
 *   start(ptr('0x1234'))
 *
 * Or to ask the same question about one or more Objective-C methods, whichever is called first:
 *   start('-[LicenseManager *]')
 *
 * Or any exported function named open:
 *   start('exports:*!open*')
 */

let listeners = [];
let activated = false;

function start (target) {
  stop();

  if (typeof target === 'string') {
    const pattern = target;

    const resolver = new ApiResolver((pattern.indexOf(' ') === -1) ? 'module' : 'objc');
    const matches = resolver.enumerateMatchesSync(pattern);
    if (matches.length === 0) {
      throw new Error('No matching methods found');
    }

    for (const {name, address} of matches)
      stalkMethod(name, address);
  } else {
    stalkMethod(target.toString(), target);
  }
}

function stop () {
  for (const listener of listeners)
    listener.detach();
  listeners = [];
  activated = false;
}

function stalkMethod (name, impl) {
  console.log('Stalking next call to ' + name);

  const listener = Interceptor.attach(impl, {
    onEnter(args) {
      if (activated) {
        return;
      }
      activated = true;

      const targets = {};
      this.targets = targets;

      console.log(`\n\nStalker activated: ${name}`);
      Stalker.follow({
        events: {
          call: true
        },
        onCallSummary(summary) {
          for (const [target, count] of Object.entries(summary))
            targets[target] = (targets[target] ?? 0) + count;
        }
      });
    },
    onLeave(reval) {
      const {targets} = this;
      if (targets === undefined) {
        return;
      }

      Stalker.flush();
      Stalker.unfollow();
      console.log(`Stalker deactivated: ${name}`);

      printSummary(targets);
    }
  });
  listeners.push(listener);
}

function printSummary (targets) {
  const items = [];
  let total = 0;
  for (const [target, count] of Object.entries(targets)) {
    const name = DebugSymbol.fromAddress(ptr(target)).toString();
    const tokens = name.split(' ', 2).map(t => t.toLowerCase());
    items.push([name, count, tokens]);
    total += count;
  }
  items.sort((a, b) => {
    const tokensA = a[2];
    const tokensB = b[2];
    if (tokensA.length === tokensB.length) {
      return tokensA[tokensA.length - 1].localeCompare(tokensB[tokensB.length - 1]);
    } else if (tokensA.length > tokensB.length) {
      return -1;
    } else {
      return 1;
    }
  });

  if (items.length > 0) {
    console.log('');
    console.log('COUNT\tNAME');
    console.log('-----\t----');
    for (const [name, count] of items)
      console.log(`${count}\t${name}`);
  }

  console.log('');
  console.log('Unique functions called: ' + items.length);
  console.log('   Total function calls: ' + total);
  console.log('');
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-1414886825 @oleavr/who-does-it-call
