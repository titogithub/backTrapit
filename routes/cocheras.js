var express = require('express');
var router = express.Router();
var Cocheras = require('../controllers/cocherasController');
// Mail
var nodemailer = require('nodemailer');
var mailerhbs = require('nodemailer-express-handlebars');

// Goode Distance Service
var distance = require("google-distance-matrix");
distance.key('AIzaSyCn5iMy9WIvgb2fEusbRJJfGVaMZ0wZzHY');

// Config Mail

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'trapitpark@gmail.com',
		pass: 'trapit1234'
	}
});

transporter.use('compile', mailerhbs({
	viewPath: 'public/templates', //Path to email template folder
	extName: '.hbs' //extendtion of email template
}));


router.get('/estdisp', function(req, res, next) {

	Cocheras.cocherasDisp()
		.then(function(cocheras) {
			console.log("estacionamientos disponibles");
			res.send(cocheras);
		}).catch(function(err) {
			console.log(err);
		});

});

router.post('/estacionamientos', function(req, res) {

  Cocheras.listCocheras()
    .then(function(cocheras) {
     var misEstacionamientos = cocheras;

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

});

router.get('/estacionamiento/:id', function(req, res, next) {

	var id = req.params.id;

	Cocheras.getCochera(id)
		.then(function(cochera) {
			console.log("get estacionamiento: " + id);
			console.log(cochera);
			res.send(cochera);
		}).catch(function(err) {
			console.log(err);
		})

});

router.get('/cancelar/:id', function(req, res, next) {
	var id = req.params.id;

	Cocheras.cancelar(id)
		.then(function(cochera) {

			if (cochera !== null) {

				var emailDestino = cochera.mail;
				var mailOptions = {
					from: 'trapitpark@email.com',
					to: emailDestino,
					subject: 'Confirmacion Reserva Cochera',
					template: 'cancelacion',
					context: {
						descripcion: cochera.descripcion,
						direccion: cochera.direccion,
						img: cochera.url,
						precio: cochera.precio,
						puntuacion: cochera.puntuacion
					}
				};

				transporter.sendMail(mailOptions, function(err, info) {
					if (err)
						console.log(err);
					else
						console.log(info);
				});

				res.send({
					estado: "ok"
				});

			} else
				res.send({
					estado: "fail"
				});


		}, function(err) {
			console.log("err while saving route", err);
		})

})

router.get('/reservar/:id', function(req, res, next) {

	var id = req.params.id;

	Cocheras.reservar(id)
		.then(function(cochera) {

			if (cochera !== null) {

				var emailDestino = cochera.mail;
				var mailOptions = {
					from: 'trapitpark@email.com',
					to: emailDestino,
					subject: 'Confirmacion Reserva Cochera',
					template: 'confirmacion',
					context: {
						descripcion: cochera.descripcion,
						direccion: cochera.direccion,
						img: cochera.url,
						precio: cochera.precio,
						puntuacion: cochera.puntuacion
					}
				};

				transporter.sendMail(mailOptions, function(err, info) {
					if (err)
						console.log(err)
					else
						console.log(info);
				});

				res.send({
					estado: "ok"
				});

			} else
				res.send({
					estado: "fail"
				});


		}, function(err) {
			console.log("err while saving route", err);
		})

})



module.exports = router;