const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const port = 3003;
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 8;

let con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: 'car1118',
    database: 'improde'
});
con.connect(err => {
    if (err) console.log(err);
    console.log("Mysql connected!!")
});


app.use(session({
    secret: 'asdfghjkl',
    resave: false,
    saveUninitialized: false,
}));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(
    function (username, password, done) {
        con.query('SELECT id_proyecto, contrasena FROM proyecto WHERE correo = ?', [username], (err, results) => {
            if (err) done(err);
            if (!results[0]) return done(null, false);

            bcrypt.compare(password, results[0].contrasena, function (err, res) {
                if (err) done(err);
                if (res) return done(null, { id_proyecto: results[0].id_proyecto });
                return done(null, false);
            });
        });
    }
));


app.get('/registro', (req, res) => res.render('Registro.ejs',{error: false, errorMessage: ''}));
app.get('/login', (req, res) => res.render('Login.ejs'));
app.get('/recursos', authenticationMiddleware(), (req, res) => res.render('Recursos.ejs'));
app.get('/misdatos', authenticationMiddleware(), (req, res) => res.render('DatosPersonales.ejs'));

app.get('/', authenticationMiddleware(), (req, res) => {
    let idProyecto = req.session.passport.user.id_proyecto;
    let sqlRespuesta = 'SELECT * FROM respuesta_proyecto WHERE id_proyecto = ? ORDER BY id_pregunta';
    con.query(sqlRespuesta, [idProyecto], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        res.render('Postulacion.ejs', {
            respuesta1: result[0].respuesta,
            respuesta2: result[1].respuesta,
            respuesta3: result[2].respuesta,
            respuesta4: result[3].respuesta,
            respuesta5: result[4].respuesta,
            respuesta6: result[5].respuesta,
            respuesta7: result[6].respuesta,
            respuesta8: result[7].respuesta,
            respuesta9: result[8].respuesta
        });
    });
});


app.post('/registro', (req, res) => {
    let checkProyecto = 'SELECT  nombre_proyecto FROM  proyecto WHERE nombre_proyecto = ?';
    let checkCorreo = 'SELECT  correo FROM  proyecto WHERE correo = ?';
    let checkMatricula = 'SELECT  matricula FROM  equipo WHERE matricula IN (?)';

    let sqlProyecto = 'INSERT INTO proyecto (nombre_proyecto, correo, contrasena) VALUES ?';
    let sqlAlumnos = 'INSERT INTO alumnos (matricula, nombre, carrera, cuatrimestre) VALUES ?';
    let sqlRepresentante = 'INSERT INTO representante (id_proyecto, matricula) VALUES ?';
    let sqlEquipo = 'INSERT INTO equipo (id_proyecto, matricula) VALUES ?';
    let sqlRespuesta = 'INSERT INTO respuesta_proyecto (id_proyecto, id_pregunta, respuesta) VALUES ?';

    let nombreProyectoTest = req.body.nombreProyecto;
    let nombreCorreoTest = req.body.email;

    con.query(checkProyecto, [nombreProyectoTest], (err, result) => {
        if (err) {
            console.log(err);
            res.redirect('/registro');
        }
        console.log(result[0]);
        if (result[0]) {
            console.log('ENTER IN PROYECTO DUPLICATED')
            res.redirect('/login');
//            res.render('Registro.ejs',{error: true, errorMessage: 'Nombre del proyecto ya existe recuerda solo UN registro es necesario por equipo'});
        }

        con.query(checkCorreo, [nombreCorreoTest], (err, result2) => {
            if (err) {
                console.log(err);
                res.redirect('/registro');
            }
            console.log(result2[0]);
            if (result2[0]) {
                console.log('ENTER IN CORREO DUPLICATED')
                res.redirect('/login');
//                res.render('Registro.ejs',{error: true, errorMessage: 'Correo ya existe recuerda solo UN registro es necesario por equipo'});
            }
            password();
        });

    });


    function password() {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            let password = hash;
            if (err) {
                password = req.body.password
            }
            let proyecto = [[req.body.nombreProyecto, req.body.email, password]];
            con.query(sqlProyecto, [proyecto], (err, result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                queryAll(result.insertId);
            });
        });
    }


    function queryAll(lastInsertID) {
        let alumnos = [
            [req.body.matricula1, req.body.nombre1, req.body.licenciatura1, req.body.cuatrimestre1],
            [req.body.matricula2, req.body.nombre2, req.body.licenciatura2, req.body.cuatrimestre2],
            [req.body.matricula3, req.body.nombre3, req.body.licenciatura3, req.body.cuatrimestre3],
            [req.body.matricula4, req.body.nombre4, req.body.licenciatura4, req.body.cuatrimestre4],
            [req.body.matricula5, req.body.nombre5, req.body.licenciatura5, req.body.cuatrimestre5]
        ];
        con.query(sqlAlumnos, [alumnos], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
        });

        let representante = [[lastInsertID, req.body.matricula1]];
        con.query(sqlRepresentante, [representante], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
        });

        let equipo = [
            [lastInsertID, req.body.matricula1],
            [lastInsertID, req.body.matricula2],
            [lastInsertID, req.body.matricula3],
            [lastInsertID, req.body.matricula4],
            [lastInsertID, req.body.matricula5]
        ];
        con.query(sqlEquipo, [equipo], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
        });

        let respuesta = [
            [lastInsertID, 1, ''],
            [lastInsertID, 2, ''],
            [lastInsertID, 3, ''],
            [lastInsertID, 4, ''],
            [lastInsertID, 5, ''],
            [lastInsertID, 6, ''],
            [lastInsertID, 7, ''],
            [lastInsertID, 8, ''],
            [lastInsertID, 9, '']
        ];
        con.query(sqlRespuesta, [respuesta], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
        });
    }
    res.redirect('/login');
});


app.post('/postulacion', authenticationMiddleware(), (req, res) => {
    let idProyecto = req.session.passport.user.id_proyecto;
    let arrayRespuestas = [
        req.body.respuesta1,
        req.body.respuesta2,
        req.body.respuesta3,
        req.body.respuesta4,
        req.body.respuesta5,
        req.body.respuesta6,
        req.body.respuesta7,
        req.body.respuesta8,
        req.body.respuesta9
    ];
    for (let i = 0; i < arrayRespuestas.length; i++) {
        con.query('UPDATE respuesta_proyecto SET respuesta = ? WHERE id_pregunta = ? AND id_proyecto = ?',
            [arrayRespuestas[i], i + 1, idProyecto], (err, results) => {
                if (err) console.log(err);
            });
    }
    res.redirect('/');
});


app.post('/login', passport.authenticate('local',
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
        if (req.isAuthenticated()) {
            //           console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
            req.session.cookie.maxAge = 60000 * 120;
            return next();
        }
        res.redirect('/login');
    }
}


app.listen(port, () => console.log('Improde app listening on port: ' + port));


