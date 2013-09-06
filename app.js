var express = require('express')
var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/blog')

var Schema = mongoose.Schema
var BlogSchema = new Schema({
  title: String,
  body: String,
  comments: [{ author: String, comment: String }]
})

var Blog = mongoose.model('Blog', BlogSchema)

var app = express()

app.configure(function(){
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(require('stylus').middleware({ src: __dirname + '/public' }))
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))
})

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
})

app.configure('production', function(){
  app.use(express.errorHandler());
})

app.get('/', function (req, res) {
  Blog.find({}, function (err, data) {
    res.render('list', { entries: data })
  })
})

app.get('/new', function (req, res) {
  res.render('new')
})

app.get('/entries/:id', function (req, res) {
  Blog.findById(req.params.id, function (err, data) {
    res.render('entry', { entry: data })
  })
})

app.get('/update/:id', function (req, res) {
  Blog.findById(req.params.id, function (err, data) {
    res.render('update', { entry: data })
  })
})

app.put('/update/:id', function (req, res) {
  Blog.update(
    {_id: req.params.id},
    {
      $set: {
        title: req.body.title,
        body: req.body.body
      }
    }, false, true
  )
  console.log("Updated entry with id: " + req.params.id)
  res.redirect('/')
})

app.delete('/entries/:id', function (req, res) {
  Blog.findById(req.params.id, function (err, entry) {
    entry.remove(function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log("Deleted entry: " + req.params.id)
        res.send()
      }
    })
  })
  res.redirect('/')
})

app.post('/new', function (req, res) {
  var entryData = {
    title: req.body.title,
    body: req.body.body
  }
  var entry = new Blog(entryData)
  entry.save(function (err, data) {
    if (err) {
      res.json(err);
    } else {
      console.log("Added new entry")
      res.statusCode = 201
      res.send()
    }
  })
  res.redirect('/')
})

app.listen(3000)
console.log("Express server listening on port 3000 in %s mode", app.settings.env)