# Cambios por regla

Reglas tomadas de `documentacion/reglas.typ` (Johnson, *Designing with the Mind in Mind*).

## Capítulo 1 · Our Perception is Biased

### Regla 1.2

**Regla.** Comprender los objetivos de los usuarios y asegurar que la información necesaria esté disponible, sea prominente y se relacione claramente con dichos objetivos.

**Pantalla.** Pantalla de entrada "¿Qué quieres entender hoy?".

**Problema.** Las cuatro opciones de la entrada no correspondían a las tareas del usuario. Faltaba conocer los cuidados de la planta, y había dos opciones que la interfaz no cubre (Resolver un problema y No sé qué pedir).

**Cambio.** Ahora la entrada tiene tres opciones, una por tarea. Son Escoger una planta, Identificar una planta y Conocer sus cuidados, con textos de ayuda sencillos y sin términos de botánica.

### Regla 1.5

**Regla.** No diseñar pantallas de información ambiguas.

**Pantalla.** Cabecera de la respuesta (arriba a la derecha de la lámina).

**Problema.** Los tres botones de la cabecera eran solo íconos, sin texto. El de fijar era el más confuso, porque cuando la respuesta ya estaba fijada mostraba un alfiler tachado, y se podía entender que no estaba fijada.

**Cambio.** Cada botón muestra ahora el ícono y un texto. El botón de fijar dice Fijado o No fijado, y su alfiler se ve relleno cuando la respuesta está fijada y solo con contorno cuando no lo está. Los otros dos dicen Otra versión y Descargar.

### Regla 1.1

**Regla.** Mantener la consistencia ubicando controles e información en las mismas posiciones a través de las páginas, utilizando los mismos colores, fuentes y sombreados.

**Pantalla.** Barra superior y pie del panel "Tu jardín".

**Problema.** Los botones Historial y Árbol aparecían en dos lugares, en la barra superior y en el pie del panel izquierdo, con distinto tamaño y estilo. Con dos copias distintas, el usuario podía pensar que hacían cosas diferentes o no saber dónde buscarlos.

**Cambio.** Se quitaron del pie del panel. Historial y Árbol quedan solo en la barra superior, junto a Buscar.

### Regla 1.5 (íconos de los datos de cuidado)

**Regla.** No diseñar pantallas de información ambiguas.

**Pantalla.** Bloque "Datos de cuidado" de la respuesta.

**Problema.** Cuando un dato no tenía un ícono propio, se mostraba una hoja. Por eso Riego, Mascotas y Espacio, que son datos distintos, tenían el mismo dibujo, y el ícono no ayudaba a diferenciarlos. Lo mismo pasaba con Drenaje, Abono, Temperatura y Porte.

**Cambio.** Cada dato tiene ahora un ícono que corresponde a lo que significa. Riego y Agua muestran una gota, Mascotas una huella, Espacio, Tamaño y Porte una regla, Abono un frasco, Temperatura un termómetro y Drenaje una flecha hacia abajo. La hoja queda solo para los datos que no tienen un ícono propio.

## Capítulo 2 · Our Vision is Optimized to See Structure

### Regla 2.5

**Regla.** Presentar la información compleja utilizando estructuras simétricas (Simetría/Prägnanz), como tablas, para reducir la complejidad visual de la escena, facilitar el escaneo de datos y ayudar al cerebro a encontrar el orden.

**Pantalla.** Tarjetas de plantas candidatas en la respuesta de escoger una planta.

**Problema.** Los datos de cada planta estaban en etiquetas pequeñas con un ícono y sin nombre, que se acomodaban en filas de distinto largo. Para comparar las tres plantas había que leer cada tarjeta por separado.

**Cambio.** Cada tarjeta tiene ahora una tabla corta con las mismas filas y en el mismo orden (Luz, Riego, Tamaño y Mascotas). Las tablas quedan a la misma altura en las tres tarjetas, así que cada dato se compara de un vistazo.

### Regla 2.2

**Regla.** Aplicar formatos visuales idénticos (Similitud), como texto en negrita, colores o formas específicas, para que los usuarios perciban rápidamente elementos relacionados como un grupo distinto.

**Pantalla.** Bloque "Datos de cuidado" de la respuesta.

**Problema.** Los cuatro datos (Luz, Riego, Mascotas y Espacio) son del mismo tipo, pero cada uno tenía un borde y un fondo de otro color. Eso hacía pensar que eran cosas de distinta clase o que alguno era más importante.

**Cambio.** Los cuatro datos tienen ahora el mismo borde y el mismo fondo, así que se leen como un solo grupo.

### Regla 2.8

**Regla.** No usar cuadros de agrupación o líneas divisorias innecesarias para separar controles si el espaciado es suficiente.

**Pantalla.** Lista "Qué hacer" de la respuesta.

**Problema.** Cada paso de la lista tenía una línea divisoria debajo, aunque el número en círculo y el espacio entre pasos ya los separaban. Las líneas agregaban ruido visual sin dar información.

**Cambio.** Se quitaron las líneas entre los pasos. Ahora los pasos se separan solo con el espacio y su número.

## Capítulo 3 · We Seek and Use Visual Structure

### Regla 3.6

**Regla.** No presentar datos o listas como párrafos de texto en prosa sin estructura. Se apoya en la regla 3.1, que pide usar viñetas y listas numeradas para facilitar el escaneo visual.

**Pantalla.** Secciones desplegables "Por qué" y "Qué vigilar" de la respuesta.

**Problema.** Cada sección juntaba varias ideas distintas en un solo párrafo, unidas con punto y coma. Por ejemplo, dos avisos sobre dos plantas distintas se leían como una sola oración.

**Cambio.** Cuando el texto tiene varias ideas, se muestra como una lista con viñetas, una idea por línea. Si tiene una sola idea, sigue como párrafo.

### Regla 3.7

**Regla.** No incluir "ruido" repetitivo e innecesario en los resultados de búsqueda o en las opciones de enlaces.

**Pantalla.** Ventana Buscar.

**Problema.** Al buscar en "Este jardín", cada resultado repetía el nombre del jardín, aunque todos eran del mismo. Además, cada fila tenía una flecha a la derecha que no agregaba información, porque toda la fila ya se podía abrir.

**Cambio.** El nombre del jardín se muestra solo al buscar en "Todos los jardines", que es cuando ayuda a diferenciar los resultados. También se quitó la flecha de cada fila.

## Capítulo 4 · Our Color Vision is Limited

### Regla 4.8

**Regla.** No usar pares de colores que las personas daltónicas no pueden distinguir (rojo oscuro vs. negro, rojo oscuro vs. verde oscuro, azul vs. púrpura, verde claro vs. blanco). Se apoya en la regla 4.3, que pide usar el color junto con otras señales visuales, y en la 4.5, que pide revisar la pantalla con un simulador de daltonismo.

**Pantalla.** Tarjetas de plantas candidatas, fila "Mascotas".

**Problema.** "Segura" se mostraba en verde oscuro y "Tóxica" en rojo oscuro, sin otra señal. En la simulación de deuteranopía, los dos se ven del mismo verde oliva, así que el aviso de que la planta es tóxica para la mascota pierde fuerza.

**Cambio.** Cada valor lleva ahora un ícono con forma distinta. Segura tiene una marca de visto, Con precaución un círculo con signo de exclamación y Tóxica un triángulo de advertencia. La diferencia se nota por la forma aunque no se distinga el color.

### Regla 4.7

**Regla.** No utilizar diferencias de color muy sutiles o pálidas. Se apoya en la regla 4.2, que pide asegurar un alto contraste.

**Pantalla.** Textos de ejemplo de la barra de escritura y del buscador del panel "Tu jardín".

**Problema.** El texto de ejemplo ("Describe tu espacio, luz, riego o si hay mascotas…") era tan pálido que su contraste con el fondo era de 3,4 a 1, por debajo del 4,5 a 1 recomendado. Ese texto le indica al usuario qué escribir, así que debe leerse bien.

**Cambio.** Se oscureció el color de los textos de ejemplo (de #9a826c a #836a56). Ahora el contraste es de 4,7 a 1 y el texto sigue viéndose más claro que lo que escribe el usuario.

## Capítulo 5 · Our Peripheral Vision is Poor

### Regla 5.6

**Regla.** No usar el color rojo para información que no sea de error, a menos que existan convenciones específicas que lo dicten.

**Pantalla.** Franja "Asumí algo que no me dijiste", bloque "Tu mensaje" y aviso de mascotas debajo de las plantas candidatas.

**Problema.** Los tres usaban rojo o rosado rojizo (borde, ícono o etiqueta), aunque ninguno es un error. La franja hace una pregunta, "Tu mensaje" repite lo que escribió el usuario y el aviso es una precaución. Con tanto rojo, el color dejaba de servir para señalar lo que sí es grave, como una planta tóxica.

**Cambio.** La franja de supuestos y el aviso de mascotas pasaron a ámbar, que llama la atención sin sugerir un error. "Tu mensaje" pasó a un tono café neutro. El rojo queda para los riesgos y los errores.

### Regla 5.3

**Regla.** Utilizar símbolos de error (como ! o X) para mejorar la visibilidad.

**Pantalla.** Aviso de mascotas debajo de las plantas candidatas.

**Problema.** El aviso recomienda confirmar con un veterinario si una planta es tóxica, pero era solo texto, sin ningún símbolo, y se confundía con el resto de la página.

**Cambio.** El aviso lleva delante un triángulo de advertencia, el mismo que acompaña a "Tóxica" en las tarjetas. Así resalta y se relaciona con ese dato.

### Regla 5.7

**Regla.** No usar mensajes emergentes modales del sistema a menos que el programa vaya a fallar gravemente o haya riesgo vital.

**Pantalla.** Historial, pestaña Heredado, botón "Quitar" de un dato del usuario.

**Problema.** Al quitar un dato aparecía la ventana de confirmación del navegador, que bloquea toda la página y aparece lejos del botón, por una acción que no es grave.

**Cambio.** La confirmación aparece dentro del mismo dato, en el lugar del botón. Pregunta "¿Quitar este dato?" y ofrece "Sí, quitar" y "No".

### Regla 5.8

**Regla.** No usar movimientos o parpadeos prolongados en la pantalla, ya que se vuelven una molestia consciente.

**Pantalla.** Vista Árbol.

**Problema.** El punto que marca la respuesta actual parpadeaba sin parar mientras el Árbol estaba abierto. El movimiento atraía la mirada una y otra vez mientras el usuario leía los títulos, sin avisar nada nuevo.

**Cambio.** El punto queda fijo. La respuesta actual se sigue reconociendo por el punto y por su título en negrita y en verde.

## Capítulo 6

### Regla 6.6 (con apoyo de la 6.1)

**Regla.** No usar vocabulario poco común, desconocido o jerga técnica. La 6.1 pide además un vocabulario restringido y consistente.

**Pantalla.** Todas: respuesta, panel izquierdo, caja de escritura, Contexto, Historial, Buscar, Árbol y avisos breves.

**Problema.** La interfaz usaba palabras del código ("carta", "hilo", "ámbito", "global", "heredado", "linaje", "lámina") y llamaba a una misma cosa de varias formas ("hilo", "línea" y "rama" para una conversación). La misma elección de alcance tenía dos juegos de nombres.

**Cambio.** Se usan pocas palabras y siempre las mismas:
- "Carta" pasa a "Nota".
- "Hilo", "línea" y "rama" pasan a "conversación" ("Conversación nueva", "Todas las conversaciones").
- "2 líneas" pasa a "2 continuaciones".
- El estado "Lista" pasa a "Completa".
- Se quita la etiqueta "Herbario" que aparecía como modelo de cada respuesta.
- "Heredado" y "Revisar herencia" pasan a "De otras respuestas" y "Ver de dónde vienen".
- "Ámbito: hilo, especie o global" pasa a "Se aplica a: esta conversación, esta planta o siempre", igual que en el recuadro de las palabras con "?".
- "Reformular" pasa a "Editar mi pregunta".
- En el Árbol, "linaje", "raíz", "bifurcación" y "consulta" pasan a "respuestas", "conversaciones" y "continuaciones".
- "Supuestos" pasa a "suposiciones", con singular correcto ("1 suposición").
- Los avisos breves dejan de decir "lámina", "versionado", "ámbito" y "rama".

### Regla 6.4 (con apoyo de la 6.6)

**Regla.** Minimizar la cantidad de texto en prosa y reducir a la mitad las instrucciones en la interfaz. La 6.6 pide no usar jerga técnica.

**Pantalla.** Encabezado de la respuesta, después de "Otra versión" o de actualizar una respuesta desactualizada.

**Problema.** Aparecía la etiqueta "v3 → v4 · síntesis actualizada · 3 → 5 pasos". Usaba lenguaje de programador, el número de versión no permitía volver a la anterior y además subía con acciones que el usuario no relaciona con una versión nueva. El aviso breve "Respuesta actualizada" y el cambio de "Desactualizada" a "Completa" ya muestran que la respuesta cambió.

**Cambio.** Se quitó la etiqueta. El botón "Recalcular" pasa a "Actualizar respuesta".

### Regla 6.4 (instrucciones)

**Regla.** Minimizar la cantidad de texto en prosa y reducir a la mitad las instrucciones en la interfaz.

**Pantalla.** Contexto de la respuesta, aviso de la caja de escritura, Historial y Árbol.

**Problema.** Varias instrucciones eran largas o repetían lo que ya se ve: "Tu mensaje está arriba, siempre visible.", "registro, no chat", "Confirmar o corregir versiona y marca dependientes como desactualizadas.", "El borde olivo marca tu posición." y dos frases largas en el aviso de la caja de escritura.

**Cambio.** Cada instrucción queda en una frase corta o se quita:
- Contexto queda en "Tus datos, lo que la IA supuso y lo que propuso."
- El encabezado del Historial ya no dice "registro, no chat".
- El pie del Historial dice "Si corriges una suposición, se marcan las respuestas que dependen de ella."
- El pie del Árbol dice "Haz clic en una respuesta para abrirla."
- El aviso de la caja de escritura dice "Lo que generes abre una conversación nueva." o "La respuesta original no cambia."

### Regla 6.12

**Regla.** No centrar párrafos de múltiples líneas.

**Pantalla.** Entrada "¿Qué quieres entender hoy?".

**Problema.** El texto debajo del título estaba centrado y ocupaba dos líneas, lo que obliga a buscar el inicio de la segunda línea. Además decía "botánica" y "prompt".

**Cambio.** El texto queda en una sola línea: "No necesitas saber de plantas. Cuéntame lo que ves y te pregunto lo que falte."

## Capítulo 7

### Regla 7.5

**Regla.** Mostrar los términos de búsqueda introducidos en la página de resultados.

**Pantalla.** Buscar.

**Problema.** Los resultados mostraban un trozo del texto, pero la palabra buscada no se distinguía. El usuario tenía que leer cada línea para saber dónde aparecía y por qué salió ese resultado.

**Cambio.** La palabra buscada se resalta con fondo ocre y en negrita en el título y en el trozo de texto de cada resultado.

### Regla 7.8

**Regla.** Proveer migas de pan como recordatorios en jerarquías que tengan más de dos niveles de profundidad.

**Pantalla.** Barra superior, en una respuesta que continúa a otra.

**Problema.** Las respuestas llegan a tres niveles (respuesta, continuación y continuación de la continuación), pero la barra superior solo mostraba "conversación › respuesta actual". Se saltaba los niveles del medio y no se podía hacer clic en ninguno.

**Cambio.** La barra superior muestra el camino completo, "conversación › respuestas anteriores › respuesta actual". Cada respuesta anterior está subrayada y lleva a ella con un clic. La actual va en negrita.

### Regla 7.13

**Regla.** No poner llamadas a la acción que compitan entre sí en una sola página.

**Pantalla.** Respuesta, panel izquierdo e Historial.

**Problema.** En la pantalla de la respuesta había hasta seis botones rojos a la vez: "Nueva", "Confirmar", tres "Elegir esta" y "Generar". Con el mismo peso, ninguno destacaba como la acción principal.

**Cambio.** "Nueva", "Confirmar" y "Elegir esta" pasan a botones normales con borde. Solo "Generar" queda rojo, y se enciende cuando hay algo escrito. Los botones que aparecen solos en un aviso, como "Actualizar respuesta" o "Reanudar", siguen rojos porque en ese momento son la única acción.

## Capítulo 8

### Regla 8.3

**Regla.** Utilizar ayudas de memoria externas que indiquen lo que el usuario ya hizo, y permitirle marcar objetos para seguir su progreso.

**Pantalla.** Respuesta, bloque "Qué hacer".

**Problema.** Los pasos eran una lista numerada que no se podía marcar. Son tareas que el usuario hace con la planta en la mano y en distintos momentos, así que al volver tenía que recordar por cuál iba.

**Cambio.** Cada paso tiene una casilla. El paso marcado se ve tachado y más claro, y junto al título dice cuántos van, por ejemplo "1 de 4 hechos". Lo marcado se guarda y sigue ahí al volver a la respuesta. Si la respuesta se vuelve a generar, las marcas se borran porque los pasos pueden cambiar.

### Regla 8.2

**Regla.** Hacer que los cambios importantes en pantalla sean muy evidentes, para vencer la ceguera al cambio.

**Pantalla.** Respuesta desactualizada, después de tocar "Actualizar respuesta".

**Problema.** Al tocar el botón, el aviso de arriba desaparecía y el contenido cambiaba sin ninguna marca. La única señal era el aviso breve de abajo, lejos de donde el usuario miraba y por pocos segundos.

**Cambio.** En el mismo lugar del aviso aparece uno verde que dice "La respuesta se actualizó con tus cambios." Se queda hasta que el usuario lo cierra o abre otra respuesta.

### Regla 8.8

**Regla.** No obligar al usuario a pensar detenidamente en la herramienta en lugar de su tarea principal.

**Pantalla.** Historial, menú "Más" o "Ajustar" de cada nota.

**Problema.** El botón "Se aplica a: esta conversación" cambiaba de opción con cada clic, en ciclo. El usuario no veía las tres opciones juntas y tenía que tocar varias veces y adivinar cuál venía después.

**Cambio.** Bajo el título "Se aplica a" se muestran las tres opciones, "Esta conversación", "Esta planta" y "Siempre", con la elegida marcada con un visto. Un clic elige directamente la que se quiere.
