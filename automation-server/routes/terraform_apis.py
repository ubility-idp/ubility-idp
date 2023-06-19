from logging import exception
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

os.makedirs(f"scripts/terraform", exist_ok=True)

@app.route('/platform/terraform/run', methods=['POST'])
def runCeleryTask():
    print('fet')
    payload = check_for_token()
    if 'id' not in payload:
        return payload
    user_id = payload['id']
    app.logger.info("user id")
    app.logger.info(user_id)
    body = request.json
    file_name = body["file_name"]
    if 'terraform_variables' not in body:
        body['terraform_variables'] = {}
    task = terraform_run.delay(file_name, body['terraform_variables'])
    result = terraform_run.AsyncResult(task.id)
    return jsonify({'flow_status': result.state, 'script_name': file_name, 'task_id': task.id})

@app.route('/platform/terraform/get_terrafrom_result', methods=['POST'])
def getTerraformResult():
    try:
        data = request.get_json()
        print(data)
        task = data['task_id']
        print("getting terraform result")
        print('task ID' + task)
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
def terraform_run(file_name,terraform_variables):
    try:
        directory_name = file_name
        init_result = execute_command(
            ["terraform", f"-chdir=scripts/terraform/{directory_name}", "init"])
        if 'error' in init_result:
            return init_result
        terraform_apply_command = [
            "terraform", f"-chdir=scripts/terraform/{directory_name}", "apply", "-auto-approve"]
        print('variableeees')
        print(terraform_variables)
        if terraform_variables != {}:
            terraform_vars = terraform_variables
            for key in terraform_vars:
                print(type(terraform_vars[key]))
                if isinstance(terraform_vars[key], dict):
                    terraform_vars[key] = json.dumps(terraform_vars[key])
                terraform_apply_command.append('-var')
                terraform_apply_command.append(f'{key}={terraform_vars[key]}')
        print('terraform_apply_command')
        print(terraform_apply_command)
        apply_result = execute_command(
            terraform_apply_command, 'apply', f'scripts/terraform/{directory_name}')
        return apply_result
    except Exception as e:
        return json.dumps({'error': e}, default=str)


@app.route('/platform/terraform/uploadFile', methods=['POST'])
def terraform_upload_file():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        user_id = payload['id']
        app.logger.info("user id")
        app.logger.info(user_id)
        if 'file' not in request.files:
            print('No file part')
        file = request.files['file']
        if file.filename == '':
            return{'error': 'No selected file'}
        directory_name = file.filename.split('.')[0]
        with zipfile.ZipFile(file, 'r') as zip_ref:
            zip_ref.extractall(f'scripts/terraform/{directory_name}')
        try:
            terraform_variables = open(
                glob.glob(f"scripts/terraform/{directory_name}/*.tfvars.json")[0])
        except Exception as e:
            return {}
        terraform_variables_json = json.load(terraform_variables)
        return terraform_variables_json
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/platform/terraform/uploadVariables', methods=['POST'])
def terraform_upload_variables():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        user_id = payload['id']
        app.logger.info("user id")
        app.logger.info(user_id)
        body = request.json
        if 'file_name' not in body:
            raise Exception("No file selected")
        directory_name = body["file_name"]
        if not os.path.isdir(f"scripts/terraform/{directory_name}"):
            raise Exception(f"the directory {directory_name} does not exist")
        try:
            terraform_variables= extract_terraform_variables(f"scripts/terraform/{directory_name}")
            return jsonify(terraform_variables), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/platform/terraform/listScripts', methods=['GET'])
def terraform_list_scripts():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        scripts = [dI for dI in os.listdir(
            'scripts/terraform') if os.path.isdir(os.path.join('scripts/terraform', dI))]
        # scripts = [x[0].split("/")[1] if x[0]!="scripts" else x[0] for x in os.walk("scripts")]
        # del scripts[0]
        print(scripts)
        return {"scripts": scripts}
    except Exception as e:
        return json.dumps({'error': e}, default=str)


@app.route('/platform/terraform/deleteScripts', methods=['POST'])
def terraform_delete_scripts():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        body = request.json
        directory_name = body["file_name"]
        result = shutil.rmtree(f'scripts/terraform/{directory_name}')
        print(result)
        return {"scripts": "Script successfully deleted"}
    except Exception as e:
        return json.dumps({'error': e}, default=str)


@app.route('/platform/cloud/login', methods=['POST'])
def cl_login():
    payload = check_for_token()
    if 'id' not in payload:
        return payload
    body = request.json
    res = cloud_login(body)
    return res