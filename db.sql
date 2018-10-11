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
	(1, 'Modelo de Impacto Qué tipo de impacto quieres tener como empresa/organización (impacto social, impacto personal, impacto local, impacto en una comunidad, impacto ambiental, etc.)? ¿Cómo mides tu impacto?'),
	(2, 'Propuesta de valor ¿Qué hace única la propuesta de tu organización? ¿Quién más está en el espacio que te interesa, y por qué eres mejor?'),
	(3, 'Aliados ¿Con quién trabajas para crear impacto positivo para tu negocio o para el contexto en general? ¿Con quién no trabajarías? ¿Quiénes son tus clientes, fundadores y red de contactos?'),
	(4, 'Productos y Servicios ¿Qué estas creando? ¿Cómo te aseguras que tu producto o servicio funciona bien, y produce el impacto que estas esperando lograr?'),
	(5, 'Talento y Modelo Operacional ¿Quién hace el trabajo? ¿Cómo necesitan ser el organigrama organizacional y la estructura de costos de tu organización para lograr las metas interpuestas en tu modelo de impacto y propuesta de valor?'),
	(6, 'Modelo de ventas ¿Cómo se financia tu trabajo? ¿Cómo se puede financiarse creativamente?'),
	(7, '¿Te consideras un emprendedor? ¿Por qué?'),
	(8, '¿Qué mensaje le darías al cliente para promover el servicio que propones?'),
	(9, 'Te invitamos a que presentes tu proyecto y tu equipo en un video de no más de 2 minutos (puedes subirlo a cualquier plataforma de videos como youtube y poner el link en el espacio de texto, por ejemplo: https://www.youtube.com/watch?v=klVWGHtRTuE )');






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
select * from equipo;
select * from representante;
select * from respuesta_proyecto;

select * from pregunta;


delete from equipo;
delete from representante;
delete from alumnos;
delete from respuesta_proyecto;
delete from proyecto;
*/


