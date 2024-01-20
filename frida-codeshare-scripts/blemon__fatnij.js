
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:660269779 @fatnij/blemon
if (Java.available) {
  Java.perform(function () {
    const BTGattCB = Java.use('android.bluetooth.BluetoothGattCallback')
    // https://github.com/frida/frida/issues/310#issuecomment-462447292
    BTGattCB.$init.overload().implementation = function () {
      console.log(
        '[+] BluetoothGattCallback constructor called from ' + this.$className
      )
      const NewCB = Java.use(this.$className)
      NewCB.onCharacteristicRead.implementation = function (g, c, s) {
        const retVal = NewCB.onCharacteristicRead.call(this, g, c, s)
        const uuid = c.getUuid()
        console.log(
          Color.Blue +
            '[BLE Read   <=]' +
            Color.Light.Black +
            ' UUID: ' +
            uuid.toString() +
            Color.Reset +
            ' data: ' +
            Java.use('java.lang.String').$new(c.getValue())
        )
        return retVal
      }
      NewCB.onCharacteristicWrite.implementation = function (g, c, s) {
        const retVal = NewCB.onCharacteristicWrite.call(this, g, c, s)
        const uuid = c.getUuid()
        console.log(
          Color.Green +
            '[BLE Write  =>]' +
            Color.Light.Black +
            ' UUID: ' +
            uuid.toString() +
            Color.Reset +
            // ' data: 0x' +
            // bytes2hex(c.getValue())
            ' decode: ' +
            Java.use('java.lang.String').$new(c.getValue())
        )
        return retVal
      }
      NewCB.onCharacteristicChanged.implementation = function (g, c) {
        const retVal = NewCB.onCharacteristicChanged.call(this, g, c)
        const uuid = c.getUuid()
        console.log(
          Color.Cyan +
            '[BLE Notify <=]' +
            Color.Light.Black +
            ' UUID: ' +
            uuid.toString() +
            Color.Reset +
            // ' data: 0x' +
            // bytes2hex(c.getValue()) +
            ' decode: ' +
            Java.use('java.lang.String').$new(c.getValue())
        )
        return retVal
      }
      return this.$init()
    }
  }) // end perform
} else if (ObjC.available) {
  Interceptor.attach(
    ObjC.classes.CBPeripheral['- writeValue:forCharacteristic:type:']
      .implementation,
    {
      onEnter: function (args) {
        const data = new ObjC.Object(args[2])
        const CBChar = new ObjC.Object(args[3])
        const dataBytes = Memory.readByteArray(data.bytes(), data.length())
        const b = new Uint8Array(dataBytes)
        const hexData = ''
        for (let i = 0; i < b.length; i++) {
          hexData += pad(b[i].toString(16), 2)
        }
        console.log(
          Color.Green +
            '[BLE Write  =>]' +
            Color.Light.Black +
            ' UUID: ' +
            CBChar.$ivars['_UUID'] +
            Color.Reset +
            ' data: 0x' +
            hexData
        )
      },
    }
  ) //end Interceptor
  Interceptor.attach(ObjC.classes.CBCharacteristic['- value'].implementation, {
    onEnter: function (args) {
      const CBChar = new ObjC.Object(args[0])
      // turns <12 34> into 1234
      let data = CBChar.$ivars['_value']
      if (data != null) {
        data = data.toString().replace(/ /g, '').slice(1, -1)
      }
      if (CBChar.$ivars['_isNotifying'] === true) {
        console.log(
          Color.Cyan +
            '[BLE Notify <=]' +
            Color.Light.Black +
            ' UUID: ' +
            CBChar.$ivars['_UUID'] +
            Color.Reset +
            ' data: 0x' +
            data
        )
      } else {
        console.log(
          Color.Blue +
            '[BLE Read   <=]' +
            Color.Light.Black +
            ' UUID: ' +
            CBChar.$ivars['_UUID'] +
            Color.Reset +
            ' data: 0x' +
            data
        )
      }
    },
  }) //end Interceptor
}

const Color = {
  Reset: '\x1b[39;49;00m',
  Black: '\x1b[30;01m',
  Blue: '\x1b[34;01m',
  Cyan: '\x1b[36;01m',
  Gray: '\x1b[37;11m',
  Green: '\x1b[32;01m',
  Purple: '\x1b[35;01m',
  Red: '\x1b[31;01m',
  Yellow: '\x1b[33;01m',
  Light: {
    Black: '\x1b[30;11m',
    Blue: '\x1b[34;11m',
    Cyan: '\x1b[36;11m',
    Gray: '\x1b[37;01m',
    Green: '\x1b[32;11m',
    Purple: '\x1b[35;11m',
    Red: '\x1b[31;11m',
    Yellow: '\x1b[33;11m',
  },
}
// thanks: https://awakened1712.github.io/hacking/hacking-frida/
function bytes2hex(array) {
  let result = ''
  for (let i = 0; i < array.length; ++i)
    result += ('0' + (array[i] & 0xff).toString(16)).slice(-2)
  return result
}

function pad(num, size) {
  let s = num + ''
  while (s.length < size) s = '0' + s
  return s
}

function hexToUint8Array(hexString) {
  const bytes = []
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16))
  }
  return new Uint8Array(bytes)
}
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:660269779 @fatnij/blemon
