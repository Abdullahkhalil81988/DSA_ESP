"""
Network Generator Module
Generates Barabási-Albert scale-free networks for disease simulation
"""
import networkx as nx
import random


class NetworkGenerator:
    """Generates and manages scale-free social networks"""
    
    def __init__(self, n_nodes=1000, m_edges=3):
        """
        Initialize network generator
        
        Args:
            n_nodes: Number of nodes in the network (1000-5000)
            m_edges: Number of edges to attach from new node (preferential attachment)
        """
        self.n_nodes = n_nodes
        self.m_edges = m_edges
        self.graph = None
        
    def generate_barabasi_albert_network(self):
        """
        Generate a Barabási-Albert scale-free network
        
        Returns:
            NetworkX graph object
        """
        # Generate BA network with preferential attachment
        self.graph = nx.barabasi_albert_graph(self.n_nodes, self.m_edges)
        
        # Add node attributes
        for node in self.graph.nodes():
            self.graph.nodes[node]['infected'] = False
            self.graph.nodes[node]['infection_time'] = -1
            
        return self.graph
    
    def get_graph_data(self):
        """
        Convert graph to JSON-serializable format for frontend
        
        Returns:
            dict with nodes and links
        """
        if self.graph is None:
            self.generate_barabasi_albert_network()
            
        nodes = []
        for node in self.graph.nodes():
            nodes.append({
                'id': node,
                'infected': self.graph.nodes[node].get('infected', False),
                'degree': self.graph.degree(node),
                'infection_time': self.graph.nodes[node].get('infection_time', -1)
            })
        
        links = []
        for source, target in self.graph.edges():
            links.append({
                'source': source,
                'target': target
            })
        
        return {
            'nodes': nodes,
            'links': links
        }
    
    def get_adjacency_list(self):
        """
        Get adjacency list representation
        
        Returns:
            dict mapping node -> list of neighbors
        """
        if self.graph is None:
            self.generate_barabasi_albert_network()
            
        adj_list = {}
        for node in self.graph.nodes():
            adj_list[node] = list(self.graph.neighbors(node))
        
        return adj_list
    
    def get_degree_distribution(self):
        """
        Calculate degree distribution for analysis
        
        Returns:
            dict with degree statistics
        """
        if self.graph is None:
            return {}
            
        degrees = [d for n, d in self.graph.degree()]
        return {
            'min': min(degrees),
            'max': max(degrees),
            'avg': sum(degrees) / len(degrees),
            'distribution': degrees
        }
