from flask import Flask
from flask_cors import CORS
import logging
import os
from logging.handlers import TimedRotatingFileHandler

from celery import Celery

app = Flask(__name__)

celery = Celery(__name__, config_source="config")
CORS(app)

log_dir_path = "./logs"
if not os.path.isdir(log_dir_path):
    os.mkdir(log_dir_path)
handler = TimedRotatingFileHandler(
    filename="./logs/platform.log", encoding="utf-8", when="midnight", interval=1
)
handler.suffix = "%Y-%m-%d"

logging.basicConfig(
    handlers=[handler],
    format="%(asctime)s %(name)s:%(levelname)s:%(message)s",
    datefmt="%F %A %T",
    level=logging.INFO,
)


@app.route("/platform/hello_world", methods=["GET"])
def hello_world():
    return "hello"


from routes.terraform_apis import *
from routes.backstage_apis import *

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
os.makedirs(f"scripts", exist_ok=True)
