# 🦠 Disease Spread Simulation on Social Networks
### Data Structures & Algorithms Project

> **An interactive web-based epidemiological simulation modeling infectious disease propagation through scale-free social networks using graph algorithms and probabilistic models.**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.2-green.svg)](https://www.djangoproject.com/)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.2-orange.svg)](https://networkx.org/)

---

## 📋 Table of Contents
- [Overview](#-overview)
- [DSA Concepts](#-dsa-concepts-implemented)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Features](#-features)
- [Algorithm Analysis](#-algorithm-complexity-analysis)

---

## 🎯 Overview

This project simulates the spread of an infectious disease (similar to COVID-19) through a synthetic social network of thousands of individuals. It demonstrates practical applications of:
- **Graph data structures** (adjacency lists)
- **Network generation algorithms** (Barabási-Albert model)
- **Graph traversal algorithms** (BFS-like propagation)
- **Probabilistic algorithms** (Monte Carlo simulation)
- **Force-directed graph visualization**

### Academic Context
This is a Data Structures & Algorithms course project focused on modeling real-world phenomena using computational methods. The simulation explores how network topology affects epidemic dynamics and demonstrates the critical role of "hub nodes" (super-spreaders) in scale-free networks.

---

## 🧮 DSA Concepts Implemented

### 1. **Graph Data Structure**
- **Type**: Undirected graph with weighted probabilities
- **Storage**: Adjacency list representation
- **Nodes**: Individuals in the social network
- **Edges**: Social connections/interactions

### 2. **Barabási-Albert Network Generation**
- **Algorithm**: Preferential attachment model
- **Creates**: Scale-free networks with power-law degree distribution
- **Time Complexity**: O(V × m) where V = vertices, m = edges per node
- **Key Property**: Few highly-connected hubs, many low-degree nodes

### 3. **Disease Propagation Algorithm**
- **Type**: Modified Breadth-First Search (BFS)
- **Method**: Iterative graph traversal with probabilistic infection
- **Time Complexity**: O(V + E) per simulation step
- **Space Complexity**: O(V + E) for adjacency list + O(V) for state tracking

### 4. **Force-Directed Layout**
- **Visualization**: Spring embedder algorithm (frontend)
- **Optimization**: Barnes-Hut approximation using quadtree
- **Time Complexity**: O(V log V + E) per iteration

### 5. **Additional Data Structures**
- **Hash Tables**: O(1) node attribute access
- **Dynamic Arrays**: Infection history tracking
- **Random Sampling**: Fisher-Yates shuffle for initial infections

---

## 📁 Project Structure

```
disease-spread-simulation/
│
├── README.md                          # This file
├── requirements.txt                   # Python dependencies
├── .gitignore                         # Git ignore rules
├── manage.py                          # Django management script
│
├── disease_sim/                       # Django project configuration
│   ├── __init__.py
│   ├── settings.py                    # Application settings
│   ├── urls.py                        # Main URL routing
│   ├── wsgi.py                        # WSGI configuration
│   └── asgi.py                        # ASGI configuration
│
└── simulation/                        # Main application
    ├── __init__.py
    ├── apps.py                        # App configuration
    ├── urls.py                        # App URL routing
    ├── views.py                       # API endpoints & request handlers
    ├── models.py                      # Database models (minimal)
    ├── admin.py                       # Admin interface
    ├── tests.py                       # Unit tests
    │
    ├── algorithms/                    # ⭐ CORE DSA IMPLEMENTATIONS
    │   ├── __init__.py
    │   ├── network_generator.py       # Barabási-Albert graph generation
    │   └── disease_engine.py          # Disease spread simulation algorithm
    │
    ├── static/simulation/             # Frontend assets
    │   ├── css/
    │   │   └── styles.css             # Styling
    │   └── js/
    │       └── main.js                # Visualization & interaction (D3.js, Three.js)
    │
    ├── templates/simulation/          # HTML templates
    │   └── index.html                 # Main interface
    │
    └── migrations/                    # Database migrations (empty)
```

### Key Files Explained

| File | Purpose | DSA Relevance |
|------|---------|---------------|
| `algorithms/network_generator.py` | Creates Barabási-Albert scale-free networks | Graph generation, preferential attachment |
| `algorithms/disease_engine.py` | Simulates disease spread through network | BFS traversal, probabilistic algorithms |
| `views.py` | API endpoints for network & simulation control | State management, request handling |
| `static/js/main.js` | 3D/2D visualization using force-directed layout | Spring embedder algorithm, quadtree |

---

## 🚀 Installation

### Prerequisites
- **Python**: 3.8 or higher
- **pip**: Python package manager
- **Virtual Environment**: Optional (but recommended to avoid package conflicts)

### Step 1: Clone or Download Project
```bash
# Navigate to project directory
cd path/to/disease-spread-simulation
```

### Step 2: Create Virtual Environment (Optional - Can Skip)
> **Note**: You can skip this step and proceed directly to Step 3 if you want to install packages globally. However, using a virtual environment is recommended to avoid conflicts with other Python projects.

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run Database Migrations
```bash
python manage.py migrate
```
*Note: This project doesn't heavily use the database, but migrations ensure Django setup is complete.*

### Step 5: Start Development Server
```bash
python manage.py runserver
```

### Step 6: Open Application
Open your web browser and navigate to:
```
http://127.0.0.1:8000/
```

---

## 💻 Usage

### 1. Generate Network
- **Set Parameters**:
  - **Number of Nodes**: 100-2000 (population size)
  - **Edges per Node (m)**: 1-10 (controls connectivity)
- Click **"Generate Network"**
- Visualization appears automatically

### 2. Configure Simulation
- **Infection Probability**: 0.0-1.0 (transmission chance per contact)
- **Initial Infected**: Number of initially infected individuals
- **Visualization Mode**: 3D or 2D

### 3. Run Simulation
- Click **"Start Simulation"** for automatic spreading
- Click **"Single Step"** for step-by-step execution
- Click **"Auto Play"** for continuous animation
- Click **"Reset"** to clear infections

### 4. Interactive Features
- **Click nodes**: Manually infect individuals
- **Hover**: Highlight connections
- **Zoom/Pan**: Explore large networks
- **View Statistics**: Real-time infection metrics

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Single simulation step |
| `P` | Toggle auto-play |
| `R` | Reset simulation |
| `+/-` | Zoom in/out |

---

## ✨ Features

### Core Simulation
✅ **Barabási-Albert Network**: Realistic scale-free social networks  
✅ **Probabilistic Spreading**: COVID-19-like transmission model  
✅ **Configurable Parameters**: Network size, connectivity, infection rate  
✅ **Step-by-Step Execution**: Observe algorithm in action  

### Visualization
✅ **3D/2D Modes**: Three.js and D3.js implementations  
✅ **Force-Directed Layout**: Spring embedder algorithm  
✅ **Interactive Controls**: Zoom, pan, node selection  
✅ **Real-Time Updates**: Animated infection propagation  
✅ **Color Coding**: Healthy (green) vs Infected (red)  

### Analytics
✅ **Live Statistics**: Infection count, rate, timeline  
✅ **Infection Chart**: Time-series visualization  
✅ **Network Metrics**: Degree distribution, hub detection  

---

## 📊 Algorithm Complexity Analysis

### Network Generation (Barabási-Albert)
```
Time Complexity:  O(V × m)
Space Complexity: O(V + E)

Where:
  V = number of vertices (nodes)
  m = edges attached per new node
  E = total edges ≈ V × m
```

### Disease Spread (per time step)
```
Time Complexity:  O(V + E)
Space Complexity: O(V + E)

Worst Case: All nodes infected
  - Visit every infected node: O(V)
  - Check all edges: O(E)
  - Per-step complexity: O(V + E)
```

### Total Simulation
```
Time Complexity:  O(T × (V + E))

Where:
  T = time steps until outbreak ends
  Typically: T = O(log V) for scale-free networks
  
Total: O(log V × (V + E))
```

### Visualization (Force-Directed)
```
Time Complexity:  O(I × (V log V + E))

Where:
  I = iterations (typically 100-500)
  Uses Barnes-Hut quadtree optimization
  
Without optimization: O(I × (V² + E))
```

---

## 🎓 Learning Outcomes

This project demonstrates:
1. **Graph representation** and traversal algorithms
2. **Probabilistic modeling** using Monte Carlo methods
3. **Scale-free networks** and their epidemic properties
4. **Algorithm complexity analysis** in real-world scenarios
5. **Data visualization** techniques for large graphs
6. **Full-stack development** with algorithmic backend

---

## 📝 License

This project is for educational purposes as part of a Data Structures & Algorithms course.

---

## 📚 References

- **Barabási-Albert Model**: [Emergence of Scaling in Random Networks](https://arxiv.org/abs/cond-mat/9910332)
- **NetworkX Documentation**: [https://networkx.org/](https://networkx.org/)
- **Force-Directed Graphs**: [Wikipedia](https://en.wikipedia.org/wiki/Force-directed_graph_drawing)
- **Epidemiological Modeling**: SIR Model and Graph-based Approaches

---

## 👨‍💻 Authors

**DSA Course Project - Fall 2025**

- Alap Gohar (502082)
- Abdullah Khalil (501492)
- Sikandar Hussain (502808)

For questions or feedback regarding the implementation of data structures and algorithms in this project, please refer to the inline documentation in `algorithms/` directory.

---

**Happy Simulating! 🦠📊**
   - Click nodes to manually infect them
   - Use "Single Step" for step-by-step progression
   - "Auto Play" runs continuous simulation
   - Zoom in to see node details and labels

5. **Explore**:
   - Double-click nodes to focus on them
   - Hover to see connections
   - Use mini-map for navigation
   - Watch infection spread through network

## 🏗️ Project Structure

```
esp/
├── disease_sim/          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── simulation/           # Main application
│   ├── network_generator.py    # Barabási-Albert network generation
│   ├── disease_engine.py       # Disease spread simulation logic
│   ├── views.py                # Django views and API endpoints
│   ├── urls.py                 # URL routing
│   └── templates/
│       └── simulation/
│           └── index.html      # Interactive frontend
├── manage.py
└── README.md
```

## 🔬 DSA Concepts Applied

### Data Structures
- **Adjacency List**: Efficient graph representation (O(V + E) space)
- **Boolean Arrays**: Infection state tracking
- **Queues**: Time-step progression (BFS-like)
- **Hash Maps**: Node state management

### Algorithms
- **Graph Generation**: Barabási-Albert preferential attachment
- **Graph Traversal**: BFS-like infection spreading
- **Force-Directed Layout**: D3.js physics simulation

### Complexity Analysis
- **Graph Representation**: O(V + E) space
- **Simulation Step**: O(V + E) time per step
- **Total Simulation**: O(T × (V + E)) where T = time steps

## 🎨 Key Technologies

- **Backend**: Django 5.2.8
- **Frontend**: D3.js v7 (force-directed graphs)
- **Network Generation**: NetworkX
- **Data Processing**: NumPy
- **Visualization**: Matplotlib (backend)

## 🌟 Advanced Features

### Network Properties
- Power-law degree distribution
- Hub node identification
- Scale-free topology
- Preferential attachment

### Visualization Enhancements
- Smooth zoom transitions
- Dynamic link coloring
- Infection pulse animations
- Mini-map viewport indicator
- Adaptive label visibility

### User Experience
- Auto-starting simulation
- Keyboard shortcuts
- Responsive controls
- Real-time statistics
- Visual feedback on all interactions

## 📈 Future Improvements

Potential enhancements:
- Recovery mechanism (SIR model)
- Vaccination strategies
- Network comparison tools
- Export simulation data
- Multiple disease variants
- Time-series graphs
- Heatmap visualization
- Social distancing effects

## 🎓 Educational Value

This project demonstrates:
- Scale-free network properties
- Disease transmission dynamics
- Graph algorithms in practice
- Interactive data visualization
- Full-stack web development
- Real-world DSA applications

## 📝 License

End Semester Project for Data Structures & Algorithms course.

## 👨‍💻 Author

Alap Gohar - 502082
Abdullah Khalil - 501492
Sikandar Hussain - 502808
