from decouple import config

###File to help building the .env file
SECRET_KEY = config("SECRET_KEY")
# Broker settings.
broker_url = "amqp://guest:guest@rabbit:5672//"
broker_heartbeat = 0
task_annotations = {
    "routes.terraform_apis.terraform_run": {"time_limit": 10000.0},
    "routes.terraform_apis.terraform_delete": {"time_limit": 10000.0},
}
broker_transport_options = {
    "fanout_prefix": True,
    "fanout_patterns": True,
    "visibility_timeout": 86400,
    "broker_connection_timeout": 10.0,
    "max_retries": 3,
    "interval_start": 0,
    "interval_step": 0.2,
    "interval_max": 0.5,
}
# List of modules to import when the Celery worker starts.
imports = "routes.terraform_apis"
task_default_queue = "scripting"
task_default_exchange = "default"
task_default_routing_key = "scripting"
# Using the database to store task state and results.
result_backend = "redis://redis:6379/0"
result_persistent = False

accept_content = ["json", "pickle"]

result_serializer = "pickle"
timezone = "UTC"
task_serializer = "pickle"


"""
? QUESTION MARK
! PAY ATTENTION
* Normal comment
todo1- edit file
// te
"""
