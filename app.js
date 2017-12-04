var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var cocheras = require('./controllers/cocherasController');
var db = require('./connection');

var distance = require("google-distance-matrix");
distance.key('AIzaSyCn5iMy9WIvgb2fEusbRJJfGVaMZ0wZzHY');

// var est = require("./estacionamiento");
var misEstacionamientos = [];

var cocherasR = require('./routes/cocheras');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
    next();
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// DB

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("conectado a Trapito");

  cocheras.inicializarCocheras()
    .then(function(rdo) {
      misEstacionamientos = rdo;
      console.log("mis estacionamientos: ", rdo);
    }, function(err) {
      console.log("erro: ", err);
    });

});

app.use('/', cocherasR);

app.post('/estacionamientos', function(req, res) {

  cocheras.listCocheras()
    .then(function(cocheras) {
      misEstacionamientos = cocheras;

      // var origins = ['Robinson 854, José Marmol, Buenos Aires, Argentina'];
      var origins = [];
      origins.push(req.body.lugar);
      var destinations = [];
      var destinationsId = [];


      // Llenar matriz destinos
      for (var i = 0; i < misEstacionamientos.length; i++) {
        if (misEstacionamientos[i].disponible == true) {
          destinations.push(misEstacionamientos[i].latitud + ',' + misEstacionamientos[i].longitud);
          destinationsId.push(misEstacionamientos[i]);
        }
      }

      // var destinations = ['-34.7981467,-58.3957462','-34.797831,-58.384435','-34.803151,-58.386324'];
      var rdoMatrix = [];

      distance.matrix(origins, destinations, function(err, distances) {
        if (!err) {
          for (var i = 0; i < destinations.length; i++) {
            rdoMatrix.push({
              lugar: destinationsId[i],
              distancia: distances.rows[0].elements[i]
            });
          }
        }

        // Ordenar Matrix 

        for (var i = 0; i < rdoMatrix.length && i < 3; i++) {
          for (var j = i + 1; j < rdoMatrix.length; j++) {
            if (rdoMatrix[j].distancia.distance.value < rdoMatrix[i].distancia.distance.value) {

              var aux = rdoMatrix[i];
              rdoMatrix[i] = rdoMatrix[j];
              rdoMatrix[j] = aux;

            }
          }
        }

        var masCercanos = [];
        for (var i = 0; i < rdoMatrix.length && i < 3; i++) {
          masCercanos.push(rdoMatrix[i]);
        }

        // console.log(JSON.stringify(rdoMatrix,null,'\t'));

        res.send(masCercanos);

      });



    }, function(err) {
      console.log("error", err);
    });



  var estLibres = [];

  for (var i = 0; i < misEstacionamientos.length; i++) {
    if (misEstacionamientos[i].disponible == true)
      estLibres.push(misEstacionamientos[i]);
  }



});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var server = app.listen(8081, function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);

});

module.exports = app;