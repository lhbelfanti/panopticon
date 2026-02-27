# Sistema para detectar Adverse Human Behaviours

## Panopticon Frontend

#### Tarea: Pantalla de login

- [ ] Agregar el título | `Estado: TO DO` | `Lenguaje: Typescript` | `Herramienta: React Router`
- [ ] Agregar el logo | `Estado: TO DO`
- [ ] Campos de texto de user y password | `Estado: TO DO`
- [ ] Configurar la lógica de redirección al Dashboard tras un login exitoso. | `Estado: TO DO`
  - *Nota:* Agregar manejo de errores (credenciales incorrectas, etc.)
- [ ] Configurar la llamada a la API para el login y registro | `Estado: TO DO`
  - *Nota:* Usar mocks hasta que el backend Panoptic esté completo
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Barra lateral de navegación (componente global)

- [ ] Crear el componente Sidebar persistente | `Estado: TO DO` | `Lenguaje: Typescript`
  - *Nota:* Agregar el logo Agregar el nombre de la app (Panopticon) Agregar descripción (Plataforma de análisis de AHBs por ejemplo) Implementar el modo colapsable (mini sidebar) para optimizar espacio.
- [ ] Agregar enlaces de navegación | `Estado: TO DO`
  - *Nota:* 2 secciones: - Acciones Rápidas (Nueva Entrada y Nuevo Proyecto) - Tus Proyectos (listar cada uno de los proyectos, por defecto hay uno que se llama Default)
- [ ] Configurar la llamada a la API para obtener los proyectos del usuario | `Estado: TO DO`
  - *Nota:* Usar mocks hasta que el backend Panoptic esté completo
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Pantalla de Bienvenida

- [ ] Agregar el título y subtitulo de bienvenida | `Estado: TO DO` | `Lenguaje: Typescript`
  - *Nota:* Agregar la versión al lado del subtítulo
- [ ] Agregar acción de Nuevo Proyecto | `Estado: TO DO`
  - *Nota:* Redirige a la pantalla de Nuevo Proyecto
- [ ] Agregar acción de Nueva Entrada | `Estado: TO DO`
  - *Nota:* Redirige a la pantalla de Nueva Entrada
- [ ] Agregar sección de resumen de actividad | `Estado: TO DO`
  - *Nota:* Tweets analizados, Proyectos activos, precisión promedio, tokens restantes (este último hay que revisar como hacerlo)
- [ ] Configurar la llamada a la API para obtener los datos de la sección de resumen de actividad | `Estado: TO DO`
  - *Nota:* Usar mocks hasta que el backend Panoptic esté completo
- [ ] Agregar sección de actividad reciente | `Estado: TO DO`
  - *Nota:* Muestra las últimas actividades: proyectos creados, csv subidos, X cantidad de tweets agregados manualmente (esto es más un agrupador), predicciones realizadas con X modelo
- [ ] Configurar la llamada a la API para obtener los datos de la sección de actividad reciente | `Estado: TO DO`
  - *Nota:* Usar mocks hasta que el backend Panoptic esté completo
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Pantalla de Nuevo Proyecto

- [ ] Crear formulario con campos | `Estado: TO DO` | `Lenguaje: Typescript`
  - *Nota:* Campos: Nombre de proyecto (obligatorio), descripción (opcional)
- [ ] Crear sección de selección de Comportamiento humano adverso | `Estado: TO DO`
  - *Nota:* Es parte del formulario, se puede seleccionar 1 o varias opciones
- [ ] Implementar el botón de ejecución y el estado de carga (loading). | `Estado: TO DO`
  - *Nota:* Al finalizar retorna a la pantalla de Proyecto, con el Proyecto creado abierto
- [ ] Implementar el botón de volver | `Estado: TO DO`
  - *Nota:* Retorna a la Pantalla de Bienvenida
- [ ] Configurar la llamada a la API para persistir el nuevo proyecto. | `Estado: TO DO`
  - *Nota:* Usar mocks hasta que el backend Panoptic esté completo
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Pantalla de Nueva Entrada

- [ ] Implementar selector de proyecto existente | `Estado: TO DO` | `Lenguaje: Typescript`
- [ ] Crear los selectores de red social, proyecto destino y modelo | `Estado: TO DO`
  - *Nota:* El selector de red social estará fijo en "X / Twitter"
- [ ] Configurar la llamada a la API para obtener los proyectos activos, las redes sociales disponibles y los modelos disponibles | `Estado: TO DO`
- [ ] Crear sistema de tabs para agregar un único tweet o múltiples tweets | `Estado: TO DO`
  - *Nota:* Para los tweets grupales la sección de subir archivo Para los tweets individuales se debe mostrar 2 inputs (1 para el texto del tweet y 1 para el texto del quote si es que tiene), y los checkbox para seleccionar si el tweet es una respuesta, es una cita, y lo mismo para el quote (esto es más que nada para mostrarlo visualmente luego).
- [ ] Implementar el botón de ejecución y el estado de carga (loading) | `Estado: TO DO`
  - *Nota:* Al finalizar retorna a la Pantalla de Proyecto en el que sea agregó este/estas entrada/s
- [ ] Implementar el botón de volver | `Estado: TO DO`
  - *Nota:* Retorna a la Pantalla de Bienvenida o a la Pantalla de Vista de Proyecto
- [ ] Configurar la llamada a la API para persistir las nuevas entradas | `Estado: TO DO`
  - *Nota:* Usar mocks hasta que el backend Panoptic esté completo
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Pantalla de Proyecto

- [ ] Diseñar la tabla de entradas del proyecto | `Estado: TO DO` | `Lenguaje: Typescript`
  - *Nota:* Las columnas de la tabla deberán ser: ID (asignado al momento de agregar el tweet a el proyecto), modelo, Veredicto, acciones (2 acciones: remover y ver tweets, ambas representadas por un ícono)  El boton ver tweet nos abre el  Modal de Detalle de Tweet  El boton eliminar tweet, nos abre el Modal de Confirmación de Eliminación, para evitar remover accidentalmente un tweet del proyecto  La tabla debe estar paginada
- [ ] Agregar filtros para la tabla | `Estado: TO DO`
  - *Nota:* La tabla va a tener un componente encima de ella que nos permita filtrarla. Para eso primero hay que elegir por qué columna se quiere filtrar y luego escribir el texto que se quiera filtrar en el caso de ID y Texto del Tweet, para los casos de Modelo y Veredicto se desplegará un combobox para seleccionar la opción
- [ ] Configurar la llamada a la API para obtener la data para popular la tabla de entradas del proyecto | `Estado: TO DO`
  - *Nota:* Agregar paginación y filtros por id, texto del tweet, modelo y veredicto
- [ ] Agregar boton para exportar los datos del proyecto | `Estado: TO DO`
  - *Nota:* Esto es básicamente exportar la tabla completa
- [ ] Configurar la llamada a la API para obtener el archivo para descargar | `Estado: TO DO`
  - *Nota:* Descarga un archivo .csv  Usar mocks hasta que el backend Panoptic esté completo
- [ ] Agregar boton para agregar más entradas al proyecto | `Estado: TO DO`
  - *Nota:* Nos lleva a la Pantalla de Nueva Entrada, con el proyecto ya seleccionado en el combobox
- [ ] Agregar boton de Analizar Pendientes | `Estado: TO DO`
  - *Nota:* Este boton muestra un cartelito que dice que las entradas se están analizando y te manda a clickear el boton "Predicciones" para ver el progreso  Cambia de estado a las entradas en Pending a Processing
- [ ] Configurar la llamada a la API para generar predicciones | `Estado: TO DO`
  - *Nota:* Luego de unos segundos se deberá actualizar la tabla para que se refleje el cambio de las entradas a Processing  Usar mocks hasta que el backend Panoptic esté completo
- [ ] Agregar boton para ver el listado de predicciones | `Estado: TO DO`
  - *Nota:* Esto nos abre el Modal de Predicciones
- [ ] Agregar boton para ver las estadísticas del proyecto | `Estado: TO DO`
  - *Nota:* Esto nos abre el Modal de Estadísticas del Proyecto
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Modal de Detalle de la entrada

- [ ] Diseñar la vista expandida del tweet | `Estado: TO DO` | `Lenguaje: Typescript`
  - *Nota:* Tweet, quote, y si son respuestas o citas
- [ ] Mostrar el desglose de la predicción | `Estado: TO DO`
  - *Nota:* Probabilidades por categoría
- [ ] Agregar visualización del modelo utilizado para esa predicción | `Estado: TO DO`
- [ ] Implementar el cierre del modal | `Estado: TO DO`
  - *Nota:* Esc / Botón cerrar
- [ ] Configurar la llamada a la API para obtener los datos para cargar este modal | `Estado: TO DO`
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Modal de Detalle de Confirmación de Eliminación

- [ ] Agregar mensaje de confirmación | `Estado: TO DO` | `Lenguaje: Typescript`
  - *Nota:* ¿Seguro que desea eliminar la entrada (ID de la entrada) del proyecto X?
- [ ] Agregar botones de si o no | `Estado: TO DO`
- [ ] Configurar la llamada a la API para borrar una entrada del proyecto | `Estado: TO DO`
  - *Nota:* Usar mocks hasta que el backend Panoptic esté completo
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Modal de Predicciones

- [ ] Agregar titulo | `Estado: TO DO` | `Lenguaje: Typescript`
- [ ] Diseñar la lista o tabla interior para mostrar las Entradas en progreso | `Estado: TO DO`
  - *Nota:* Implementar paginación o scroll infinito si la cantidad de Entradas es muy alta
- [ ] Elementos de la tabla | `Estado: TO DO`
  - *Nota:* Cada elemento de la tabla debe tener: - Número/ID de predicción - Total de entradas procesadas (para los finalizados) y una barra de progreso con un contador de x/total - Fecha de inicio - Fecha de fin - Identificador visuale (badges o spinners) para los estados: Pendiente, Procesando, Completado y Error.
- [ ] Implementar el cierre del modal | `Estado: TO DO`
  - *Nota:* Esc / Botón cerrar
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Modal de Estadísticas del Proyecto

- [ ] Integrar librería de gráficos | `Estado: TO DO` | `Lenguaje: Typescript`
  - *Nota:* Recharts o similar
- [ ] Agregar algunos insights rápidos | `Estado: TO DO`
  - *Nota:* Total de tweets analizados, cuantos fueron positivos, cuantos negativos y cuantos están pendientes
- [ ] Crear gráfico de torta para la distribución de los veredictos del proyecto | `Estado: TO DO`
- [ ] Implementar gráfico de barras para comparar rendimiento de modelos | `Estado: TO DO`
- [ ] Agregar boton para exportar la "lista completa de tweets para calcular mis propias estadisticas" | `Estado: TO DO`
  - *Nota:* Comparte el mismo comportamiento que el boton de exportar de la pantalla del proyecto. Por lo tanto utiliza el mismo endpoint que ya debería estar creado.
- [ ] Implementar el cierre del modal | `Estado: TO DO`
  - *Nota:* Esc / Botón cerrar
- [ ] Agregar localization para el texto | `Estado: TO DO`
  - *Nota:* Inglés (default) y español

#### Tarea: Dockerizar la app

- [ ] Escribir el Dockerfile | `Estado: TO DO` | `Herramienta: Docker`
  - *Nota:* Multi-stage build para optimizar peso
- [ ] Configurar el archivo .dockerignore | `Estado: TO DO`
- [ ] Crear el archivo docker-compose.yml para orquestar con el Backend (Panoptic) | `Estado: TO DO`
  - *Nota:* Lo llamo compose.yml
- [ ] Verificar la correcta exposición de puertos y variables de entorno | `Estado: TO DO`