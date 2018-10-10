CREATE DATABASE improde;
USE improde

CREATE TABLE alumnos (
	matricula BIGINT NOT NULL,
	nombre nvarchar(255) NOT NULL,
	carrera nvarchar(255) NOT NULL,
	cuatrimestre int NOT NULL,
	PRIMARY KEY (matricula)
);


CREATE TABLE proyecto (
	id_proyecto  BIGINT NOT NULL AUTO_INCREMENT, 
	nombre_proyecto nvarchar(255) NOT NULL,
	correo nvarchar(255) NOT NULL,
	contrasena text NOT NULL,
	PRIMARY KEY (id_proyecto)
);

CREATE TABLE pregunta (
	id_pregunta int NOT NULL , 
	pregunta text NOT NULL ,
	PRIMARY KEY (id_pregunta)
);


CREATE TABLE equipo (
	id_proyecto BIGINT NOT NULL ,
	matricula BIGINT NOT NULL ,
	FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
	FOREIGN KEY (matricula) REFERENCES alumnos(matricula)
);


CREATE TABLE representante (
	id_proyecto BIGINT NOT NULL, 
	matricula BIGINT NOT NULL ,
	FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
	FOREIGN KEY (matricula) REFERENCES alumnos(matricula)
);


CREATE TABLE respuesta_proyecto (
	id_proyecto BIGINT NOT NULL, 
	id_pregunta int NOT NULL ,
	respuesta text NOT NULL,
	FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
	FOREIGN KEY (id_pregunta) REFERENCES pregunta(id_pregunta)
);

INSERT INTO pregunta VALUES
	(1, '¿Qué producto o servicio produces?'),
	(2, '¿Por qué́ consideras que la solución que propones es innovadora o cuenta con un valor agregado?'),
	(3, '¿Qué problemática resuelves con tu producto o servicio?'),
	(4, '¿Quiénes, cuantos y en donde se beneficiarán con tú propuesta?'),
	(5, '¿Te consideras un emprendedor? ¿Por qué?'),
	(6, '¿Qué mensaje le darías al cliente para promover el servicio que propones?'),
	(7, 'Te invitamos a que presentes tu proyecto y tu equipo en un video de no más de 2 minutos (puedes subirlo a cualquier plataforma de videos como youtube y poner el link en el espacio de texto, por ejemplo: https://www.youtube.com/watch?v=klVWGHtRTuE )');






/* TESTING PURPOSES

	INSERT INTO respuesta_proyecto VALUES
	(15, 1, 'test1'),
	(15, 3, 'test3');

60000 * 30

 HMiejHqFN1uIIzxon4tcjNñ == $2b$08$b.fSCZ97tDvZbPZa5C3b6OfSLT4xjZrixAliS6.5ikTvB7GKI39om
 
 HMiejHqFN1uIIzxon4tcjNñ
 $2b$08$XKTqzsDXMR.AcTjoy/3Rsu5Ru63mWGCGv.9PtJjztfhCbeJYMc.n6

select * from alumnos;
select * from proyecto;
select * from pregunta;
select * from equipo;
select * from representante;
select * from respuesta_proyecto;


delete from equipo;
delete from representante;
delete from alumnos;
delete from pregunta;
delete from proyecto;
delete from respuesta_proyecto;
*/


