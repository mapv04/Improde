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
    password: 'Lic080497',
    database: 'improde_2019'
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
        con.query('SELECT * FROM proyecto WHERE correo = ?', [username], (err, result1) => {
            if (err) done(err);
            if (result1[0]) {
                if (result1[0].contrasena === password){
                    return done(null, { id_proyecto: result1[0].id_proyecto, nivel_usuario: result1[0].nivel_usuario });
                } else{
                    return done(null, false);
                } 
            } else{
                con.query('SELECT * FROM cuentas_revisores WHERE correo_revisor = ?', [username], (err, result2) => {
                    if (err) done(err);
                    if(result2[0]){
                        if(result2[0].contrasena_revisor === password) return done(null, { id_proyecto: result2[0].id_revisor, nivel_usuario: result2[0].nivel_usuario_revisor });
                    }
                    return done(null, false);
                });
            }
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

app.get('/adminresultados', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==0){
        res.redirect('/');
        return;
    }
    let idProyecto = req.query.idProyectoMin;
    let idRevisor = req.query.idRevisor;
    let sqlRespuestas = 'SELECT respuesta FROM respuesta_proyecto WHERE id_proyecto = ? ORDER BY id_pregunta ASC';
    let sqlEvaluacion = 'SELECT (calificacion * 2) AS calificacion  FROM evaluacion_proyectos WHERE id_proyecto = ? AND id_revisor = ? ORDER BY id_pregunta ASC';
    let sqlRetro = 'SELECT retro FROM  retroalimentacion WHERE  id_proyecto = ? AND id_revisor = ?'

    con.query(sqlRespuestas, [idProyecto], (err, result1) => {
        if (err) {
            console.log(err);
            return;
        }
        con.query(sqlEvaluacion, [idProyecto,idRevisor], (err, result2) => {
            if (err) {
                console.log(err);
                return;
            }
            con.query(sqlRetro, [idProyecto,idRevisor], (err, result3) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.send( {respuestas: result1, calificacion: result2, retro: result3} );
            });
        });
    });

    
});



app.get('/', authenticationMiddleware(), (req, res) => {
    let idProyecto = req.session.passport.user.id_proyecto;
    let nivelUsuario = req.session.passport.user.nivel_usuario;

    let sqlRespuesta = 'SELECT * FROM respuesta_proyecto WHERE id_proyecto = ? ORDER BY id_pregunta';

    let sqlAdminIntegrantes = 'SELECT a.nombre, e.id_proyecto FROM alumnos a INNER JOIN equipo e ON a.matricula = e.matricula';

    let sqlRevisores = `SELECT  ar.id_revisor, ar.id_proyecto, cr.nombre_revisor, 
                        (SELECT ROUND(AVG(ep.calificacion) * 20,2 ) FROM  evaluacion_proyectos ep  
                        WHERE ep.id_proyecto = ar.id_proyecto AND ep.id_revisor =  ar.id_revisor GROUP BY ep.id_proyecto,ep.id_revisor) AS calificacion_revisor FROM asignacion_revisores ar 
                        INNER JOIN cuentas_revisores cr ON ar.id_revisor = cr.id_revisor ORDER BY calificacion_revisor DESC`

    let sqlAdminProyecto = `SELECT p.id_proyecto, p.nombre_proyecto, 
                            (SELECT ROUND(AVG(calificacion) * 20,2) FROM evaluacion_proyectos WHERE id_proyecto = p.id_proyecto)  AS calificacion
                            FROM proyecto p WHERE correo <> 'admin@improde.com' ORDER BY calificacion DESC`;

    let sqlRevisorProyecto = `SELECT cr.id_revisor, cr.nombre_revisor, cr.telefono_oficina, ar.id_proyecto, p.nombre_proyecto ,ar.evaluacion_completada FROM cuentas_revisores cr 
                            INNER JOIN asignacion_revisores ar ON cr.id_revisor = ar.id_revisor inner join proyecto p 
                            ON ar.id_proyecto = p.id_proyecto where cr.id_revisor = ?`;
    let sqlNombreRevisor = 'SELECT nombre_revisor FROM cuentas_revisores where id_revisor = ?';

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
                con.query(sqlRevisores, (err, result3) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    res.render('Administrador.ejs', { proyectos: result1, integrantes: result2, revisores: result3});
                });
            });
        });
    } else if (nivelUsuario === 1) {
        con.query(sqlRevisorProyecto, req.session.passport.user.id_proyecto,(err, result) => {
            if (err){
                console.log(err);
                return;
            }
            if(!result[0]){
                con.query(sqlNombreRevisor, req.session.passport.user.id_proyecto,(err, result) => {
                    if (err){
                        console.log(err);
                        return;
                    }
                    res.render('AltaDatosRevisor.ejs',{datos: result});
                });
            }
            else if(result[0].telefono_oficina !== null){
                res.render('Proyectos.ejs', {proyectos: result});
            }
            else{
                res.render('AltaDatosRevisor.ejs',{datos: result});
            }

        });
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
                respuesta9: result[8].respuesta,
                respuesta10: result[9].respuesta
            });
        }); 
    } else {
        res.redirect('/logout');
    }

});


app.get('/evaluacion/:idProyecto', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==1){
        res.redirect('/');
        return;
    }
    let idProyecto = req.params.idProyecto;
    let sqlRespuestas = 'SELECT rp.respuesta, p.nombre_proyecto FROM respuesta_proyecto rp INNER JOIN proyecto p ON rp.id_proyecto = p.id_proyecto WHERE rp.id_proyecto = ? ORDER BY id_pregunta';
    con.query(sqlRespuestas, [idProyecto], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        res.render('Evaluacion.ejs', {
            respuesta1: result[0].respuesta,
            respuesta2: result[1].respuesta,
            respuesta3: result[2].respuesta,
            respuesta4: result[3].respuesta,
            respuesta5: result[4].respuesta,
            respuesta6: result[5].respuesta,
            respuesta7: result[6].respuesta,
            respuesta8: result[7].respuesta,
            respuesta9: result[8].respuesta,
            nombreProyecto: result[0].nombre_proyecto,
            id_proyecto: idProyecto
        });
    });
});

app.get('/adminRevisores', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==0){
        res.redirect('/');
        return;
    }
    let sqlCuentas = 'SELECT * FROM cuentas_revisores ';
    let sqlAsignaciones = `SELECT ar.id_revisor, ar.id_proyecto, ar.evaluacion_completada, p.nombre_proyecto FROM asignacion_revisores ar
                            INNER JOIN proyecto p ON ar.id_proyecto = p.id_proyecto`;
    let cuentas = {};
    let asignaciones = {};

    con.query(sqlCuentas, (err, results) => {
        if (err) console.log(err);
        if (results) {
            cuentas = results;
        }
        con.query(sqlAsignaciones, (err2, results2) => {
            if (err2) console.log(err);
            if (results2) {
                asignaciones = results2;
            }
            res.render('AdministradorRevisores.ejs', { cuentas: cuentas, asignaciones: asignaciones })
        });
    });

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

app.get('/misdatosRevisor', authenticationMiddleware(), (req,res) => {
    if(req.session.passport.user.nivel_usuario!==1){
        res.redirect('/');
        return;
    }
    let idRevisor = req.session.passport.user.id_proyecto;
    let sqlDatos = `SELECT nombre_revisor, telefono_oficina, telefono_celular, sexo, DATE_FORMAT(fecha_nacimiento,'%d/%m/%Y') AS fecha_nacimiento, 
                    curriculum, facebook FROM cuentas_revisores WHERE id_revisor = ? ;`;
    let sqlTemas = 'SELECT * FROM temas_revisor WHERE id_revisor = ? ;';
    let sqlComentarios = 'SELECT comentario FROM comentarios_revisores WHERE id_revisor = ? ;';

    con.query(sqlDatos,[idRevisor], (err, result) => {
        if(err) console.log(err);
        con.query(sqlTemas, [idRevisor], (err, result2) => {
            if(err) console.log(err);
            con.query(sqlComentarios,[idRevisor], (err, result3) => {
                if(err) console.log(err);
                res.render('DatosPersonalesRevisor.ejs', {datos: result, temas: result2, comentarios: result3});
            });
        });
    });

});

app.get('/adminInfoRevisores/:idRevisor', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==0){
        res.redirect('/');
        return;
    }
    let idRevisor = req.params.idRevisor;
    let sqlDatos = `SELECT nombre_revisor, telefono_oficina, telefono_celular, sexo, DATE_FORMAT(fecha_nacimiento,'%d/%m/%Y') AS fecha_nacimiento, 
                    curriculum, facebook FROM cuentas_revisores WHERE id_revisor = ? ;`;
    let sqlTemas = 'SELECT * FROM temas_revisor WHERE id_revisor = ? ;';
    let sqlComentarios = 'SELECT comentario FROM comentarios_revisores WHERE id_revisor = ? ;';

    con.query(sqlDatos,[idRevisor], (err, result) => {
        if(err) console.log(err);
        con.query(sqlTemas, [idRevisor], (err, result2) => {
            if(err) console.log(err);
            con.query(sqlComentarios,[idRevisor], (err, result3) => {
                if(err) console.log(err); 
                if(!result3[0]){
                    result3[0] = "";
                }
                res.render('AdminInfoRevisores.ejs', {datos: result, temas: result2, comentarios: result3});
            });
        });
    });

});
/*
app.get('/adminInfoPersonal', authenticationMiddleware(), (req, res) => {
    console.log("si entra a app.js");
    if(req.session.passport.user.nivel_usuario!==0){
        res.redirect('/');
        return;
    }
    let idRevisor = req.query.idRevisor;
    let sqlDatos = `SELECT nombre_revisor, telefono_oficina, telefono_celular, sexo, DATE_FORMAT(fecha_nacimiento,'%d/%m/%Y') AS fecha_nacimiento, 
    curriculum, facebook FROM cuentas_revisores WHERE id_revisor = ? ;`;
    let sqlTemas = 'SELECT * FROM temas_revisor WHERE id_revisor = ? ;';
    let sqlComentarios = 'SELECT comentario FROM comentarios_revisores WHERE id_revisor = ? ;';
    con.query(sqlDatos,[idRevisor], (err, result) => {
        if(err) console.log(err);
        con.query(sqlTemas, [idRevisor], (err, result2) => {
            if(err) console.log(err);
            con.query(sqlComentarios,[idRevisor], (err, result3) => {
                if(err) console.log(err);
                res.send( {datos: result, temas: result2, comentarios: result3});
            });
        });
    });

});*/

app.post('/actualizarDatos', authenticationMiddleware(), (req,res) => {
    if(req.session.passport.user.nivel_usuario!==1){
        res.redirect('/');
        return;
    }
    let idRevisor = req.session.passport.user.id_proyecto;
    let curriculum =  req.body.curriculum;
    let facebook = req.body.facebook;
    let sqlActualizarC = 'UPDATE cuentas_revisores SET curriculum = ?  WHERE id_revisor = ? ;';
    let sqlActualizarF = 'UPDATE cuentas_revisores SET facebook = ? WHERE id_revisor = ? ;';
    if(curriculum.length !== 0){
        con.query(sqlActualizarC,[curriculum, idRevisor], (err, result) => {
         if(err) console.log(err);
        });
    }
    if(facebook.length !== 0){
        con.query(sqlActualizarF, [facebook, idRevisor], (err, result) => {
            if(err) console.log(err);
        });
    }
    res.redirect('/');
});

////////////////////////////////////////////////

 app.post('/registro', (req, res) => {
    let checkProyecto = 'SELECT  nombre_proyecto FROM  proyecto WHERE nombre_proyecto = ?';
    let checkCorreo = 'SELECT  correo FROM  proyecto WHERE correo = ?';
    let checkMatricula = 'SELECT  matricula FROM  equipo WHERE matricula IN (?)';

    let sqlProyecto = 'INSERT INTO proyecto (nombre_proyecto, correo, contrasena) VALUES ?';
    let sqlAlumnos = 'INSERT INTO alumnos (matricula, nombre, carrera, cuatrimestre) VALUES ?';
    let sqlRepresentante = 'INSERT INTO representante (id_proyecto, matricula) VALUES ?';
    let sqlEquipo = 'INSERT INTO equipo (id_proyecto, matricula) VALUES ?';
    let sqlRespuesta = 'INSERT INTO respuesta_proyecto (id_proyecto, id_pregunta, respuesta) VALUES ?';
    let sqlProfesorAsignado = 'INSERT INTO profesor_asignacion_proyecto (id_proyecto, nombre_profesor) VALUES ?';

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
            [lastInsertID, 9, ''],
            [lastInsertID, 10, '']
        ];
        con.query(sqlRespuesta, [respuesta], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
        });

        let profesorAsignacion = [[lastInsertID, req.body.nombreMaestro]];
        con.query(sqlProfesorAsignado, [profesorAsignacion], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            res.render('RegistroCorrecto.ejs');
        });
    }
}); 
////////////////////////////////////////////

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
        req.body.respuesta9,
        req.body.respuesta10
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
    let nombreRevisor = [req.body.nombreRevisor1, req.body.nombreRevisor2, req.body.nombreRevisor3];
    let email = [req.body.email1.toLowerCase(), req.body.email2.toLowerCase(), req.body.email3.toLowerCase()];
    let password = [req.body.password1, req.body.password2, req.body.password3];
    
    let sqlCuentaRevisor = 'INSERT INTO cuentas_revisores(correo_revisor,contrasena_revisor,nombre_revisor) VALUES (?)';
    let sqlAsignacionRevisor = 'INSERT INTO asignacion_revisores (id_revisor, id_proyecto) VALUES(?)';
    let sqlCheckRevisorEmail = 'SELECT id_revisor, nombre_revisor  FROM cuentas_revisores WHERE correo_revisor = ?'
    let sqlCheckRevisorNombre = 'SELECT correo_revisor, nombre_revisor FROM cuentas_revisores WHERE nombre_revisor = ?';
    let registroFallo = false;
    let idRevisor = [];

    for(let i=0;i<3;i++){
        con.query(sqlCheckRevisorEmail, [[email[i]]], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            if(result[0]){
                 if(nombreRevisor[i].toLowerCase().replace(/\s/g,'')===result[0].nombre_revisor.toLowerCase().replace(/\s/g,'')){
                    idRevisor.push(result[0].id_revisor);
                    if(idRevisor.length===3) asignarRevisores();
                } else if(!registroFallo){
                    registroFallo = true;
                    res.render('RegistroRevisorFallo.ejs');
                }
                
            } else{
                con.query(sqlCheckRevisorNombre, [[nombreRevisor[i]]], (err, result2) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    if(!result2[0]){
                        con.query(sqlCuentaRevisor, [[email[i],password[i],nombreRevisor[i]]], (err, result3) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            idRevisor.push(result3.insertId);
                            if(idRevisor.length===3) asignarRevisores();
                        });
                    }  else if(!registroFallo){
                        res.render('RegistroRevisorFallo.ejs');
                        registroFallo = true;
                    }
                });
            }
        });
    }

    function asignarRevisores(){
        for(let i=0; i<3; i++){
           con.query(sqlAsignacionRevisor, [[idRevisor[i],idProyecto]], (err, resul) => {
                if (err) {
                    console.log(err);
                    return;
                }
            });
        }
        res.redirect('/');
    }
});

app.post('/asignarRevisoresID', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==0){
        res.redirect('/');
        return;
    }
    let sqlAsignarPorID = "INSERT INTO asignacion_revisores (id_revisor, id_proyecto) VALUES(?)";
    let sqlExisteID = "SELECT id_revisor FROM cuentas_revisores WHERE id_revisor = ?;";
    let idProyecto = req.body.idProyecto.replace('IPD18-','').match(/\d+/g)[0];
    let idRevisores = [req.body.idRevisor, req.body.idRevisor2, req.body.idRevisor3];
    let registroFallo = false;

    for(let i = 0; i<3;i++){
        con.query(sqlExisteID, [[idRevisores[i]]], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            if(!result[0]){
                registroFallo = true;
            }
            if(i===2) asignar();
        });
    }

    function asignar(){
        if(!registroFallo){
            for(let i=0;i<3;i++){
                con.query(sqlAsignarPorID, [[idRevisores[i], idProyecto]], (err, result) => {
                    if(err){
                        console.log(err);
                        return;
                    }
                });
            }
            res.redirect('/');
        }
        else{
            res.render('AsignacionRevisorFallo.ejs');
        }
    }

});

app.post('/agregarNuevoRevisor', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==0){
        res.redirect('/');
        return;
    }
    let sqlCheckRevisorEmail = 'SELECT id_revisor, nombre_revisor  FROM cuentas_revisores WHERE correo_revisor = ?'
    let sqlAgregarRevisor = 'INSERT INTO cuentas_revisores(correo_revisor,contrasena_revisor,nombre_revisor) VALUES (?)';
    let nombreRevisor = req.body.nombreRevisor;
    let email = req.body.email.toLowerCase();
    let password = req.body.password;

    con.query(sqlCheckRevisorEmail, [email], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        if(result[0]){
            res.redirect('/')
        } else{
            con.query(sqlAgregarRevisor, [[email,password,nombreRevisor]], (err, result3) => {
                 if (err) {
                    console.log(err);
                    return;
                }
                    res.redirect('/');
                });
        }
    });
});



app.post('/calificar/:idProyecto', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==1){
        res.redirect('/');
        return;
    }
    let idRevisor =req.session.passport.user.id_proyecto;
    let idProyecto = req.params.idProyecto;
    let sqlCalificar = 'INSERT INTO evaluacion_proyectos (id_revisor,id_proyecto,id_pregunta,calificacion) VALUES (?,?,?,?);';
    let sqlRetro = 'INSERT INTO retroalimentacion (id_revisor, id_proyecto, retro) VALUES (?,?,?)';
    let sqlEvaluacionCompletada = 'UPDATE asignacion_revisores SET evaluacion_completada = 1 WHERE id_revisor = ? AND id_proyecto = ?';
    let arrayCalificaciones = [
        req.body.calificacion1,
        req.body.calificacion2,
        req.body.calificacion3,
        req.body.calificacion4,
        req.body.calificacion5,
        req.body.calificacion6,
        req.body.calificacion7,
        req.body.calificacion8,
        req.body.calificacion9
    ];
    for (let i = 0; i < arrayCalificaciones.length; i++) {
        con.query(sqlCalificar,
            [idRevisor, idProyecto, i +1, arrayCalificaciones[i]], (err, results) => {
                if (err) console.log(err);
            });
    }
    con.query(sqlRetro,[idRevisor, idProyecto, req.body.retro], (err, results) => {
        if (err) console.log(err);
    });

    con.query(sqlEvaluacionCompletada,[idRevisor,idProyecto], (err, results) => {
        if (err) console.log(err);
    });

    res.redirect('/');

});

app.post('/altaDatos', authenticationMiddleware(), (req, res) => {
    if(req.session.passport.user.nivel_usuario!==1){
        res.redirect('/');
        return;
    }
    let telOficina = req.body.telefono_oficina;
    let telCelular = req.body.telefono_celular;
    let sexo = req.body.sexo;
    let fecha = req.body.fecha_nacimiento;
    let curriculum = req.body.curriculum;
    let facebook = req.body.facebook;
    let idRevisor = req.session.passport.user.id_proyecto;
    let arrayTemas = req.body.temas;
    let comentarios = req.body.comentarios;

    let sqlRevisorProyecto = `SELECT cr.id_revisor, cr.nombre_revisor, cr.telefono_oficina, ar.id_proyecto, p.nombre_proyecto, 
                            ar.evaluacion_completada, com.comentario FROM cuentas_revisores cr 
                            INNER JOIN asignacion_revisores ar ON cr.id_revisor = ar.id_revisor inner join proyecto p 
                            ON ar.id_proyecto = p.id_proyecto INNER JOIN comentarios_revisores com ON cr.id_revisor = com.id_revisor where cr.id_revisor = ?`;
    let sqlAltaDatos = `UPDATE cuentas_revisores SET telefono_oficina = ?, telefono_celular = ?, sexo = ?, fecha_nacimiento = ?, curriculum = ?, facebook = ?
                        WHERE id_revisor = ?;`;
    let sqlTemas = 'INSERT INTO temas_revisor (id_revisor, tema) VALUES(?,?);';
    let sqlComentarios = 'INSERT INTO comentarios_revisores (id_revisor, comentario) VALUES (?,?);';

    con.query(sqlAltaDatos,[telOficina,telCelular,sexo,fecha,curriculum, facebook, req.session.passport.user.id_proyecto], (err,res) => {
        if(err) console.log(err);
    });

    for (let i = 0; i < arrayTemas.length-1; i++) {
        con.query(sqlTemas,
            [idRevisor, arrayTemas[i]], (err, results) => {
                if (err) console.log(err);
            });
    }

    con.query(sqlComentarios, [idRevisor, comentarios],(err, result) =>{
        if(err) console.log(err);
        
    });

    con.query(sqlRevisorProyecto, req.session.passport.user.id_proyecto,(err, result) => {
        if (err){
            console.log(err);
            return;
        }
        res.render('Proyectos.ejs', {proyectos: result});
    });

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
            req.session.cookie.maxAge = 10800000;
            return next();
        }
        res.redirect('/login');
    }
}


app.listen(port, () => console.log('Improde app listening on port: ' + port));


