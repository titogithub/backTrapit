var express = require('express');
var router = express.Router();
var Cocheras = require('../controllers/cocherasController');
// Mail
var nodemailer = require('nodemailer');
var mailerhbs = require('nodemailer-express-handlebars');

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
		})

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