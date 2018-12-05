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


CREATE TABLE cuentas_revisores (
	id_revisor BIGINT AUTO_INCREMENT, 
	correo_revisor text NOT NULL ,
	contrasena_revisor text NOT NULL,
	nombre_revisor text NOT NULL,
	nivel_usuario_revisor int DEFAULT 1,
	PRIMARY KEY (id_revisor)
);


CREATE TABLE asignacion_revisores (
	id_revisor BIGINT NOT NULL , 
	id_proyecto BIGINT NOT NULL ,
	evaluacion_completada int DEFAULT 0,
	FOREIGN KEY (id_revisor) REFERENCES cuentas_revisores(id_revisor),
	FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto)
);


CREATE TABLE evaluacion_proyectos (
	id_revisor BIGINT NOT NULL,
	id_proyecto BIGINT NOT NULL,
	id_pregunta INT NOT NULL,
	calificacion INT NOT NULL,
	FOREIGN KEY (id_revisor) REFERENCES cuentas_revisores(id_revisor),
	FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto),
	FOREIGN KEY (id_pregunta) REFERENCES pregunta(id_pregunta)
);

CREATE TABLE retroalimentacion (
	id_revisor BIGINT NOT NULL,
	id_proyecto BIGINT NOT NULL,
	retro TEXT NOT NULL,
	FOREIGN KEY (id_revisor) REFERENCES cuentas_revisores(id_revisor),
	FOREIGN KEY (id_proyecto) REFERENCES proyecto(id_proyecto)
);


ALTER TABLE proyecto add nivel_usuario int DEFAULT 2 ;
ALTER TABLE asignacion_revisores ADD evaluacion_completada int DEFAULT 0;
INSERT INTO proyecto VALUES (0,'admin','admin@improde.com','.6jNJ]Qfxc9.LNy`',0);







/* TESTING PURPOSES
delete from proyecto where nombre_proyecto ='admin';

select * from proyecto p LEFT JOIN asignacion_revisores ar ON  ar.id_proyecto = p.id_proyecto LEFT JOIN cuentas_revisores cr ON cr.id_revisor = ar.id_revisor;

select * from alumnos;
select * from proyecto;
select * from equipo;
select * from representante;
select * from respuesta_proyecto;

select * from pregunta;

select * from 

delete from equipo;
delete from representante;
delete from alumnos;
delete from respuesta_proyecto;
delete from proyecto;


+],}Nr$6s)=-b3`v5$i8lIñ@
d/gr6Cñ@#k+%@jE<U\
10800000

SELECT *  FROM alumnos a INNER JOIN equipo e ON a.matricula = e.matricula WHERE e.id_proyecto = 1;
*/




