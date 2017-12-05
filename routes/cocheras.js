var express = require('express');
var router = express.Router();
var Cocheras = require('../controllers/cocherasController');

router.get('/estdisp', Cocheras.cocherasDisp);

router.post('/estacionamientos', Cocheras.estacionamientosCercanos);

router.get('/estacionamiento/:id', Cocheras.getCochera);

router.get('/reservar/:id', Cocheras.reservar);

router.get('/cancelar/:id', Cocheras.cancelar);

module.exports = router;