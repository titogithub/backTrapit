var mongoose = require('mongoose');
Cocheras = require('../models/cocheras');

mongoose.Promise = Promise;

exports.listCocheras = function () {
	return  Cocheras.find().exec();
}

exports.cocherasDisp = function(){

	return Cocheras.find({disponible:true}).exec();
	
} 

exports.getCochera = function (id) {
	return Cocheras.findOne({id:id}).exec()
}

exports.reservar = function (id) {
	return Cocheras.findOne({id:id, disponible:true}).exec()
	.then((cochera) => {
		if (cochera != null){
			cochera.disponible = false;
			return cochera.save();
		}
		else
			return null;
	},function (err) {
		console.log("error al reservar db", err);
	})
}

exports.cancelar = function (id) {
		return Cocheras.findOne({id:id, disponible:false}).exec()
		.then((cochera) => {
			if (cochera != null){
				cochera.disponible = true;
				return cochera.save();
			}
			else
				return null;
		},function (err) {
			console.log("error al reservar db", err);
		})
}

exports.inicializarCocheras = function () {
	return Cocheras.find().exec()
	.then(function (cocheras) {
		for (var i = 0; i < cocheras.length; i++) {
			Cocheras.findOne({id:cocheras[i].id}).exec()
			.then(function (cochera) {
				cochera.disponible = true;
				cochera.save();
			},function (err) {
				console.log("error al gaurdar", err);
			})
		}
		return Cocheras.find().exec();

	},function (err) {
		console.log("error al inicializar", err);

	})
}

