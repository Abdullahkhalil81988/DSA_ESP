# 🦠 Disease Spread Simulation - Interactive Network Visualization

An interactive web-based simulation of disease spreading through a Barabási-Albert scale-free network, built with Django and D3.js.

## 🎯 Features

### Core Simulation
- **Barabási-Albert Network Generation**: Creates realistic scale-free social networks with hub nodes
- **Automatic Disease Spreading**: Disease spreads probabilistically to neighboring nodes (like COVID-19)
- **Configurable Parameters**:
  - Network size (100-2000 nodes)
  - Edges per node (m parameter for preferential attachment)
  - Infection probability (0-1)
  - Initial infected count

### Interactive Visualization
- **Advanced Zoom & Pan**:
  - Mouse wheel zoom
  - Click & drag to pan
  - Zoom controls (+/- buttons)
  - Double-click node to focus with smooth animation
  
- **Node Interactions**:
  - Click any node to manually infect it
  - Hover to highlight node and its connections
  - Nodes pulse when infected
  - Larger nodes indicate hub nodes (high connectivity)

- **Visual Features**:
  - Color-coded nodes (green=healthy, red=infected)
  - Animated infection transitions
  - Links change color based on infection status
  - Node labels appear when zoomed in
  - Mini-map for overview navigation (bottom-right)

### Real-time Statistics
- Time step counter
- Total/infected/healthy node counts
- Infection rate with progress bar
- Visual infection progress tracking

### Keyboard Shortcuts
- **Space**: Single simulation step
- **P**: Toggle auto-play
- **R**: Reset simulation
- **+/-**: Zoom in/out
- **0**: Reset zoom

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Virtual environment (recommended)

### Installation

1. **Navigate to project directory**:
   ```bash
   cd /Users/abdullah/Documents/esp
   ```

2. **Activate virtual environment**:
   ```bash
   source .venv/bin/activate
   ```

3. **Install dependencies** (already installed):
   ```bash
   pip install django networkx matplotlib numpy
   ```

4. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Start the server**:
   ```bash
   python manage.py runserver
   ```

6. **Open browser**:
   Navigate to `http://127.0.0.1:8000/`

## 📊 How to Use

1. **Generate Network**: 
   - Adjust network parameters (nodes, edges)
   - Click "Generate Network"
   - Network automatically appears

2. **Configure Simulation**:
   - Set infection probability slider
   - Set number of initial infected nodes

3. **Start Simulation**:
   - Click "Start Simulation"
   - Disease begins spreading automatically

4. **Interact**:
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

Educational project for Data Structures & Algorithms course.

## 👨‍💻 Author

Created as a DSA project demonstrating practical applications of graph theory and algorithms.
