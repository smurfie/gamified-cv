const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'localhost'; // 'production' in production

let express = require('express'),
  app = express()
  isProduction = ENV === 'production';

// set the view engine to ejs
app.set('view engine', 'ejs');

// set the public folder
app.use(express.static('public'));

app.get('/', function(req, res) {
  res.render('home', {isProduction: isProduction});
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
})