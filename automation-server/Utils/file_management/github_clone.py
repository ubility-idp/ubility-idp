from app import app
from git import Repo
from routes.functions import *
import os
import shutil


def clone_github(git_url, directory, repo_name, token=""):
    if token is not None and token != "":
        git_url = git_url.replace("https://", "")
        git_url = f"https://{token}@{git_url}"
        app.logger.info("_____git_url_____")
        app.logger.info(git_url)
    path = f"scripts/{directory}/{repo_name}"
    if os.path.exists(path):
        shutil.rmtree(path)
    Repo.clone_from(git_url, path)
