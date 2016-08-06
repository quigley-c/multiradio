console.log('Initializing components.');

var express = require('express');
const exec = require('child_process').exec;
var app = express();

var port = 2516;

app.use('/js', express.static('js'));
app.use('/css', express.static('css'));
app.use('/art', express.static('art'));
app.use('/res', express.static('res'));
app.use('/node_modules', express.static('node_modules'));

app.get('/', function(req, res) {
	res.render('index.pug');
});

app.get('/status', function(req, res) {
	var env = process.env, env_copy = {}, var_name;

	for (var_name in env) {
		env_copy = process.env;
	}

	/* Silently pass a host and port into the ENV so mpc will catch it */

	env_copy['MPD_HOST']=req.query.host
	env_copy['MPD_PORT']=req.query.port

	exec('./mpc_json.sh', { env: env_copy }, function(err, stdout, stderr) {
		if (err) { throw err; }
		res.send(stdout);
	});
});

app.listen(port, function() {
	console.log("Listening on port " + port + ".");
});
