"""
Disease Spread Simulation Engine
Implements probabilistic infection spreading on social networks
"""
import random
from collections import deque


class DiseaseSimulation:
    """Manages disease spread simulation on a network"""
    
    def __init__(self, graph, infection_probability=0.3):
        """
        Initialize simulation
        
        Args:
            graph: NetworkX graph object
            infection_probability: Probability of infection transmission (0-1)
        """
        self.graph = graph
        self.infection_probability = infection_probability
        self.time_step = 0
        self.infection_history = []
        self.adjacency_list = self._build_adjacency_list()
        
    def _build_adjacency_list(self):
        """Build adjacency list for efficient traversal"""
        adj_list = {}
        for node in self.graph.nodes():
            adj_list[node] = list(self.graph.neighbors(node))
        return adj_list
    
    def infect_initial_nodes(self, num_initial=5, node_ids=None):
        """
        Infect initial nodes to start the outbreak
        
        Args:
            num_initial: Number of random nodes to infect
            node_ids: Specific node IDs to infect (overrides num_initial)
        """
        if node_ids:
            # Infect specific nodes
            for node_id in node_ids:
                if node_id in self.graph.nodes():
                    self.graph.nodes[node_id]['infected'] = True
                    self.graph.nodes[node_id]['infection_time'] = self.time_step
        else:
            # Randomly select initial infected nodes
            nodes = list(self.graph.nodes())
            initial_infected = random.sample(nodes, min(num_initial, len(nodes)))
            
            for node in initial_infected:
                self.graph.nodes[node]['infected'] = True
                self.graph.nodes[node]['infection_time'] = self.time_step
        
        self._record_state()
    
    def simulate_step(self):
        """
        Simulate one time step of disease spread
        
        Returns:
            dict with newly infected nodes and statistics
        """
        self.time_step += 1
        newly_infected = []
        
        # Get currently infected nodes
        infected_nodes = [n for n in self.graph.nodes() 
                         if self.graph.nodes[n]['infected']]
        
        # For each infected node, try to infect neighbors
        for infected_node in infected_nodes:
            neighbors = self.adjacency_list[infected_node]
            
            for neighbor in neighbors:
                # Only infect if neighbor is healthy
                if not self.graph.nodes[neighbor]['infected']:
                    # Probabilistic infection
                    if random.random() < self.infection_probability:
                        self.graph.nodes[neighbor]['infected'] = True
                        self.graph.nodes[neighbor]['infection_time'] = self.time_step
                        newly_infected.append(neighbor)
        
        self._record_state()
        
        return {
            'time_step': self.time_step,
            'newly_infected': newly_infected,
            'total_infected': self.get_total_infected(),
            'is_outbreak_over': len(newly_infected) == 0
        }
    
    def infect_node(self, node_id):
        """
        Manually infect a specific node (for user interaction)
        
        Args:
            node_id: ID of node to infect
            
        Returns:
            bool: True if infection successful
        """
        if node_id in self.graph.nodes() and not self.graph.nodes[node_id]['infected']:
            self.graph.nodes[node_id]['infected'] = True
            self.graph.nodes[node_id]['infection_time'] = self.time_step
            self._record_state()
            return True
        return False
    
    def get_total_infected(self):
        """Get count of infected nodes"""
        return sum(1 for n in self.graph.nodes() if self.graph.nodes[n]['infected'])
    
    def get_infection_state(self):
        """
        Get current infection state of all nodes
        
        Returns:
            dict mapping node_id -> infection status
        """
        return {
            node: {
                'infected': self.graph.nodes[node]['infected'],
                'infection_time': self.graph.nodes[node]['infection_time']
            }
            for node in self.graph.nodes()
        }
    
    def reset_simulation(self):
        """Reset all nodes to healthy state"""
        self.time_step = 0
        self.infection_history = []
        
        for node in self.graph.nodes():
            self.graph.nodes[node]['infected'] = False
            self.graph.nodes[node]['infection_time'] = -1
    
    def _record_state(self):
        """Record current state in history"""
        self.infection_history.append({
            'time_step': self.time_step,
            'infected_count': self.get_total_infected(),
            'infected_nodes': [n for n in self.graph.nodes() 
                             if self.graph.nodes[n]['infected']]
        })
    
    def get_statistics(self):
        """
        Get simulation statistics
        
        Returns:
            dict with outbreak statistics
        """
        total_nodes = self.graph.number_of_nodes()
        infected_count = self.get_total_infected()
        
        return {
            'time_step': self.time_step,
            'total_nodes': total_nodes,
            'infected_count': infected_count,
            'healthy_count': total_nodes - infected_count,
            'infection_rate': infected_count / total_nodes if total_nodes > 0 else 0,
            'infection_probability': self.infection_probability,
            'history': self.infection_history
        }
