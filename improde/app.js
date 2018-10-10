const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const port = 3003;
const session = require('express-session');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: '3306',
    password: "car1118",
    database: 'improde'
});
con.connect(err => {
    if (err) console.log(err);
    console.log("Mysql connected!!")
});


app.use(session({
    secret: 'asdfghjkl',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(
    function(username, password, done) {
        con.query('SELECT id_proyecto, contrasena FROM proyecto WHERE correo = ?', [username], (err, results) => {
            if (err) done(err);
            if(results.length> 0 && results[0].contrasena===password){
                return done(null, {id_proyecto: results[0].id_proyecto});
            } 
            return done(null,false);
        });

    }
));



app.get('/registro', (req, res) => res.render('Registro.ejs'));
app.get('/', authenticationMiddleware(),(req, res) =>  res.render('Postulacion.ejs'));
app.get('/login', authenticationMiddleware(),(req, res) =>  res.redirect('/'));
app.get('/misdatos', authenticationMiddleware(),(req, res) =>  res.render('DatosPersonales.ejs'));
app.get('/recursos', authenticationMiddleware(), (req, res) => res.render('Recursos.ejs'));
app.post('/agregarProyecto', (req, res) => {
    let sqlProyecto = 'INSERT INTO proyecto (nombre_proyecto, correo, contrasena) VALUES ?';
    let sqlAlumnos = 'INSERT INTO alumnos (matricula, nombre, carrera, cuatrimestre) VALUES ?';
    let sqlRepresentante = 'INSERT INTO representante (id_proyecto, matricula) VALUES ?';
    let sqlEquipo = 'INSERT INTO equipo (id_proyecto, matricula) VALUES ?';

    let proyecto = [[req.body.nombreProyecto, req.body.email, req.body.password]];
    con.query(sqlProyecto, [proyecto], (err, result) => {
        if (err) console.log(err);
        queryAll(result.insertId);
    });

    function queryAll(lastInsertID) {
        let alumnos = [
            [req.body.matricula1, req.body.nombre1, req.body.licenciatura1, req.body.cuatrimestre1],
            [req.body.matricula2, req.body.nombre2, req.body.licenciatura2, req.body.cuatrimestre2],
            [req.body.matricula3, req.body.nombre3, req.body.licenciatura3, req.body.cuatrimestre3],
            [req.body.matricula4, req.body.nombre4, req.body.licenciatura4, req.body.cuatrimestre4],
            [req.body.matricula5, req.body.nombre5, req.body.licenciatura5, req.body.cuatrimestre5]
        ];
        con.query(sqlAlumnos, [alumnos], (err, result) => {
            if (err) console.log(err);
        });

        let representante = [[lastInsertID, req.body.matricula1]];
        con.query(sqlRepresentante, [representante], (err, result) => {
            if (err) console.log(err);
        });

        let equipo = [
            [lastInsertID, req.body.matricula1],
            [lastInsertID, req.body.matricula2],
            [lastInsertID, req.body.matricula3],
            [lastInsertID, req.body.matricula4],
            [lastInsertID, req.body.matricula5]
        ];
        con.query(sqlEquipo, [equipo], (err, result) => {
            if (err) console.log(err);
        });
    }
    res.redirect('/');
});

app.post('/', passport.authenticate('local',
    {
        successRedirect: '/',
        failureRedirect: '/login'
}));


passport.serializeUser(function (id, done) {
    done(null, id);
});
passport.deserializeUser(function (id, done) {
    done(null, id);
});
function authenticationMiddleware() {
    return (req, res, next) => {
        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
        if (req.isAuthenticated()) return next();
        res.render('Login.ejs');
    }
}


app.listen(port, () => console.log('Improde app listening on port: ' + port));


