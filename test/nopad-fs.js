var BlockStream = require("../")
var fs = require('fs')
var path = require('path')
var tmp = path.join(require('os').tmpDir(), 'block-stream-test-' + Math.random().toString(16).substr(2))
var tmp2 = path.join(require('os').tmpDir(), 'block-stream-test-' + Math.random().toString(16).substr(2))
var tap = require("tap")
process.on('exit', function () {
  try {
    fs.unlinkSync(tmp)
    fs.unlinkSync(tmp2)
  }
  catch (e) {}
})

tap.test('grab image', function (t) {
  var options = {
    hostname: 'raw.githubusercontent.com',
    path: '/carlos8f/node-buffet/master/test/files/folder/Alice-white-rabbit.jpg'
  }
  var req = require('https').request(options, function (res) {
    res
      .pipe(fs.createWriteStream(tmp))
      .on('finish', function () { t.end() })
  })

  req.end()
})

tap.test('check image integrity', function (t) {
  fs.createReadStream(tmp)
    .pipe(require('crypto').createHash('sha1'))
    .on('data', function (data) {
      t.equal(data.toString('hex'), '2bce2ffc40e0d90afe577a76db5db4290c48ddf4')
      t.end()
    })
})

tap.test('no pad, fs to BlockStream to fs', function (t) {
  fs.createReadStream(tmp)
    .pipe(new BlockStream(256, { nopad: true }))
    .pipe(fs.createWriteStream(tmp2))
    .on('finish', function () { t.end() })
})
