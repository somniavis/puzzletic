# 🎓 Game Skills & Learning Framework

This document serves as the unified source of truth for the pedagogical and cognitive frameworks used in Puzzleletic. It maps every game to specific learning objectives (Math) or cognitive abilities (Brain).

---

## 1. Domain: Mathematics (수학 영역)

Our math games are designed to build foundational number sense and fluency in operations.

### Core Math Competencies (핵심 수학 능력)

| Category | Definition | Key Concepts | Why it Matters |
| :--- | :--- | :--- | :--- |
| **🔢 Number Sense**<br>(수 감각) | Understanding numbers, their relationships, and how they are affected by operations. | Counting, Cardinality, Sequencing, Comparing, Place Value, Ten Frames | The foundation for all higher-level math. |
| **➕ Addition & Subtraction**<br>(덧셈과 뺄셈) | The ability to compose and decompose numbers and understand the relationship between addition and subtraction. | Part-Whole Relationships, Making 10, Fluency, Carry/Borrow | Essential for daily life and arithmetic fluency. |
| **🧠 Mental Math Strategies**<br>(암산 전략) | Using cognitive strategies to solve problems quickly without external tools. | Front-End Method (앞에서 계산), Decomposition, Compensation | Improves calculation speed and working memory. |
| **⚡ Fluency & Speed**<br>(연산 유창성) | The ability to recall facts and perform calculations automatically and accurately. | Speed Drills, Rapid Recall | Frees up cognitive resources for complex problem-solving. |

### Math Game Mapping

| Game ID | Game Title | Primary Skill (Tag) | Concept Detail |
| :--- | :--- | :--- | :--- |
| `math-fishing-count` | **Fishing Count** | 🔢 Counting | Counting objects 1-5. Cardinality. |
| `math-round-counting` | **Round Counting** | 🔢 Counting | Rapid counting and visual-motor integration. |
| `math-number-hive` | **Number Hive** | 🔢 Sequencing | Number sequences (1-10), ordering. |
| `ten-frame-count` | **Ten Frame** | 🔢 Number Sense | Visualizing numbers using 10-frames (Grouping). |
| `math-number-balance` | **Number Balance** | ➕ Addition | Basic equations, equality (=), and balance. |
| `math-fruit-slice` | **Fruit Slice** | ➕ Part-Whole | Decomposing numbers (e.g., 5 is 2 and 3). |
| `pinwheel-pop` | **Pinwheel Pop** | ➕ Addition | Applying addition in a dynamic context. |
| `shape-sum-link` | **Shape Sum Link** | ➕ Addition | Multi-number addition by linking points into shapes. |
| `deep-sea-dive` | **Deep Sea Dive** | ➖ Subtraction | Basic subtraction facts. |
| `math-archery` | **Math Archery** | ⚡ Mixed Ops | Mixed operations (1-10) with visual targeting. |
| `math-level2-ufo-invasion` | **UFO Invasion** | ⚡ Speed Math | Fast mental calculation under time pressure. |
| `front-addition-lvX` | **Front Addition** | 🧠 Mental Math | Multi-digit addition using Front-End method. |
| `front-subtraction-lvX` | **Front Subtraction** | 🧠 Mental Math | Multi-digit subtraction using Front-End method. |

---

## 2. Domain: Brain Training (두뇌 영역)

Brain games target cognitive functions that support academic learning and daily functioning.

### Core Cognitive Competencies (핵심 두뇌 능력)

| Domain | Definition | Key Skills | Why it Matters |
| :--- | :--- | :--- | :--- |
| **📐 Spatial Perception**<br>(공간 지각력) | Understanding relationships between objects in space. | Mental Rotation, Pathfinding, Shape Recognition | Geometry, handwriting, physical coordination. |
| **🔍 Observation**<br>(관찰 및 주의력) | Noticing details and maintaining focus. | Visual Scanning, Discrimination, Sustained Attention | Foundation for learning; reduces careless errors. |
| **🧩 Logic & Reasoning**<br>(논리 및 추론력) | Analyzing patterns and deducing conclusions. | Categorization, Association, Strategy, Deductive Reasoning | Critical thinking, coding, complex problem-solving. |
| **🧠 Memory**<br>(기억력) | Storing and retrieving information. | Working Memory, Visual Memory, Sequential Memory | Reading comprehension, following multi-step instructions. |
| **⚡ Processing Speed**<br>(처리 속도) | Rapidly perceiving and responding to info. | Reaction Time, Rapid Decision Making | Improves efficiency in all tasks. |

### Brain Game Mapping

| Game ID | Game Title | Primary Skill (Tag) | Concept Detail |
| :--- | :--- | :--- | :--- |
| `maze-escape` | **Maze Escape** | 📐 Spatial | Finding paths through a maze. |
| `maze-hunter` | **Maze Hunter** | 📐 Spatial | Navigating complex spaces to find items. |
| `color-link` | **Color Link** | 📐 Spatial | Spatial planning to connect points without crossing. |
| `tic-tac-toe` | **Tic Tac Toe** | 🧩 Strategy / Logic | Adversarial planning and spatial prediction. |
| `pair-up-twin` | **Pair Up Twin** | 🔍 Observation | Visual scanning to find identical pairs. |
| `signal-hunter`| **Signal Hunter**| 🔍 Focus (Attn) | Sustained attention and impulse control (timing). |
| `wild-link` | **Wild Link** | 🧩 Categorization | Grouping items (Animals) logically. |
| `pair-up-connect`| **Pair Up Connect**| 🧩 Association | Linking related concepts (Association logic). |
| `animal-banquet` | **Animal Banquet** | 🧠 Working Memory | Holding sequential requests in mind. |

---

## 3. Implementation Guide (Future Tags)

Use these keys in `registry.ts` and `locales` to maintain consistency as the library grows.

| Domain | Tag Key | English | Korean |
| :--- | :--- | :--- | :--- |
| **Math** | `counting` | Counting | 수 세기 |
| | `sequence` | Sequencing | 수의 순서 |
| | `comparison` | Comparison | 크기 비교 |
| | `addition` | Addition | 덧셈 |
| | `subtraction` | Subtraction | 뺄셈 |
| | `multiplication` | Multiplication | 곱셈 (구구단) |
| | `division` | Division | 나눗셈 |
| | `fraction` | Fraction | 분수 |
| | `geometry` | Geometry | 도형 |
| | `measurement` | Measurement | 측정 (시계/길이/무게) |
| **Brain** | `spatial` | Spatial Perception | 공간 지각 |
| | `observation` | Observation | 관찰력 |
| | `logic` | Logic | 논리 |
| | `memory` | Memory | 기억력 |
| | `speed` | Processing Speed | 처리 속도 |
| | `strategy` | Strategy | 전략 |
| | `concentration` | Concentration | 집중력 |
