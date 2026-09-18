# 🤖 Trabajo Práctico N° 2: Búsqueda No Informada (Búsqueda a Ciegas)
## Cátedra: Laboratorio I &bull; Área de Inteligencia Artificial y Robótica
### Universidad Católica de Santiago del Estero (UCSE) &bull; Departamento Académico San Salvador (DASS)
**Carrera:** Tecnicatura Universitaria en Automatización y Robótica / Informática  
**Docente / Jefe de Trabajos Prácticos:** Ing. Fabio D. Argañaraz  
**Ciclo Lectivo:** 2026 &bull; **Modalidad:** Individual &bull; Autoevaluativo  

---

## 🎯 Objetivos de Aprendizaje

Al completar este Trabajo Práctico, el estudiante será capaz de:
1. **Formalizar problemas de búsqueda** identificando rigurosamente sus cuatro componentes canónicos: Estado Inicial, Acciones / Función Sucesor, Test Objetivo y Función de Costo de Camino ($g$).
2. **Diferenciar con precisión ontológica** un *Estado del Entorno* de un *Nodo del Árbol de Búsqueda* y sus atributos asociados (`state`, `parent`, `action`, `path_cost`, `depth`).
3. **Analizar la combinatoria y espacios de estados** en problemas canónicos de juguete (*Toy Problems*): Mundo de la Aspiradora, 8-Puzzle y el problema de las 8-Reinas.
4. **Comprender, comparar y evaluar las estrategias de búsqueda no informada**:
   - **BFS (Breadth-First Search):** Cola FIFO, análisis de memoria exponencial $O(b^d)$, completitud y optimalidad bajo costos uniformes.
   - **UCS (Uniform-Cost Search / Dijkstra):** Cola de prioridad guiada por $g(n)$, evaluación de meta al extraer de la frontera y cota $O(b^{1 + \lfloor C^* / \epsilon \rfloor})$.
   - **DFS (Depth-First Search):** Pila LIFO, ventaja de memoria lineal $O(b \cdot m)$, riesgos de incompletitud por ramas infinitas/ciclos y falta de optimalidad.
   - **DLS (Depth-Limited Search):** Efecto de la cota $l$ sobre la completitud ($l < d$).
   - **IDDFS (Iterative Deepening Search):** Combinación óptima de espacio lineal $O(b \cdot d)$ con completitud y optimalidad; análisis de la sobrecarga despreciable de regeneración ($\approx b/(b-1)$).
   - **Búsqueda Bidireccional:** Reducción asintótica a $O(b^{d/2})$, condición de intersección de fronteras y requerimientos de memoria.
5. **Comprender la Búsqueda en Grafos:** El axioma de la historia, prevención de caminos redundantes mediante el conjunto de explorados (*explored set* / lista cerrada) y su impacto en la memoria.

---

## 📚 Mapa Bibliográfico Obligatorio

| Ejercicio | Tema Principal | Capítulo [Russell & Norvig (AIMA 2da/3ra Ed.)](http://jdelagarza.fime.uanl.mx/IA/Libros/inteligencia-artificial-un-enfoque-moderno-stuart-j-russell.pdf) | Diapositivas de Cátedra |
|---|---|---|---|
| **Ej 1** | Formulación Formal de Problemas | Cap. 3.1 (*Problemas y soluciones bien definidas*, pp. 64-69) | Slide 4 a 15 (*Formulación del objetivo y problema*) |
| **Ej 2** | Nodo de Búsqueda vs. Estado del Mundo | Cap. 3.3 (*Búsqueda de soluciones / Nodos y estados*, pp. 74-76) | Slide 37, 42-43 (*Representación de un nodo*) |
| **Ej 3** | Espacios de Estados en Problemas de Juguete | Cap. 3.2 (*Ejemplos de problemas*, pp. 69-74) | Slide 18 a 32 (*Aspiradora, 8-puzzle y 8-reinas*) |
| **Ej 4** | Búsqueda Primero en Anchura (BFS) | Cap. 3.4.1 (*Búsqueda primero en anchura*, pp. 79-82) | Slide 48 a 51 (*1. Búsqueda primero en anchura*) |
| **Ej 5** | Búsqueda de Costo Uniforme (UCS) | Cap. 3.4.2 (*Búsqueda de costo uniforme*, pp. 82-84) | Slide 52 a 54 (*2. Búsqueda de costo uniforme*) |
| **Ej 6** | Búsqueda Primero en Profundidad (DFS) | Cap. 3.4.3 (*Búsqueda primero en profundidad*, pp. 84-87) | Slide 55 a 58 (*3. Búsqueda primero en profundidad*) |
| **Ej 7** | Profundidad Limitada (DLS) e Iterativa (IDDFS) | Cap. 3.4.4 y 3.4.5 (*Profundidad limitada e iterativa*, pp. 87-90) | Slide 59 a 64 (*4. Búsqueda primero en profundidad iterativa*) |
| **Ej 8** | Búsqueda Bidireccional | Cap. 3.4.6 (*Búsqueda bidireccional*, pp. 90-92) | Slide 65 a 75 (*5. Búsqueda bidireccional*) |
| **Ej 9** | Matriz Comparativa de Búsquedas a Ciegas | Cap. 3.4.7 Tabla 3.17 (*Evaluación de estrategias*, p. 93) | Slide 76 (*Comparación de las estrategias*) |
| **Ej 10** | Prevención de Ciclos: Árboles vs. Grafos | Cap. 3.5 (*Evitar estados repetidos / Búsqueda en grafos*, pp. 93-96) | Slide 77 a 80 (*Evitar estados repetidos y la historia*) |

---

## 🚀 Flujo de Trabajo del Estudiante (Paso a Paso)

### 1. Bifurcar y Clonar el Repositorio
1. Ingresa al repositorio oficial de cátedra:  
   [`https://github.com/UCSE-Laboratorio-I/TP2`](https://github.com/UCSE-Laboratorio-I/TP2)
2. Haz clic en el botón superior derecho **Fork** (o **Use this template**) para generar una copia en tu cuenta personal de GitHub.
3. Clona tu repositorio bifurcado en tu computadora:
   ```bash
   git clone https://github.com/TU_USUARIO_GITHUB/TP2.git
   cd TP2
   ```

### 2. Resolver la Guía Interactiva
1. Abre el archivo `index.html` con doble clic en tu navegador web preferido (Chrome, Firefox, Edge, Safari).
2. Completa tus datos personales en la cabecera (Nombre, DNI, Email, Comisión, Usuario de GitHub).
3. Resuelve los 10 ejercicios interactivos. Puedes apoyarte en los desplegables de bibliografía de cada consigna.
4. El progreso se guarda automáticamente en tu navegador (`localStorage`).
5. Al llegar al 100%, haz clic en el botón **📥 Generar y Descargar respuestas_tp2.json** y guárdalo en la raíz del repositorio (`TP2/respuestas_tp2.json`).

### 3. Autoevaluación en Terminal Local
Abre una consola o terminal en la carpeta del repositorio y ejecuta el evaluador oficial en Python:
```bash
python autograder_tp2.py respuestas_tp2.json
```
* El script evaluará tus respuestas mediante hashes criptográficos **SHA-256**, sin exponer las respuestas correctas.
* Si obtienes menos de 100 puntos, te indicará exactamente en qué ítem tuviste discrepancias y qué sección bibliográfica consultar para corregirlo antes de la entrega final.

### 4. Entrega Oficial por Git
Una vez que hayas alcanzado tu puntaje deseado (aprobación: &ge; 4.0 / 10.0; promoción: &ge; 7.0 / 10.0), registra tus cambios y súbelos a tu GitHub:
```bash
git add respuestas_tp2.json
git commit -m "Entrega Trabajo Práctico N° 2 - [Tu Nombre y Apellido]"
git push origin main
```
Luego, comparte el enlace de tu repositorio de GitHub con el equipo docente de **Laboratorio I**.

---

## 🔒 Integridad Académica y Evaluación Segura

* La rúbrica pública `rubric_tp2.json` implementa un esquema de evaluación **Zero-Knowledge** basado en firmas SHA-256 salteadas (`LAB1_IA_2026_CatedraArganaraz_SecretSalt`).
* El script `autograder_tp2.py` evalúa de forma fidedigna y objetiva cada submission sin revelar las claves del docente.
* Se prohíbe el plagio y la copia no autorizada entre estudiantes. Toda entrega está sujeta a auditoría docente.

---
&copy; 2026 Universidad Católica de Santiago del Estero &bull; DASS &bull; Cátedra de Laboratorio I (Ing. Fabio D. Argañaraz)
