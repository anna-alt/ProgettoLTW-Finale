var expr = require('express');
const crypto = require('crypto');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
var engine = require('ejs');
var requ = require("request");
var pgp = require("pg-promise")();

dotenv.config();

var app = expr();

app.engine('html', engine.__express);
app.set('views', path.join(__dirname, './html_js_css'));
app.set('view engine', 'html');


app.use(expr.urlencoded({
    extended: false
}));

app.use(cookieParser());

app.use(expr.static(path.join(__dirname, './html_js_css')));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './html_js_css/index.html'));
});

app.get('/index', function (req, res) {
    res.sendFile(path.join(__dirname, './html_js_css/index.html'));
});


/* GESTIONE REGISTRAZIONE/LOGIN */
app.get('/signup', function (req, res) {
    if (req.cookies['AuthToken']) res.sendFile(path.join(__dirname, './html_js_css/index.html'));
    else {
        res.render('signup');
    }
});

app.post('/signup', function (req, res) {
    var email = req.body.email;
    var username = req.body.username;
    var salt = crypto.randomBytes(8).toString('hex');
    if (req.body.password !== req.body.repeatpassword) {
        res.render('signup', {
            message: "Passwords don't match"
        })
    }else if(req.body.password.length < 8){
        res.render('signup', {
            message: 'Your password must be at least 8 character long'
        })
    }else {
        var password = getHashedPassword(req.body.password + salt);
        db.query('INSERT INTO users VALUES ($1, $2, $3, $4)', [email, username, password, salt])
            .then(result => {
                res.render('login', {
                    message: 'Registration completed, login to proceed'
                })
            })
            .catch(err => {
                console.log(err.message);
                res.render('signup', {
                    message: 'Email already used'
                })
            })
    }
});

app.get('/profilo', renderizzaProfilo);

function renderizzaProfilo(req, res, message, cookie) {
    if (!cookie) cookie = req.cookies['AuthToken']
    db.query('SELECT username, tokens.email FROM tokens, users WHERE tokens.email=users.email AND tokens.token = $1', [cookie])
        .then(result => {
            db.query('SELECT title FROM users_movies WHERE email = $1', [result[0].email])
                .then(result1 => {
                    prof = {
                        message: message,
                        utente: result[0].username,
                        movie1: undefined,
                        movie1encoded: undefined,
                        stars1: undefined ,
                        movie2: undefined,
                        movie2encoded: undefined,
                        stars2: undefined ,
                        movie3: undefined,
                        movie3encoded: undefined,
                        stars3: undefined ,
                        movie4: undefined,
                        movie4encoded: undefined,
                        stars4: undefined,
                        movie5: undefined,
                        movie5encoded: undefined,
                        stars5: undefined,
                        movie6: undefined,
                        movie6encoded: undefined,
                        stars6: undefined
                        
                    }
                    for (var i = 1; i <= result1.length; i++) {
                        prof["movie" + i.toString()] = result1[i - 1].title.replace(/ /g, '_');
                        prof["movie" + i.toString() + "encoded"] = encodeURI(result1[i - 1].title.replace(/ /g, '_'));
                    }
                    //var st = getRate(req);
                    db.query('SELECT rate FROM users_movies JOIN tokens ON users_movies.email = tokens.email WHERE tokens.token = $1', [req.cookies['AuthToken']])
                        .then(result => {
                            for (var i = 1; i <= result.length; i++) {
                                    prof["stars" + i.toString()] = result[i - 1].rate.toString();
                            }
                            res.render('profilo', prof);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }).catch(err => {
                    console.log('select 2 error:', err)
                    res.sendFile(path.join(__dirname, './html_js_css/index.html'));
                })
        }).catch(err => {
            console.log('select 1 error:', err)
            res.sendFile(path.join(__dirname, './html_js_css/index.html'));
        })

}

app.get('/login', function (req, res) {
    console.log('GET /login with token=', req.cookies['AuthToken']);
    if (req.cookies['AuthToken']) renderizzaProfilo(req, res);
    else res.render('login')
});

app.post('/login', function (req, res) {
    var email = req.body.email;
    console.log(email + " is logging in");
    db.query('SELECT username, password, salt FROM users WHERE email= $1', [email])
        .then(result1 => {
            if (result1[0].password === getHashedPassword(req.body.password + result1[0].salt)) {
                const authToken = generateAuthToken();
                db.query('INSERT INTO tokens VALUES ($1, $2)', [email, authToken])
                    .then(result2 => {
                        if (req.body.remember === "on") {
                            res.cookie('AuthToken', authToken, {
                                maxAge: 864000000 * 30
                            });
                        } else {
                            res.cookie('AuthToken', authToken);
                        }
                        renderizzaProfilo(req, res, undefined,authToken);
                    })
                    .catch(err => {
                        res.render('login', {
                            message: 'Errore Server: ' + err.message
                        })
                    })
            } else {
                res.render('login', {
                    message: 'Wrong password'
                })
            }
        })
        .catch(err => {
            res.render('login', {
                message: 'Wrong e-mail or password'
            })
        })
});

app.post('/logout', function (req, res) {
    console.log("POST /logout");
    var authToken = req.cookies['AuthToken'];
    db.query('DELETE FROM tokens where token = $1', [authToken])
        .then(result => {
            res.clearCookie('AuthToken');
            res.sendFile(path.join(__dirname, './html_js_css/index.html'));
        })
        .catch(err => {
            res.sendFile(path.join(__dirname, './html_js_css/profilo.html'));
        })
});

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
};

const generateAuthToken = () => {
    return crypto.randomBytes(30).toString('hex')
}

/*\\\\\\\\\\\\\\\\\\\\\*/

const cn = {
    host: process.env.DB_HOST,
    port: 5432,
    database: 'progetto_reti',
    user: 'postgres',
    password: process.env.DB_PW
};

const db = pgp(cn);

 /*GESTIONE FILM*/
app.get("/movie/genres", function (req, res) {
    var str = '';
    var gen = JSON.parse(req.query.genres);
    console.log("GET /movie/genres with gen="+gen);
    for (var i = 0; i < gen.length; i++) {
        if (gen.length - 1 !== i) {
            str += "gen = '" + gen[i] + "' OR ";
        } else {
            str += "gen = '" + gen[i] + "'";
        }
    }
    db.query("SELECT id, name FROM movies WHERE " + str)
        .then(result => {
            var rindex = crypto.randomInt(result.length);;
            var id = result[rindex].id;
            var name = result[rindex].name;
            res.send({
                id: id,
                name: name
            })
        })
        .catch(err => res.status(500).send(err.message))
});

app.get("/movie/mood", function (req, res) {
    var mood = req.query.mood;
    console.log('GET /movie/genres with mood=' + mood);
    db.query("SELECT id, name FROM movies WHERE mood = $1", [mood])
        .then(result => {
            var rindex = crypto.randomInt(result.length);;
            var id = result[rindex].id;
            var name = result[rindex].name;
            console.log(name);
            console.log(id);
            res.send({
                id: id,
                name: name
            })
        })
        .catch(err => res.status(500).send(err.message))
});

app.get('/MoviePage', function (req, res) {
    var id = req.query.id;
    var title = req.query.title;
    console.log(title);
    console.log("GET /MoviePage with id="+id);
    var url = 'https://api.trakt.tv/search/imdb/' + id + '?extended=full';
    console.log("Requesting trakt api...")
    requ({
        method: 'GET',
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': process.env.API_KEY
        }
    }, function (error, response, body) {
        if (response.statusCode === 200) {
            console.log("Request to trakt went fine!");
            res.render('schedafilm', {
                img: "moviesposters/" + title.replace(/ /g, '_'),
                id: id,
                titolo: title,
                trama: JSON.parse(body)[0].movie.overview,
                released: JSON.parse(body)[0].movie.released,
                runtime: JSON.parse(body)[0].movie.runtime,
                trailer: JSON.parse(body)[0].movie.trailer,
            })
        } else {
            console.log(error);
            console.log(body);
        }
    });
});

app.post('/movie/save', function (req, res) {
    console.log("POST /movie/save");
    const id = req.body.id;
    const title = req.body.title;
    db.query("SELECT email FROM tokens where token=$1", [req.cookies['AuthToken']])
        .then(result1 => {
            const email = result1[0].email
            db.query("INSERT into users_movies VALUES($1,$2,$3,5)", [email, title, id])
                .then(result => {
                    res.json({
                        success: 'true'
                    })
                }).catch(err => {
                    console.log(err);
                    if (err.code === '23505') {
                        res.json({
                            success: 'duplicato'
                        })
                    } else {
                        res.json({
                            success: 'false'
                        })
                    }
                })
        })
        .catch(err => {
            console.log(err);
            res.json({
                success: 'false'
            })
        })
});

app.get('/remove', function (req, res) {
    console.log("GET /remove");
    const title = req.query.title.replace(/_/g, ' ');
    db.query("SELECT email FROM tokens where token=$1", [req.cookies['AuthToken']])
        .then(result1 => {
            const email = result1[0].email;
            db.query("DELETE FROM users_movies WHERE email=$1 AND title=$2", [email,title])
                .then(result => {
                    renderizzaProfilo(req, res,"","");
                }).catch(err => {
                    console.log(err);
                    res.send("Server error");
                })
        })
        .catch(err => {
            console.log(err);
            res.send("Server error");
        })
});

/*\\\\\\\\\\\\\\\\\\\\\*/

app.listen(process.env.SERVER_PORT, function () {
    console.log('listening on port: ' + process.env.SERVER_PORT)
});

////////// GESTIONE API TRAKT.TV ///////////
app.get("/OAuthTrakttv", (req, res) => {
    console.log("GET /OAuthTrakttv");
    if (req.cookies['TraktToken']) renderizzaProfilo(req, res, 'Already linked to Trakt.tv')
    else {
        db.query('SELECT trakt_token FROM trakt_tokens JOIN tokens ON trakt_tokens.email = tokens.email WHERE tokens.token = $1', [req.cookies['AuthToken']])
            .then(result => {
                if (result.length === 0) {
                    console.log("Authorizing user...");
                    res.redirect('https://trakt.tv/oauth/authorize?response_type=code&client_id=' + process.env.API_KEY + '&redirect_uri=http://localhost:3002/callback');
                }
                else {
                    res.cookie('TraktToken', result[0].trakt_token);
                    renderizzaProfilo(req, res, 'Already linked to Trakt.tv')
                }
            })
            .catch(err => renderizzaProfilo(req, res, "Something gone wrong"))
    }
})

app.get('/callback', (req, res) => {
    var code = req.query.code;
    console.log('GET /callback with code='+code);
    requ({
        method: 'POST',
        url: 'https://api.trakt.tv/oauth/token',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: code,
            client_id: process.env.API_KEY,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: 'http://localhost:3002/callback',
            grant_type: 'authorization_code'
        })
    }, function (error, response, body) {
        var TraktToken = JSON.parse(body).access_token;
        var RefreshToken = JSON.parse(body).refresh_token;
        console.log('User authorized with token='+TraktToken);
        db.query('SELECT email FROM tokens WHERE token = $1', [req.cookies['AuthToken']])
            .then(result => {
                db.query('INSERT INTO trakt_tokens VALUES ($1, $2, $3)', [result[0].email, TraktToken, RefreshToken])
                    .then(result1 => {
                        res.cookie('TraktToken', TraktToken);
                        renderizzaProfilo(req, res, "Trakt.tv account linked correctly");
                    })
                    .catch(err => renderizzaProfilo(req, res, "Something gone wrong"))
            }).catch(err => renderizzaProfilo(req, res, "Something gone wrong"))
    });
})

app.post('/addToTrakt', (req, res) => {
    console.log("POST /addToTrakt");
    console.log("Adding to Trakt.tv whatchlist");
    if(req.cookies['AuthToken'] === undefined) {
       console.log("User need to login");
       res.json({
        success: false
       })
    }else if (req.cookies['TraktToken']) { 
        requ({
            method: 'POST',
            url: 'https://api.trakt.tv/sync/watchlist',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + req.cookies['TraktToken'],
                'trakt-api-version': '2',
                'trakt-api-key': process.env.API_KEY
            },
            body: JSON.stringify({
                movies: [{
                    ids: {
                        imdb: req.body.imdbId
                    }
                }]
            })
        }, function (error, response, body) {
            res.json({
                success: true
            })
            console.log("Movie added to trakt");
        });
    }else{
        console.log("User need to link Trakt.tv");
        res.json({
            success: false
        })
    }
});
/*\\\\\\\\\\\\\\\\\\\\\*/

/*GESTIONE VALUTAZIONE FILM*/
app.post("/rating",(req,res) => {
    console.log("POST /rating");
    db.query('SELECT rate FROM users_movies JOIN tokens ON users_movies.email = tokens.email WHERE tokens.token = $1', [req.cookies['AuthToken']])
            .then(result => {
                console.log(result);
                res.json({
                    star : result[0].rate
                })
            })
            .catch(err => {
                console.log(err);
                res.json({
                    star : "error"
                })
            })
});


app.post("/rate",(req,res) => {
    var num = req.body.number;
    var t = req.body.title;
    console.log(num);
    db.query('UPDATE users_movies SET rate = $1 WHERE users_movies.email = (SELECT users.email FROM users JOIN tokens ON tokens.email = users.email WHERE tokens.token = $2 AND users_movies.title = $3 )', [num,req.cookies['AuthToken'],t])
    .then(result => {
        console.log(result);
        res.json({
            success : true
        })
    })
    .catch(err => {
        res.json({
            success : false
        })
        console.log(err);
    })
});