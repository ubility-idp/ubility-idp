import logging
from telnetlib import EC
from flask import request
from app import app
from routes.functions import *
import zipfile
import glob
import json
import yaml
import os.path
import shutil
from app import app, celery
from models.celeryTask import CeleryTask

os.makedirs(f"scripts/ansible", exist_ok=True)
@app.route('/platform/terraform/run', methods=['POST'])
def runTerraformCelery():
    print('fet')
    payload = check_for_token()
    if 'id' not in payload:
        return payload
    user_id = payload['id']
    app.logger.info("user id")
    app.logger.info(user_id)
    body = request.json
    if 'file_path' not in body:
        return jsonify({"error": "missing file_path"})
    file_name = body["file_path"]
    if 'ansible_variables' in body:
        ansible_variables = body['ansible_variables']
    if 'hosts_variables' in body:
        hosts_variables=body['hosts_variables']
    task = ansible_run.delay(file_name,ansible_variables,hosts_variables)
    result = ansible_run.AsyncResult(task.id)
    return jsonify({'flow_status': result.state, 'script_name': file_name, 'task_id': task.id})



@app.route('/platform/ansible/get_ansible_result', methods=['POST'])
def getAnsibleResult():
    try:
        data = request.get_json()
        print(data)
        task = data['task_id']
        print("getting terraform result")
        print('task ID' + task)
        task_result = ansible_run.AsyncResult(task)
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
        return jsonify({"error": "Failed to get ansible result !"})


@celery.task(base=CeleryTask, track_started=True)  
def ansible_run(file_name,ansible_variables,hosts_variables):
    try:
        if os.path.exists(f"scripts/ansible/{file_name}/requirements.yml"):
            install_libraries = execute_ansible_command(
                f"ansible-galaxy install -r scripts/ansible/{file_name}/requirements.yml", "ansible-galaxy")
            if "error" in install_libraries:
                return install_libraries
        elif os.path.exists(f"scripts/ansible/{file_name}/requirements.yaml"):
            install_libraries = execute_ansible_command(
                f"ansible-galaxy install -r scripts/ansible/{file_name}/requirements.yaml", "ansible-galaxy")
            if "error" in install_libraries:
                return install_libraries
        ansible_file_name = len(glob.glob(f"scripts/ansible/{file_name}/*.yml")) if len(glob.glob(
            f"scripts/ansible/{file_name}/*.yml")) != 0 else glob.glob(f"scripts/ansible/{file_name}/*.yaml")
        print(ansible_file_name)
        print(file_name)
        file_name = [
            item for item in ansible_file_name if 'requirements' not in item]
        print(file_name)
        ansible_run_command = "ansible-playbook " + f'{file_name[0]}'
        if ansible_variables !={}:
            ansible_vars = ansible_variables
            variables = {}
            for key in ansible_vars:
                variables[key] = ansible_vars[key]
            ansible_run_command = f"{ansible_run_command} --extra-vars='{json.dumps(variables)}'"
        if hosts_variables !={}:
            with open(f"scripts/ansible/{file_name}/hosts", 'r') as file:
                data = file.read()
            hosts_vars = hosts_variables
            for key in hosts_vars:
                if ".pem" in hosts_vars[key]:
                    hosts_vars[key] = f"scripts/ansible/{file_name}/{hosts_vars[key]}"
                data = data.replace('${' + key + '}', hosts_vars[key])
            with open(f"scripts/ansible/{file_name}/hosts.txt", 'w') as f:
                f.write(data)
            ansible_run_command = f"{ansible_run_command} -i scripts/ansible/{file_name}/hosts.txt"
        else:
            ansible_run_command = f"{ansible_run_command} -i scripts/ansible/{file_name}/hosts"
        print("ansible_run_command")
        print(ansible_run_command)
        apply_result = execute_ansible_command(
            ansible_run_command, "ansible-playbook")
        # return ansible_run_command
        return apply_result
    except Exception as e:
        return json.dumps({'error': e}, default=str)


@app.route('/platform/ansible/uploadFile', methods=['POST'])
def ansible_upload_file():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        user_id = payload['id']
        if 'file' not in request.files:
            print('No file part')
        file = request.files['file']
        if file.filename == '':
            return{'error': 'No selected file'}
        directory_name = file.filename.split('.')[0]
        print(directory_name)
        if os.path.exists(f"scripts/ansible/{directory_name}/*.pem"):
            vs = execute_shell_command(
                f"chmod 400 scripts/ansible/{directory_name}/*.pem")
            logging.warn(vs)
        if os.path.exists(f"scripts/ansible/{directory_name}"):
            shutil.rmtree(f'scripts/ansible/{directory_name}')
        with zipfile.ZipFile(file, 'r') as zip_ref:
            zip_ref.extractall(f"scripts/ansible/{directory_name}")

        if os.path.exists(f"scripts/ansible/{directory_name}/*.yaml"):
            ansible_variables = open(
                glob.glob(f"scripts/ansible/{directory_name}/*.yaml")[0])
        elif os.path.exists(f"scripts/ansible/{directory_name}/*.yml"):
            ansible_variables = open(
                glob.glob(f"scripts/ansible/{directory_name}/*.yml")[0])
        else:
            ansible_variables = ''
        print(ansible_variables)
        try:
            with open(ansible_variables.name, 'r') as yaml_in:
                yaml_object = yaml.safe_load(yaml_in)
                json_string = json.dumps(yaml_object)
                json_out = json.loads(json_string)
            ansible_vars = {}
            for item in json_out:
                if "vars" in item:
                    for subitem in item["vars"]:
                        ansible_vars[subitem] = item["vars"][subitem]
        except Exception as e:
            ansible_vars = {}
        if os.path.exists(f"scripts/ansible/{directory_name}/hosts"):
            with open(f"scripts/ansible/{directory_name}/hosts", 'r') as file:
                data = file.read().replace('\n', '')
            hosts_vars = re.findall(r'\$\{(.*?)\}', data)
        else:
            hosts_vars = []
        for fname in os.listdir(f"scripts/ansible/{directory_name}"):
            if fname.endswith('.pem'):
                print(f"scripts/ansible/{directory_name}/{fname}")
                os.chmod(f"scripts/ansible/{directory_name}/{fname}", 0o400)
        return {"ansible_vars": ansible_vars, "hosts_vars": hosts_vars}
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/platform/ansible/uploadVariables', methods=['POST'])
def ansible_upload_variables():
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
        if not os.path.isdir(f"scripts/ansible/{directory_name}"):
            raise Exception(f"the directory {directory_name} not exist")
        if os.path.exists(f"scripts/ansible/{directory_name}/*.yaml"):
            ansible_variables = open(
                glob.glob(f"scripts/ansible/{directory_name}/*.yaml")[0])
        elif os.path.exists(f"scripts/ansible/{directory_name}/*.yml"):
            ansible_variables = open(
                glob.glob(f"scripts/ansible/{directory_name}/*.yml")[0])
        else:
            ansible_variables = ''
        print(ansible_variables)
        try:
            with open(ansible_variables.name, 'r') as yaml_in:
                yaml_object = yaml.safe_load(yaml_in)
                json_string = json.dumps(yaml_object)
                json_out = json.loads(json_string)
            ansible_vars = {}
            for item in json_out:
                if "vars" in item:
                    for subitem in item["vars"]:
                        ansible_vars[subitem] = item["vars"][subitem]
        except Exception as e:
            ansible_vars = {}
        if os.path.exists(f"scripts/ansible/{directory_name}/hosts"):
            with open(f"scripts/ansible/{directory_name}/hosts", 'r') as file:
                data = file.read().replace('\n', '')
            hosts_vars = re.findall(r'\$\{(.*?)\}', data)
        else:
            hosts_vars = []
        for fname in os.listdir(f"scripts/ansible/{directory_name}"):
            if fname.endswith('.pem'):
                print(f"scripts/ansible/{directory_name}/{fname}")
                os.chmod(f"scripts/ansible/{directory_name}/{fname}", 0o400)
        return {"ansible_vars": ansible_vars, "hosts_vars": hosts_vars}
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/platform/ansible/listScripts', methods=['GET'])
def ansible_list_scripts():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        scripts = [dI for dI in os.listdir(
            'scripts/ansible') if os.path.isdir(os.path.join('scripts/ansible', dI))]
        print(scripts)
        return {"scripts": scripts}
    except Exception as e:
        return json.dumps({'error': e}, default=str)


@app.route('/platform/ansible/deleteScripts', methods=['POST'])
def amsible_delete_scripts():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        body = request.json
        directory_name = body["file_name"]
        result = shutil.rmtree(f'scripts/ansible/{directory_name}')
        print(result)
        return {"scripts": "Script successfully deleted"}
    except Exception as e:
        return json.dumps({'error': e}, default=str)
