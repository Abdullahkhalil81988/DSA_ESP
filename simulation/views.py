from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .algorithms.network_generator import NetworkGenerator
from .algorithms.disease_engine import DiseaseSimulation

# Global simulation state (in production, use session or database)
simulation_state = {
    'network_gen': None,
    'simulation': None,
    'graph': None
}


def index(request):
    """Main simulation page"""
    return render(request, 'simulation/index.html')


@csrf_exempt
def initialize_network(request):
    """Initialize a new Barabási-Albert network"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            n_nodes = data.get('n_nodes', 1000)
            m_edges = data.get('m_edges', 3)
            
            # Generate network
            network_gen = NetworkGenerator(n_nodes=n_nodes, m_edges=m_edges)
            graph = network_gen.generate_barabasi_albert_network()
            
            # Store in global state
            simulation_state['network_gen'] = network_gen
            simulation_state['graph'] = graph
            simulation_state['simulation'] = None
            
            # Return graph data
            graph_data = network_gen.get_graph_data()
            
            return JsonResponse({
                'status': 'success',
                'graph': graph_data,
                'stats': {
                    'total_nodes': n_nodes,
                    'total_edges': graph.number_of_edges()
                }
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'POST required'}, status=405)


@csrf_exempt
def start_simulation(request):
    """Start disease simulation with initial infected nodes"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            infection_prob = data.get('infection_probability', 0.3)
            num_initial = data.get('num_initial', 5)
            initial_nodes = data.get('initial_nodes', None)
            
            if simulation_state['graph'] is None:
                return JsonResponse({
                    'status': 'error', 
                    'message': 'Network not initialized'
                }, status=400)
            
            # Create simulation
            sim = DiseaseSimulation(
                simulation_state['graph'], 
                infection_probability=infection_prob
            )
            
            # Infect initial nodes
            sim.infect_initial_nodes(
                num_initial=num_initial,
                node_ids=initial_nodes
            )
            
            simulation_state['simulation'] = sim
            
            # Return initial state
            return JsonResponse({
                'status': 'success',
                'infection_state': sim.get_infection_state(),
                'statistics': sim.get_statistics()
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'POST required'}, status=405)


@csrf_exempt
def simulation_step(request):
    """Execute one simulation step"""
    if request.method == 'POST':
        try:
            if simulation_state['simulation'] is None:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Simulation not started'
                }, status=400)
            
            sim = simulation_state['simulation']
            step_result = sim.simulate_step()
            
            return JsonResponse({
                'status': 'success',
                'step_result': step_result,
                'infection_state': sim.get_infection_state(),
                'statistics': sim.get_statistics()
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'POST required'}, status=405)


@csrf_exempt
def infect_node(request):
    """Manually infect a specific node"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            node_id = data.get('node_id')
            
            if simulation_state['simulation'] is None:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Simulation not started'
                }, status=400)
            
            sim = simulation_state['simulation']
            success = sim.infect_node(node_id)
            
            return JsonResponse({
                'status': 'success',
                'infected': success,
                'infection_state': sim.get_infection_state(),
                'statistics': sim.get_statistics()
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'POST required'}, status=405)


@csrf_exempt
def reset_simulation(request):
    """Reset the simulation"""
    if request.method == 'POST':
        try:
            if simulation_state['simulation']:
                simulation_state['simulation'].reset_simulation()
            
            return JsonResponse({
                'status': 'success',
                'message': 'Simulation reset'
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'POST required'}, status=405)


def get_state(request):
    """Get current simulation state"""
    if simulation_state['simulation']:
        return JsonResponse({
            'status': 'success',
            'infection_state': simulation_state['simulation'].get_infection_state(),
            'statistics': simulation_state['simulation'].get_statistics()
        })
    else:
        return JsonResponse({
            'status': 'no_simulation',
            'message': 'No active simulation'
        })
