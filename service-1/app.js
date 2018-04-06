/*eslint-disable no-extra-parens */
"use strict";
// BASE SETUP
// =============================================================================

// call the packages we need
const express    = require('express');
const bodyParser = require('body-parser');
const morgan     = require('morgan');
const DarkSkyApi = require('dark-sky-api');
const moment 		 = require('moment');
const app        = express();

// configure app
app.use(morgan('dev')); // log requests to the console

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080; // set our port

// Set up DarkSkyApi
// =============================================================================
DarkSkyApi.apiKey = '419e5fcc37df13344804f165d07287be';
DarkSkyApi.proxy = true;
DarkSkyApi.units = 'us';

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

router.get('/current', function(req, res) {
	// const position = {
	// 	latitude: 33.6845673, 
	// 	longitude: -117.82650490000003
	// };

	// DarkSkyApi.loadCurrent(position)
	DarkSkyApi.loadCurrent()
		.then(result => {
			// console.log(result);
			res.json({ message: 'hooray! welcome to our test api!', data: result });
		});
});

router.get('/last-week', function(req, res) {
	// if latitude/logitude not provided, use Irvine, CA's
	const position = {
		latitude: req.query.lat ? req.query.lat : 33.6845673, 
		longitude: req.query.lon ? req.query.lon : -117.82650490000003
	};
	const all = [];
	for (let i=1; i<8; i++) {
		const prom = new Promise((resolve, reject) => {
			const time = moment().add(-i, 'day');
			DarkSkyApi.loadTime(time, position) // or '2000-04-06T12:20:05' aka moment.format()
				.then(result => {
					// console.log(result);
					const data = (result && result.daily && result.daily.data && Array.isArray(result.daily.data) && result.daily.data.length > 0)
						? result.daily.data[0]
						: {"error": "Inalid daily data!"};
					resolve(data);
				})
				.catch(err => reject(err));
		});
		all.push(prom);
	}
	// console.log(`size of array: ${all.length}`);
	Promise.all(all).then(values => {
		console.log(`Success:`);
		res.json(values);
	})
	.catch(reason => {
		console.log(`Failed: ${reason}`);
		res.json({"error": reason});
	});
});

// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
