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


delete from equipo;
delete from representante;
delete from alumnos;
delete from proyecto;
