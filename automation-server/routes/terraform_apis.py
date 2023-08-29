import time
from flask import request
import json
from app import app
from routes.functions import *
import zipfile
import glob
import json
import os.path
import shutil
from app import app, celery
from models.celeryTask import CeleryTask
from Utils.file_management.github_clone import *

os.makedirs(f"scripts/terraform", exist_ok=True)


@app.route("/platform/terraform/run", methods=["POST"])
def runCeleryTask():
    print("fet")
    payload = check_for_token()
    if "id" not in payload:
        return payload
    user_id = payload["id"]
    app.logger.info("user id")
    app.logger.info(user_id)
    body = request.json
    file_name = body["file_name"]
    if "terraform_variables" not in body:
        body["terraform_variables"] = {}
    if "provider" not in body:
        app.logger.info("Provider not found!")
        return jsonify({"error": "provider is required"}), 400
    if "credentials" not in body:
        app.logger.info("Credentials not found!")
        return jsonify({"error": "no credentials where sent"}), 400
    if "file_type" not in body:
        app.logger.info("file_type not found!")
        return jsonify({"error": "no file type where sent"}), 400

    file_type = body["file_type"]

    repo_url = ""
    if file_type == "remote":
        if "repo_url" not in body:
            app.logger.info("repo_url not found!")
            return jsonify({"error": "no repo url was sent"}), 400
        else:
            repo_url = body["repo_url"]

    task = terraform_run.delay(
        file_name,
        body["terraform_variables"],
        body["provider"],
        "run",
        body["credentials"],
        file_type,
        repo_url,
    )
    result = terraform_run.AsyncResult(task.id)
    return jsonify(
        {"flow_status": result.state, "script_name": file_name, "task_id": task.id}
    )


@app.route("/platform/terraform/delete", methods=["POST"])
def runDeleteCeleryTask():
    print("fet")
    payload = check_for_token()
    if "id" not in payload:
        return payload
    user_id = payload["id"]
    app.logger.info("user id")
    app.logger.info(user_id)
    body = request.json
    file_name = body["file_name"]
    if "terraform_variables" not in body:
        body["terraform_variables"] = {}
    if "provider" not in body:
        return jsonify({"error": "provider is required"}), 400
    if "credentials" not in body:
        app.logger.info("Provider not found!")
        return jsonify({"error": "no credentials where sent"}), 400
    if "file_type" not in body:
        app.logger.info("file_type not found!")
        return jsonify({"error": "no file type was sent"}), 400

    file_type = body["file_type"]

    repo_url = ""
    if file_type == "remote":
        if "repo_url" not in body:
            app.logger.info("repo_url not found!")
            return jsonify({"error": "no repoo url where sent"}), 400
        else:
            repo_url = body["repo_url"]

    task = terraform_run.delay(
        file_name,
        body["terraform_variables"],
        body["provider"],
        "delete",
        body["credentials"],
        file_type,
        repo_url,
    )
    result = terraform_run.AsyncResult(task.id)
    return jsonify(
        {"flow_status": result.state, "script_name": file_name, "task_id": task.id}
    )


@app.route("/platform/terraform/get_terrafrom_result", methods=["POST"])
def getTerraformResult():
    try:
        data = request.get_json()
        print(data)
        task = data["task_id"]
        print("getting terraform result")
        print("task ID" + task)
        task_result = terraform_run.AsyncResult(task)
        print(task_result)
        result = {}
        if task_result.failed():
            result = {"error": str(task_result.result)}
        elif task_result.ready():
            result = task_result.get()
            if not isinstance(result, dict):
                result = result.json
                print(result)
            if isinstance(result, str):
                return jsonify({"error": "Internal Server Error"})
        else:
            result = {"flow_status": task_result.state}
        return result
    except Exception as exc:
        print(exc)
        return jsonify({"error": "Failed to get terraform result !"})


@celery.task(base=CeleryTask, track_started=True)
def terraform_run(
    file_name,
    terraform_variables,
    provider,
    action,
    credentials,
    file_type,
    repo_url="",
):
    directory_name = file_name

    app.logger.info(file_name)

    if file_type == "remote":
        try:
            if "https://github.com" not in repo_url or ".git" not in repo_url:
                return jsonify({"error": "not a valid github url"}), 400
            directory_name = repo_url.split("/")[-1].replace(".git", "")
        except Exception as e:
            app.logger.error(e)
            return jsonify({"error": "Failed to clone repo"}), 500
        clone_github(repo_url, "terraform", directory_name)
    try:
        init_result = execute_shell_command(
            ["terraform init"],
            cwd=f"scripts/terraform/{directory_name}",
        )
        app.logger.info("init_result")
        app.logger.info(init_result)
        if init_result["dataList"][2] != 0:
            raise Exception(f'error: {init_result["dataList"][1]}')

        terraform_apply_command_str = (
            f"terraform {'apply' if action == 'run' else 'destroy'} -auto-approve "
        )

        if provider == "azure" or provider == "aws":
            for key in credentials:
                terraform_apply_command_str += f'-var {key}="{credentials[key]}" '
        else:
            return json.dumps({"error": f'"{provider}" provider not accepted'})

        print("terraform variables")
        print(terraform_variables)

        if terraform_variables != {}:
            terraform_vars = terraform_variables
            for key in terraform_vars:
                print(type(terraform_vars[key]))
                if isinstance(terraform_vars[key], dict):
                    terraform_vars[key] = json.dumps(terraform_vars[key])

                terraform_apply_command_str += f'-var {key}="{terraform_vars[key]}" '

        app.logger.info("terraform_apply_command_str")
        app.logger.info(terraform_apply_command_str)

        terraform_action_result = execute_shell_command(
            terraform_apply_command_str, cwd=f"scripts/terraform/{directory_name}"
        )
        app.logger.info("terraform_action_result")
        app.logger.info(terraform_action_result)
        if terraform_action_result["dataList"][2] != 0:
            raise Exception(f'error: {terraform_action_result["dataList"][1]}')

        if action == "run":
            tf_state_path = f"scripts/terraform/{directory_name}/terraform.tfstate"

            time.sleep(1)

            if not os.path.isfile(tf_state_path):
                raise Exception("tfstate file not found")

            with open(tf_state_path, "r") as f:
                apply_result = json.load(f)
                if "outputs" in apply_result and apply_result["outputs"] != {}:
                    app.logger.info(apply_result["outputs"])
                    return apply_result["outputs"]

        return {
            "success": f"terraform {'apply' if action == 'run' else 'destroy'} action was successfull"
        }
    except Exception as e:
        return json.dumps({"error": e}, default=str)


@app.route("/platform/terraform/uploadFile", methods=["POST"])
def terraform_upload_file():
    try:
        payload = check_for_token()
        if "id" not in payload:
            return payload
        user_id = payload["id"]
        app.logger.info("user id")
        app.logger.info(user_id)
        if "file" not in request.files:
            print("No file part")
        file = request.files["file"]
        if file.filename == "":
            return {"error": "No selected file"}
        directory_name = file.filename.split(".")[0]
        with zipfile.ZipFile(file, "r") as zip_ref:
            zip_ref.extractall(f"scripts/terraform/{directory_name}")
        try:
            terraform_variables = open(
                glob.glob(f"scripts/terraform/{directory_name}/*.tfvars.json")[0]
            )
        except Exception as e:
            return {}
        terraform_variables_json = json.load(terraform_variables)
        return terraform_variables_json
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/platform/terraform/uploadVariables", methods=["POST"])
def terraform_upload_variables():
    # try:
    payload = check_for_token()
    if "id" not in payload:
        return payload
    user_id = payload["id"]
    app.logger.info("user id")
    app.logger.info(user_id)
    body = request.json
    if "file_name" not in body:
        raise Exception("No file selected")
    directory_name = body["file_name"]
    if not os.path.isdir(f"scripts/terraform/{directory_name}"):
        raise Exception(f"the directory {directory_name} does not exist")

    terraform_variables = extract_terraform_variables(
        f"scripts/terraform/{directory_name}"
    )
    return jsonify(terraform_variables), 200


@app.route("/platform/terraform/listScripts", methods=["GET"])
def terraform_list_scripts():
    try:
        payload = check_for_token()
        if "id" not in payload:
            return payload
        scripts = [
            dI
            for dI in os.listdir("scripts/terraform")
            if os.path.isdir(os.path.join("scripts/terraform", dI))
        ]
        print(scripts)
        return {"scripts": scripts}
    except Exception as e:
        return json.dumps({"error": e}, default=str)


@app.route("/platform/terraform/deleteScripts", methods=["POST"])
def terraform_delete_scripts():
    try:
        payload = check_for_token()
        if "id" not in payload:
            return payload
        body = request.json
        directory_name = body["file_name"]
        result = shutil.rmtree(f"scripts/terraform/{directory_name}")
        print(result)
        return {"scripts": "Script successfully deleted"}
    except Exception as e:
        return json.dumps({"error": e}, default=str)


@app.route("/platform/terraform/import-remote-repo", methods=["POST"])
def terraform_import_github_repo():
    try:
        payload = check_for_token()
        if "id" not in payload:
            return jsonify({"error": "user id not found"}), 403
        user_id = payload["id"]
        app.logger.info("user id")
        app.logger.info(user_id)
        body = request.json
        git_url = body["url"]
        directory = "terraform"
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    try:
        if "https://github.com" not in git_url or ".git" not in git_url:
            return jsonify({"error": "not a valid github url"}), 400
        repo_name = git_url.split("/")[-1].replace(".git", "")
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": "Failed to clone repo"}), 500

    try:
        clone_github(git_url, directory, repo_name)
        if not os.path.isdir(f"scripts/terraform/{repo_name}"):
            return jsonify({"error": f"the directory {repo_name} does not exist"}), 500

        terraform_variables = extract_terraform_variables(
            f"scripts/terraform/{repo_name}"
        )
        return jsonify(terraform_variables), 200
    except:
        return jsonify({"error": "not a valid github url"}), 400
    finally:
        path = f"scripts/terraform/{repo_name}"
        if os.path.exists(path):
            shutil.rmtree(path)
