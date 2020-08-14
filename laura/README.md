### Sobre Mí
###### Laura Alejandra Izquierdo Castro
-----------------
> "Hola! Te contaré algunas cosas sobre mi"

Algunos datos:
- Estudiante de *octavo semestre* de Ingeniería de sistemas.
- Hermana mayor.
- Tengo 20 años.
- Vivo en Zipaquirá.

Soy una persona disciplinada, que le gustan los retos y no se rinde fácilmente.

En ocasiones disfruto:
1. Pintar al *óleo*.
2. Hacer algo de deporte.
3. Compartir con mi familia y amigos.
4. Jugar con mi mascota.

<p align="center">
<br>
<img height="150" src="https://mejorconsalud.com/wp-content/uploads/2013/02/persona-pintnado-oleo-colores-500x334.jpg" />
<img height="150" src="https://static3.abc.es/media/bienestar/2019/08/02/tenis-abecedario-kgNF--1200x630@abc.jpg">
<br>
</p>

<div style="text-align: justify"> Me gusta ver videos acerca de temas relacionados con mi carrera como por ejemplo este documental sobre los inicios de Linux y como esta idea de libertad que empezó en colaboración por GNU, ha evolucionado exitosamente. Además de reconocer personajes como Linus Torvalds y sus aportes a la informática. </div>

<p align="center">
<br>
<img height="150" src="https://1.bp.blogspot.com/_UqUwVPikChs/SsIRQmiu8DI/AAAAAAAAKsk/VKdwz7ocn_Y/s320/Linux_tux.jpg" />
<img height="150" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Heckert_GNU_white.svg/1200px-Heckert_GNU_white.svg.png">
<br>
</p>

Enlace del Documental: [The Code: Story of Linux documentary](https://www.youtube.com/watch?v=XMm0HsmOTFI&t=2183s)

En relación al tema comparto el código fuente de la primera versión del Kernel Linux 0.01, en el que se detalla el proceso de arranque del kernel.

```
void die(char * str)
{
	fprintf(stderr,"%s\n",str);
	exit(1);
}

void usage(void)
{
	die("Usage: build boot system [> image]");
}

int main(int argc, char ** argv)
{
	int i,c,id;
	char buf[1024];

	if (argc != 3)
		usage();
	for (i=0;i<sizeof buf; i++) buf[i]=0;
	if ((id=open(argv[1],O_RDONLY,0))<0)
		die("Unable to open 'boot'");
	if (read(id,buf,MINIX_HEADER) != MINIX_HEADER)
		die("Unable to read header of 'boot'");
	if (((long *) buf)[0]!=0x04100301)
		die("Non-Minix header of 'boot'");
	if (((long *) buf)[1]!=MINIX_HEADER)
		die("Non-Minix header of 'boot'");
	if (((long *) buf)[3]!=0)
		die("Illegal data segment in 'boot'");
	if (((long *) buf)[4]!=0)
		die("Illegal bss in 'boot'");
	if (((long *) buf)[5] != 0)
		die("Non-Minix header of 'boot'");
	if (((long *) buf)[7] != 0)
		die("Illegal symbol table in 'boot'");
	i=read(id,buf,sizeof buf);
	fprintf(stderr,"Boot sector %d bytes.\n",i);
	if (i>510)
		die("Boot block may not exceed 510 bytes");
	buf[510]=0x55;
	buf[511]=0xAA;
	i=write(1,buf,512);
	if (i!=512)
		die("Write call failed");
	close (id);
	
	if ((id=open(argv[2],O_RDONLY,0))<0)
		die("Unable to open 'system'");
	if (read(id,buf,GCC_HEADER) != GCC_HEADER)
		die("Unable to read header of 'system'");
	if (((long *) buf)[5] != 0)
		die("Non-GCC header of 'system'");
	for (i=0 ; (c=read(id,buf,sizeof buf))>0 ; i+=c )
		if (write(1,buf,c)!=c)
			die("Write call failed");
	close(id);
	fprintf(stderr,"System %d bytes.\n",i);
	return(0);
	}
```
Tomado de: [El Código Fuente de la Primera Versión del Kernel Linux 0.01](https://aprendiendoausarlinux.wordpress.com/2012/06/14/el-codigo-fuente-de-la-primera-version-del-kernel-linux-0-01/ "El Código Fuente de la Primera Versión del Kernel Linux 0.01")


#### Finalización ejercicios 

[Learn Git Branching](https://learngitbranching.js.org/ "Learn Git Branching")

**Sección Main**

<p align="center">
  <img src="https://github.com/Alizeci/Git/blob/master/laura/mainEvidence.png" width="800">
</p>

**Sección Remote**

<p align="center">
  <img src="https://github.com/Alizeci/Git/blob/master/laura/remoteEvidence.png" width="800">
</p>