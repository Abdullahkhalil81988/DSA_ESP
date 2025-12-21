// Global state
let graphData = null;
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let raycaster = null;
let mouse = null;
let nodeObjects = [];
let edgeObjects = [];
let hoveredNode = null;
let autoPlayInterval = null;
let isAutoPlaying = false;
let infectionChart = null;
let chartData = {
    timeSteps: [],
    infected: [],
    healthy: []
};
let currentVizType = '2d';
let d3Simulation = null;

// --- NEW Highlighting Colors ---
const healthyColor = new THREE.Color("#48bb78");
const infectedColor = new THREE.Color("#f56565");
const edgeColor = new THREE.Color("#353d4f"); // Darker edge

const highlightNodeColor = new THREE.Color("#fafad2"); // Light Goldenrod Yellow
const highlightNeighborColor = new THREE.Color("#ffffff"); // White
const highlightEdgeColor = new THREE.Color("#fafad2");

let highlightedNode = null;
let highlightedNeighbors = new Set();
let highlightedEdges = new Set();

// Update probability display
document.getElementById('infectionProb').addEventListener('input', (e) => {
    document.getElementById('probValue').textContent = parseFloat(e.target.value).toFixed(2);
});

// Show status message
function showStatus(message, type = 'loading') {
    console.log('Status:', message, type);
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
    
    if (type !== 'loading') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}

// Initialize network
async function initializeNetwork() {
    console.log('Initializing network...');
    showStatus('Generating network...', 'loading');
    
    const nNodes = parseInt(document.getElementById('nNodes').value);
    const mEdges = parseInt(document.getElementById('mEdges').value);
    const networkType = 'barabasi_albert'; // Always use Barabási-Albert
    currentVizType = document.getElementById('vizType').value;

    try {
        console.log('Fetching network data...');
        const response = await fetch('/api/initialize/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                n_nodes: nNodes, 
                m_edges: mEdges,
                network_type: networkType
            })
        });

        console.log('Response received');
        const data = await response.json();
        console.log('Data parsed:', data);
        
        if (data.status === 'success') {
            graphData = data.graph;
            console.log('Graph data loaded:', graphData.nodes.length, 'nodes');
            
            if (currentVizType === '3d') {
                renderGraph3D(graphData);
            } else {
                renderGraph2D(graphData);
            }
            
            // Display network statistics
            const stats = data.stats || {};
            console.log('Stats received:', stats);
            
            updateStats({
                total_nodes: nNodes, 
                infected_count: 0, 
                healthy_count: nNodes, 
                infection_rate: 0, 
                time_step: 0
            });
            
            document.getElementById('startBtn').disabled = false;
            
            // Build status message with available stats
            let statusMsg = 'Barabási-Albert network generated!';
            if (stats.total_edges) statusMsg += ` Edges: ${stats.total_edges}`;
            if (stats.avg_degree) statusMsg += `, Avg Degree: ${stats.avg_degree.toFixed(2)}`;
            if (stats.clustering_coefficient) statusMsg += `, Clustering: ${stats.clustering_coefficient.toFixed(3)}`;
            showStatus(statusMsg, 'success');
            
            // Reset and initialize chart
            chartData = {
                timeSteps: [0],
                infected: [0],
                healthy: [nNodes]
            };
            initializeChart();
        } else {
            console.error('Server error:', data.message);
            showStatus('Error: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
        showStatus('Network error: ' + error.message, 'error');
    }
}

// Start simulation
async function startSimulation() {
    showStatus('Starting simulation...', 'loading');
    
    const infectionProb = parseFloat(document.getElementById('infectionProb').value);
    const numInitial = parseInt(document.getElementById('numInitial').value);

    try {
        const response = await fetch('/api/start/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                infection_probability: infectionProb,
                num_initial: numInitial
            })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            updateInfectionState(data.infection_state);
            updateStats(data.statistics);
            document.getElementById('stepBtn').disabled = false;
            document.getElementById('autoBtn').disabled = false;
            document.getElementById('startBtn').disabled = true;
            showStatus('Simulation started!', 'success');
            
            // Auto-start the spreading
            toggleAutoPlay();
        } else {
            showStatus('Error: ' + data.message, 'error');
        }
    } catch (error) {
        showStatus('Network error: ' + error.message, 'error');
    }
}

// Single simulation step
async function simulationStep() {
    try {
        const response = await fetch('/api/step/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            updateInfectionState(data.infection_state);
            updateStats(data.statistics);
            
            if (data.step_result.is_outbreak_over) {
                showStatus('Outbreak has ended - no new infections', 'success');
                if (isAutoPlaying) {
                    toggleAutoPlay();
                }
            }
        }
    } catch (error) {
        console.error('Step error:', error);
    }
}

// Toggle auto play
function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    const btn = document.getElementById('autoBtn');
    
    if (isAutoPlaying) {
        btn.textContent = 'Stop Auto';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-danger');
        autoPlayInterval = setInterval(simulationStep, 1000);
    } else {
        btn.textContent = 'Auto Play';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-secondary');
        clearInterval(autoPlayInterval);
    }
}

// Infect node manually
async function infectNode(nodeId) {
    try {
        const response = await fetch('/api/infect/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({node_id: nodeId})
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            updateInfectionState(data.infection_state);
            updateStats(data.statistics);
        }
    } catch (error) {
        console.error('Infect error:', error);
    }
}

// Reset simulation
async function resetSimulation() {
    if (isAutoPlaying) {
        toggleAutoPlay();
    }
    
    try {
        await fetch('/api/reset/', {method: 'POST'});
        
        if (graphData) {
            // Reset visual state
            graphData.nodes.forEach(node => {
                node.infected = false;
            });
            updateGraph();
            updateStats({total_nodes: graphData.nodes.length, infected_count: 0, 
                        healthy_count: graphData.nodes.length, infection_rate: 0, time_step: 0});
            
            // Reset chart
            chartData = {
                timeSteps: [0],
                infected: [0],
                healthy: [graphData.nodes.length]
            };
            if (infectionChart) {
                infectionChart.data.labels = chartData.timeSteps;
                infectionChart.data.datasets[0].data = chartData.infected;
                infectionChart.data.datasets[1].data = chartData.healthy;
                infectionChart.update();
            }
        }
        
        document.getElementById('stepBtn').disabled = true;
        document.getElementById('autoBtn').disabled = true;
        document.getElementById('startBtn').disabled = false;
        showStatus('Simulation reset', 'success');
    } catch (error) {
        console.error('Reset error:', error);
    }
}

// Render graph with Three.js 3D visualization
function renderGraph3D(data) {
    try {
        console.log('Rendering 3D graph with', data.nodes.length, 'nodes and', data.links.length, 'links');
        
        const container = document.getElementById('network-graph');
        container.innerHTML = ''; // Clear existing content
        
        const width = container.clientWidth;
        const height = 700;
        
        // Initialize Three.js scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a202c); // Dark background
        scene.fog = new THREE.Fog(0x1a202c, 400, 1000); // Match fog to background
        
        // Setup camera
        camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
        camera.position.set(0, 50, 300); // Slightly further back
        
        // Setup renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Add OrbitControls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 50;
        controls.maxDistance = 500;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        scene.add(ambientLight);
        
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(1, 1, 1);
        scene.add(directionalLight1);
        
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-1, -1, -1);
        scene.add(directionalLight2);
        
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        scene.add(hemisphereLight);
        
        // Add grid helper
        const gridHelper = new THREE.GridHelper(500, 25, 0x4a5568, 0x2d3748); // Dark grid
        gridHelper.position.y = -140;
        scene.add(gridHelper);
        
        // Calculate 3D positions
        const positions = calculatePositions3D(data);
        
        // Create edges
        edgeObjects = [];
        const edgeMaterial = new THREE.LineBasicMaterial({ color: edgeColor, opacity: 0.3, transparent: true });
        
        data.links.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            const sourcePos = positions[sourceId];
            const targetPos = positions[targetId];
            
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(sourcePos.x, sourcePos.y, sourcePos.z),
                new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
            ]);
            
            const line = new THREE.Line(geometry, edgeMaterial.clone());
            line.userData = { source: sourceId, target: targetId };
            scene.add(line);
            edgeObjects.push(line);
        });
        
        // Create nodes
        nodeObjects = [];
        data.nodes.forEach(node => {
            const pos = positions[node.id];
            const radius = Math.sqrt(node.degree) * 1.2 + 3.0; // Adjusted radius
            
            const geometry = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: node.infected ? infectedColor : healthyColor,
                shininess: 80,
                specular: 0xbbbbbb
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(pos.x, pos.y, pos.z);
            sphere.userData = { nodeId: node.id, node: node };
            scene.add(sphere);
            nodeObjects.push(sphere);
        });
        
        // Setup raycaster for mouse interaction
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        
        // Mouse move handler
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);
        renderer.domElement.addEventListener('click', onMouseClick, false);
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
        
        console.log('3D graph rendered successfully');
        
    } catch (error) {
        console.error('Error in renderGraph3D:', error);
        showStatus('Error rendering 3D graph: ' + error.message, 'error');
    }
}

// Render graph with D3.js 2D visualization
function renderGraph2D(data) {
    console.log('Rendering 2D graph with', data.nodes.length, 'nodes and', data.links.length, 'links');
    const container = document.getElementById('network-graph');
    container.innerHTML = '';

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => {
            g.attr("transform", event.transform);
        }));

    const g = svg.append("g");

    d3Simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => Math.sqrt(d.degree) * 1.2 + 6));

    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("class", "link");

    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("class", d => `node ${d.infected ? 'infected' : 'healthy'}`)
        .attr("r", d => Math.sqrt(d.degree) * 1.2 + 5)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", (event, d) => highlightNeighbors2D(d, true))
        .on("mouseout", (event, d) => highlightNeighbors2D(d, false))
        .on("click", (event, d) => {
            if (!isAutoPlaying) infectNode(d.id);
        });

    node.append("title")
        .text(d => `ID: ${d.id}\nDegree: ${d.degree}\nStatus: ${d.infected ? 'Infected' : 'Healthy'}`);

    d3Simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function dragstarted(event, d) {
        if (!event.active) d3Simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) d3Simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    nodeObjects = node;
    edgeObjects = link;
}

// Highlight neighboring nodes in 2D
function highlightNeighbors2D(selectedNode, highlight) {
    nodeObjects.classed("dimmed", false);
    edgeObjects.classed("dimmed", false);
    nodeObjects.classed("highlighted-central", false);
    nodeObjects.classed("highlighted-neighbor", false);
    edgeObjects.classed("highlighted", false);

    if (highlight) {
        const neighborIds = new Set();
        const linkedEdges = new Set();
        const neighborIdsList = [];

        neighborIds.add(selectedNode.id);
        graphData.links.forEach(link => {
            if (link.source.id === selectedNode.id) {
                neighborIds.add(link.target.id);
                neighborIdsList.push(link.target.id);
                linkedEdges.add(link);
            } else if (link.target.id === selectedNode.id) {
                neighborIds.add(link.source.id);
                neighborIdsList.push(link.source.id);
                linkedEdges.add(link);
            }
        });

        // Show info panel
        document.getElementById('infoNodeId').textContent = selectedNode.id;
        document.getElementById('infoStatus').textContent = selectedNode.infected ? 'Infected' : 'Healthy';
        document.getElementById('infoStatus').className = selectedNode.infected ? 'status-infected' : 'status-healthy';
        document.getElementById('infoDegree').textContent = selectedNode.degree;
        document.getElementById('infoNeighbors').textContent = neighborIdsList.join(', ') || 'None';
        document.getElementById('nodeInfo').style.display = 'block';

        nodeObjects.classed("dimmed", d => !neighborIds.has(d.id));
        edgeObjects.classed("dimmed", d => !linkedEdges.has(d));
        nodeObjects.filter(d => d.id === selectedNode.id).classed("highlighted-central", true);
        nodeObjects.filter(d => neighborIdsList.includes(d.id)).classed("highlighted-neighbor", true);
        edgeObjects.filter(d => linkedEdges.has(d)).classed("highlighted", true);
    } else {
        document.getElementById('nodeInfo').style.display = 'none';
    }
}

// Calculate 3D positions using force-directed layout
function calculatePositions3D(data) {
    const positions = {};
    const nodes = data.nodes;
    const links = data.links;
    
    // Initialize with spherical distribution
    const radius = 120;
    nodes.forEach((node, i) => {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[node.id] = {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.sin(phi) * Math.sin(theta),
            z: radius * Math.cos(phi),
            vx: 0,
            vy: 0,
            vz: 0
        };
    });
    
    // Spring-based force simulation
    const iterations = 12;
    for (let iter = 0; iter < iterations; iter++) {
        // Reset forces
        nodes.forEach(node => {
            const pos = positions[node.id];
            pos.vx = 0;
            pos.vy = 0;
            pos.vz = 0;
        });
        
        // Spring forces along edges
        links.forEach(link => {
            const sid = link.source.id || link.source;
            const tid = link.target.id || link.target;
            const source = positions[sid];
            const target = positions[tid];
            
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dz = target.z - source.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
            
            const force = dist * 0.015;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            const fz = (dz / dist) * force;
            
            source.vx += fx;
            source.vy += fy;
            source.vz += fz;
            target.vx -= fx;
            target.vy -= fy;
            target.vz -= fz;
        });
        
        // Apply forces with damping
        const damping = 0.4 * (1 - iter / iterations);
        nodes.forEach(node => {
            const pos = positions[node.id];
            pos.x += pos.vx * damping;
            pos.y += pos.vy * damping;
            pos.z += pos.vz * damping;
        });
    }
    
    return positions;
}

// Mouse move handler for 3D
function onMouseMove(event) {
    if (currentVizType !== '3d' || !renderer || !camera || !raycaster || !nodeObjects.length) return;
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodeObjects);
    
    if (intersects.length > 0) {
        const intersectedNode = intersects[0].object.userData.node;
        if (hoveredNode !== intersectedNode) {
            if (hoveredNode) {
                highlightNeighbors3D(hoveredNode, false);
            }
            hoveredNode = intersectedNode;
            highlightNeighbors3D(hoveredNode, true);
            renderer.domElement.style.cursor = 'pointer';
        }
    } else {
        if (hoveredNode) {
            highlightNeighbors3D(hoveredNode, false);
            hoveredNode = null;
        }
        renderer.domElement.style.cursor = 'default';
    }
}

// Mouse click handler for 3D
function onMouseClick(event) {
    if (currentVizType !== '3d' || !hoveredNode || hoveredNode.infected || isAutoPlaying) return;
    if (hoveredNode) {
        infectNode(hoveredNode.id);
    }
}

// Highlight neighboring nodes in 3D
function highlightNeighbors3D(node, highlight) {
    const nodeId = node.id;

    // --- ALWAYS RESET EVERYTHING FIRST ---
    // Reset ALL nodes to their original state
    nodeObjects.forEach(obj => {
        const nodeData = graphData.nodes.find(n => n.id === obj.userData.nodeId);
        if (nodeData) {
            let originalColor = nodeData.infected ? infectedColor : healthyColor;
            obj.material.color.set(originalColor);
            obj.material.emissive.setHex(0x000000);
            obj.material.emissiveIntensity = 0;
            obj.material.shininess = 80;
            obj.material.opacity = 1.0;
            obj.scale.set(1, 1, 1);
        }
    });

    // Reset ALL edges
    edgeObjects.forEach(edge => {
        edge.material.color.set(edgeColor);
        edge.material.opacity = 0.3;
    });

    // Clear tracking variables
    highlightedNode = null;
    highlightedNeighbors.clear();
    highlightedEdges.clear();
    document.getElementById('nodeInfo').style.display = 'none';

    // --- HIGHLIGHT ---
    if (highlight) {
        const neighbors = new Set();
        const edgesToHighlight = new Set();
        const neighborIds = [];

        // Find direct neighbors and their edges
        graphData.links.forEach(link => {
            const sourceId = link.source.id || link.source;
            const targetId = link.target.id || link.target;
            let neighborId = null;

            if (sourceId === nodeId) neighborId = targetId;
            else if (targetId === nodeId) neighborId = sourceId;

            if (neighborId !== null) {
                neighbors.add(neighborId);
                neighborIds.push(neighborId);
                const edgeObj = edgeObjects.find(e => 
                    (e.userData.source === sourceId && e.userData.target === targetId) ||
                    (e.userData.source === targetId && e.userData.target === sourceId)
                );
                if(edgeObj) edgesToHighlight.add(edgeObj);
            }
        });

        // Show info panel
        document.getElementById('infoNodeId').textContent = node.id;
        document.getElementById('infoStatus').textContent = node.infected ? 'Infected' : 'Healthy';
        document.getElementById('infoStatus').className = node.infected ? 'status-infected' : 'status-healthy';
        document.getElementById('infoDegree').textContent = node.degree;
        document.getElementById('infoNeighbors').textContent = neighborIds.join(', ') || 'None';
        document.getElementById('nodeInfo').style.display = 'block';

        // Fade out non-connected elements
        nodeObjects.forEach(obj => {
            if (obj.userData.nodeId !== nodeId && !neighbors.has(obj.userData.nodeId)) {
                obj.material.opacity = 0.08;
                obj.material.transparent = true;
            }
        });
        edgeObjects.forEach(obj => {
            if (!edgesToHighlight.has(obj)) {
                obj.material.opacity = 0.08;
            }
        });

        // Highlight the central node with strong glow
        const centralNodeObject = nodeObjects.find(o => o.userData.nodeId === nodeId);
        if (centralNodeObject) {
            centralNodeObject.material.color.set(0x006400); // Dark green for hovered node
            centralNodeObject.material.emissive.set(0x00ff00); // Bright green glow
            centralNodeObject.material.emissiveIntensity = 1.2;
            centralNodeObject.material.shininess = 120;
            centralNodeObject.scale.set(1.6, 1.6, 1.6);
            centralNodeObject.material.opacity = 1.0;
            centralNodeObject.material.transparent = true;
        }

        // Highlight neighbors with yellow glow
        neighbors.forEach(neighborId => {
            const neighborObject = nodeObjects.find(o => o.userData.nodeId === neighborId);
            if (neighborObject) {
                neighborObject.material.color.set(0xffff00); // Yellow for neighboring nodes
                neighborObject.material.emissive.set(0xffff00);
                neighborObject.material.emissiveIntensity = 1.0;
                neighborObject.scale.set(1.3, 1.3, 1.3);
                neighborObject.material.opacity = 1.0;
                neighborObject.material.transparent = true;
            }
        });

        // Highlight edges with golden glow
        edgesToHighlight.forEach(edge => {
            edge.material.color.set(0xffd700); // Gold color for connecting edges
            edge.material.opacity = 0.95;
        });

        // Store what we've highlighted
        highlightedNode = nodeId;
        highlightedNeighbors = neighbors;
        highlightedEdges = edgesToHighlight;
    }
}

// Update graph colors (Three.js version)
function updateGraph() {
    if (!graphData) return;
    
    if (currentVizType === '2d') {
        // Update 2D graph
        if (!nodeObjects || !edgeObjects) return;
        
        nodeObjects
            .attr('class', d => d.infected ? 'node infected' : 'node healthy')
            .attr('r', d => Math.sqrt(d.degree || 0) * 1.2 + 5);
            
    } else {
        // Update 3D graph
        if (!nodeObjects || !edgeObjects) return;
        
        nodeObjects.forEach(obj => {
            const node = obj.userData.node;
            obj.material.color.set(node.infected ? infectedColor : healthyColor);
            obj.material.emissive.setHex(0x000000); // No base emissive color
        });
        
        // Update edge colors
        edgeObjects.forEach(edge => {
            edge.material.color.set(edgeColor);
        });
    }
}

// Update infection state
function updateInfectionState(infectionState) {
    if (!graphData) return;

    graphData.nodes.forEach(node => {
        const state = infectionState[node.id];
        if (state) {
            node.infected = state.infected;
        }
    });

    updateGraph();
}

// Update statistics
function updateStats(stats) {
    document.getElementById('timeStep').textContent = stats.time_step || 0;
    document.getElementById('totalNodes').textContent = stats.total_nodes || 0;
    document.getElementById('infectedCount').textContent = stats.infected_count || 0;
    document.getElementById('healthyCount').textContent = stats.healthy_count || 0;
    
    const infectionRate = ((stats.infection_rate || 0) * 100).toFixed(1);
    document.getElementById('infectionRate').textContent = infectionRate + '%';
    document.getElementById('infectionProgress').style.width = infectionRate + '%';
    
    // Update chart data
    updateChartData(stats);
}

// Initialize the infection chart
function initializeChart() {
    const ctx = document.getElementById('infection-chart');
    
    if (!ctx) {
        console.error('Chart canvas element not found!');
        return;
    }
    
    if (infectionChart) {
        infectionChart.destroy();
    }
    
    infectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.timeSteps,
            datasets: [
                {
                    label: 'Infected',
                    data: chartData.infected,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.25)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverBorderWidth: 3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 4,
                    shadowBlur: 12,
                    shadowColor: 'rgba(239, 68, 68, 0.5)'
                },
                {
                    label: 'Healthy',
                    data: chartData.healthy,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.25)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverBorderWidth: 3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 4,
                    shadowBlur: 12,
                    shadowColor: 'rgba(16, 185, 129, 0.5)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: {
                            size: 14,
                            weight: 'bold',
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        },
                        color: '#e2e8f0',
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    displayColors: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time Step',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#cbd5e1',
                        padding: { top: 10 }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.15)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 12
                        },
                        padding: 8
                    },
                    border: {
                        color: 'rgba(148, 163, 184, 0.3)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Nodes',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#cbd5e1',
                        padding: { bottom: 10 }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.15)',
                        lineWidth: 1
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 12
                        },
                        padding: 8
                    },
                    border: {
                        color: 'rgba(148, 163, 184, 0.3)'
                    }
                }
            },
            animation: {
                duration: 300
            }
        }
    });
}

// Update chart with new data
function updateChartData(stats) {
    if (!infectionChart) return;
    
    const timeStep = stats.time_step || 0;
    
    // Only add new data point if time step is new
    if (chartData.timeSteps.length === 0 || timeStep > chartData.timeSteps[chartData.timeSteps.length - 1]) {
        chartData.timeSteps.push(timeStep);
        chartData.infected.push(stats.infected_count || 0);
        chartData.healthy.push(stats.healthy_count || 0);
        
        // Limit to last 50 data points for performance
        if (chartData.timeSteps.length > 50) {
            chartData.timeSteps.shift();
            chartData.infected.shift();
            chartData.healthy.shift();
        }
        
        infectionChart.data.labels = chartData.timeSteps;
        infectionChart.data.datasets[0].data = chartData.infected;
        infectionChart.data.datasets[1].data = chartData.healthy;
        infectionChart.update('none'); // Update without animation for smoothness
    }
}

// Auto-generate network on load
window.addEventListener('load', () => {
    console.log('Page loaded, initializing network...');
    setTimeout(() => {
        initializeNetwork();
    }, 500);
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case ' ':
            event.preventDefault();
            if (!document.getElementById('stepBtn').disabled) {
                simulationStep();
            }
            break;
        case 'r':
        case 'R':
            resetSimulation();
            break;
        case 'p':
        case 'P':
            if (!document.getElementById('autoBtn').disabled) {
                toggleAutoPlay();
            }
            break;
    }
});