const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const port = 80;
const session = require('express-session');


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
        con.query('SELECT * FROM proyecto WHERE correo = ?', [username], (err, results) => {
            if (err) done(err);
            if (!results[0]) return done(null, false);
            if (results[0].contrasena === password) return done(null, { id_proyecto: results[0].id_proyecto, nivel_usuario: results[0].nivel_usuario });
            return done(null, false);
        });
    }
));


app.get('/registro', (req, res) => res.render('Registro.ejs', { error: false, errorMessage: '' }));
app.get('/login', (req, res) => res.render('Login.ejs', { error: false }));
app.get('/loginFailed', (req, res) => res.render('Login.ejs', { error: true }));
app.get('/recursos', authenticationMiddleware(), (req, res) => res.render('Recursos.ejs'));

app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/login');
});

/* app.get('/json', authenticationMiddleware(), (req, res) => {
    let nombreProyecto = req.query.nombreproyecto;
    let nivelUsuario = req.session.passport.user.nivel_usuario;
    let sqlAdminProyecto = 'SELECT id_proyecto, nombre_proyecto FROM proyecto WHERE nombre_proyecto LIKE %?%';
    let sqlAdminIntegrantes = 'SELECT a.nombre, e.id_proyecto FROM alumnos a INNER JOIN equipo e ON a.matricula = e.matricula INNER JOIN proyecto p ON e.id_proyecto = p.id_proyecto  WHERE nombre_proyecto LIKE %?%';
    if (nivelUsuario !== 0) {
        res.redirect('/');
    } else {
        con.query(sqlAdminProyecto, [nombreProyecto], (err, result1) => {
            if (err) {
                console.log(err);
                return;
            }
            con.query(sqlAdminIntegrantes, [nombreProyecto], (err, result2) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send({ proyectos: result1, integrantes: result2 });
            });
        });
    }

}); */

app.get('/', authenticationMiddleware(), (req, res) => {
    let idProyecto = req.session.passport.user.id_proyecto;
    let nivelUsuario = req.session.passport.user.nivel_usuario;
    let sqlRespuesta = 'SELECT * FROM respuesta_proyecto WHERE id_proyecto = ? ORDER BY id_pregunta';
    let sqlAdminIntegrantes = 'SELECT a.nombre, e.id_proyecto FROM alumnos a INNER JOIN equipo e ON a.matricula = e.matricula ORDER BY e.id_proyecto ASC';
    let sqlAdminProyecto = `SELECT p.id_proyecto, p.nombre_proyecto, cr.nombre_revisor  FROM proyecto p
                            LEFT JOIN asignacion_revisores ar ON ar.id_proyecto = p.id_proyecto
                            LEFT JOIN cuentas_revisores cr ON cr.id_revisor = ar.id_revisor
                            ORDER BY id_proyecto ASC`;
    if (nivelUsuario === 0) {
        con.query(sqlAdminProyecto, (err, result1) => {
            if (err) {
                console.log(err);
                return;
            }
            con.query(sqlAdminIntegrantes, (err, result2) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.render('Administrador.ejs', { proyectos: result1, integrantes: result2 });
            });
        });
    } else if (nivelUsuario === 1) {
        res.redirect('/login');
    } else if (nivelUsuario === 2) {
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
    } else {
        res.redirect('/login');
    }

});

app.get('/misdatos', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==2){
        res.redirect('/');
        return;
    }
    let idProyecto = req.session.passport.user.id_proyecto;
    let sql = 'SELECT *  FROM alumnos a INNER JOIN equipo e ON a.matricula = e.matricula WHERE e.id_proyecto = ? ';
    let alumnos = {};
    con.query(sql, [idProyecto], (err, results) => {
        if (err) console.log(err);
        if (results) {
            alumnos = results;
        }
        res.render('DatosPersonales.ejs', { alumnos: alumnos })
    });

});


/* app.post('/registro', (req, res) => {
    let checkProyecto = 'SELECT  nombre_proyecto FROM  proyecto WHERE nombre_proyecto = ?';
    let checkCorreo = 'SELECT  correo FROM  proyecto WHERE correo = ?';
    let checkMatricula = 'SELECT  matricula FROM  equipo WHERE matricula IN (?)';

    let sqlProyecto = 'INSERT INTO proyecto (nombre_proyecto, correo, contrasena) VALUES ?';
    let sqlAlumnos = 'INSERT INTO alumnos (matricula, nombre, carrera, cuatrimestre) VALUES ?';
    let sqlRepresentante = 'INSERT INTO representante (id_proyecto, matricula) VALUES ?';
    let sqlEquipo = 'INSERT INTO equipo (id_proyecto, matricula) VALUES ?';
    let sqlRespuesta = 'INSERT INTO respuesta_proyecto (id_proyecto, id_pregunta, respuesta) VALUES ?';

    let m1 = Number(req.body.matricula1);
    let m2 = Number(req.body.matricula2);
    let m3 = Number(req.body.matricula3);
    let m4 = Number(req.body.matricula4);
    let m5 = Number(req.body.matricula5);

    if (m1 === m2 || m1 === m3 || m1 === m4 || m1 === m5 ||
        m2 === m3 || m2 === m4 || m2 === m5 ||
        m3 === m4 || m3 === m5 ||
        m4 === m5) {
        res.render('Registro.ejs', { error: true, errorMessage: 'LAS MATRICULAS TIENEN QUE SER DIFERENTES ENTRE INTEGRANTES' });
        return;
    }

    con.query(checkProyecto, [req.body.nombreProyecto.toLowerCase()], (err, result) => {
        if (err) {
            console.log(err);
            res.render('Registro.ejs', { error: true, errorMessage: 'Error intenta de nuevo' });
            return;
        }
        if (result[0]) {
            //           console.log('ENTER IN PROYECTO DUPLICATED');
            res.render('Registro.ejs', { error: true, errorMessage: 'EL NOMBRE DEL PROYECTO YA EXISTE RECUERDA SOLO UN REGISTRO POR EQUIPO ES NECESARIO' });
            return;
        }

        con.query(checkCorreo, [req.body.email.toLowerCase()], (err, result2) => {
            if (err) {
                console.log(err);
                res.render('Registro.ejs', { error: true, errorMessage: 'Error intenta de nuevo' });
                return;
            }
            if (result2[0]) {
                //               console.log('ENTER IN CORREO DUPLICATED');
                res.render('Registro.ejs', { error: true, errorMessage: 'EL CORREO YA EXISTE RECUERDA SOLO UN REGISTRO POR EQUIPO ES NECESARIO' });
                return;
            }

            let matriculaCheck = [
                Number(req.body.matricula1),
                Number(req.body.matricula2),
                Number(req.body.matricula3),
                Number(req.body.matricula4),
                Number(req.body.matricula5)
            ];
            con.query(checkMatricula, [matriculaCheck], (err, result3) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (result3[0]) {
                    //                   console.log('ENTER IN matricula DUPLICATED');
                    res.render('Registro.ejs', { error: true, errorMessage: 'LAS MATRICULAS YA EXISTEN RECUERDA SOLO UN REGISTRO POR EQUIPO ES NECESARIO' });
                    return;
                } else {
                    password();
                }
            });
        });
    });

    function password() {
        let password = req.body.password;
        let proyecto = [[req.body.nombreProyecto, req.body.email, password]];
        con.query(sqlProyecto, [proyecto], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            queryAll(result.insertId);
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
            res.render('RegistroCorrecto.ejs');
        });
    }
}); */


app.post('/postulacion', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==2){
        res.redirect('/');
        return;
    }
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


app.post('/agregarRevisor', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==0){
        res.redirect('/');
        return;
    }
    let idProyecto = req.body.idProyecto.replace('IPD18-','').match(/\d+/g)[0];
    let nombreRevisor = req.body.nombreRevisor;
    let email = req.body.email.toLowerCase();
    let password = req.body.password;
    let sqlCuentaRevisor = 'INSERT INTO cuentas_revisores(correo_revisor,contrasena_revisor,nombre_revisor) VALUES(?)';
    let sqlAsignacionRevisor = 'INSERT INTO asignacion_revisores VALUES(?)';
    let sqlCheckRevisorEmail = 'SELECT id_revisor, nombre_revisor  FROM cuentas_revisores WHERE correo_revisor = ?'
    let sqlCheckRevisorNombre = 'SELECT correo_revisor, nombre_revisor FROM cuentas_revisores WHERE nombre_revisor = ?';

    con.query(sqlCheckRevisorEmail, [[email]], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }

        if(result[0]){
             if(nombreRevisor.toLowerCase().replace(/\s/g,'')===result[0].nombre_revisor.toLowerCase().replace(/\s/g,'')){
                queryAsignacion(result[0].id_revisor);
            }
            else{
                res.redirect('/');
            }
        } else{
            con.query(sqlCheckRevisorNombre, [[nombreRevisor]], (err, result2) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if(!result2[0]){
                    con.query(sqlCuentaRevisor, [[email, password, nombreRevisor]], (err, result3) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        queryAsignacion(result3.insertId);
                    });
                }
                else{
                    res.redirect('/');
                }
            });
        } 
    });
   
    function queryAsignacion(lastInsertID){
        con.query(sqlAsignacionRevisor, [[lastInsertID,idProyecto]], (err, resul) => {
            if (err) {
                console.log(err);
                return;
            }
            res.redirect('/');
        });
    }
});


app.post('/login', passport.authenticate('local',
    {
        successRedirect: '/',
        failureRedirect: '/loginFailed'
    }));


app.get('*', (req, res) => res.redirect('/'));


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
            req.session.cookie.maxAge = 10800000;
            return next();
        }
        res.redirect('/login');
    }
}


app.listen(port, () => console.log('Improde app listening on port: ' + port));


