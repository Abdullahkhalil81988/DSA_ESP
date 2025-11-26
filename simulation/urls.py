"""
URL configuration for simulation app
"""
from django.urls import path
from . import views

app_name = 'simulation'

urlpatterns = [
    path('', views.index, name='index'),
    path('api/initialize/', views.initialize_network, name='initialize'),
    path('api/start/', views.start_simulation, name='start'),
    path('api/step/', views.simulation_step, name='step'),
    path('api/infect/', views.infect_node, name='infect'),
    path('api/reset/', views.reset_simulation, name='reset'),
    path('api/state/', views.get_state, name='state'),
]
