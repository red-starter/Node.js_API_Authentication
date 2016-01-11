var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // config file contains secret sauce ans user info

var port = process.env.PORT || 8080; // used to create, sign, and verify tokens

// use body parser to strip data from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ************************************** routes **************************************


// use express router for convenience
var router = express.Router(); 

// these routes are not restricted
router.get('/', function(req, res) {
	res.send('Hello broh!');
});

// http://localhost:8080/api/auth
router.post('/auth', function(req, res) {

	// create a user , assume in a real app this would be db call and we would check against that
	var user = {
		name : req.body.name,
		password : req.body.password		
	}
	// check if matchs user we created in config file
	if (config.name !== user.name || config.password !== user.password) {
		res.json({ success: false, message: 'Epic authentication fail. Wrong credentials.' });
	} else {
			// if user is found and password is tight
			var token = jwt.sign(user, config.secret, {
				expiresIn: 1000
			});

			res.json({
				success: true,
				message: 'Enjoy your token broh!',
				token: token
			});
		}
	})		

// all the routes defined below will use this middleware to both authenticate and check token
router.use(function(req, res, next) {
	// check header for token
	var token = req.headers['x-access-token'];
	// decode token
	if (token) {

		// verifies secret and checks expiration time
		jwt.verify(token, config.secret, function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token' });		
			} else {
				// save to request for use in other routes
				req.decoded = decoded;	
				// call next function, req and res will be available to it
				next();
			}
		});

	} else {
		// if there is no token return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token available.'
		});
		
	}
	
});

// **************** authenticated routes ************
router.get('/users', function(req, res) {
	res.json('congrats you got in');
});

router.get('/check', function(req, res) {
	res.json(req.decoded);
});

app.use('/api', router);

// start server 
app.listen(port,function(){
	console.log('server listening on port '+port);
});
