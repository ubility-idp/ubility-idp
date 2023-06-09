from flask import request, jsonify
from app import app
from routes.functions import check_for_token, azure_aks_update_kube_config, aws_eks_update_kube_config, execute_commads_with_json_output, execute_commads_list, execute_commads_with_text_output
import json, yaml, random
import os.path


@app.route('/platform/<string:provider>/upload-yaml-file', methods=['POST'])
def upload_yaml_file(provider):
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload

        if 'file' not in request.files:
            return jsonify({"message": "error missing input data"}), 401

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 401

        os.makedirs(f"scripts/{provider}/{payload['id']}", exist_ok=True) 
        file.save(os.path.join(f"scripts/{provider}/{payload['id']}/", file.filename))

        return jsonify({"result": f"File {file.filename} uploaded successfully"}), 200
    except Exception as e:
        return jsonify({'error': e}), 500


@app.route('/platform/<string:provider>/apply-yaml', methods=['POST'])
def apply_yaml_file(provider):
    """
    Function description:
    
    Body must contain: 
    {
    "aws_access_key_id": "",
    "aws_secret_access_key": "",
    "region": "",
    "file_name": "",
    "cluster_name": ""
    }
    """
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload

        body = request.json
        
        if not 'file_name' in body:
            return jsonify({"message": "error missing input data"}), 401

        # apply yaml file
        yaml_file_path = f"scripts/{provider}/{payload['id']}/{body['file_name']}"

        if provider == "eks":

            config_result= aws_eks_update_kube_config(body)
            if config_result['message'] != "PASS":
                return jsonify(config_result), 401

            return jsonify(execute_commads_with_json_output(f'kubectl apply -f {yaml_file_path} -o json', "bash")), 200
        elif provider == "aks":

            config_result= azure_aks_update_kube_config(body)
            if config_result['message'] != "PASS":
                return jsonify(config_result), 401

            return jsonify(execute_commads_with_json_output(f'kubectl apply -f {yaml_file_path} -o json', "bash")), 200
        else:
            return jsonify({"message": "unknown provider"}), 401

    except Exception as e:
        return json.dumps({'error': e}, default=str), 500
    finally:
        os.remove(yaml_file_path)

@app.route('/platform/<string:provider>/upload-apply-yaml', methods=['POST'])
def kubernetes_upload_apply_yaml(provider):
    """
    Send file name with type: example.yaml
    The file will be automatically applied
    """
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        app.logger.info("start")

        body = request.json

        app.logger.info(body)

        ## convert JSON to YAML and save
        if 'yaml' not in body:
            return jsonify({"message": "error missing input data"}), 401
        
        yaml_file_path = f"scripts/{provider}/{payload['id']}"
        os.makedirs(yaml_file_path, exist_ok=True) 
        yaml_file_path += f"/yaml_file_{random.randint(10,99)}.yaml"

        f = open(yaml_file_path, "a")
        f.write(yaml.dump(body['yaml']))
        f.close()

        ## apply yaml file

        if provider == "eks":

            config_result= aws_eks_update_kube_config(body)
            if config_result['message'] != "PASS":
                return jsonify(config_result), 401

            return jsonify(execute_commads_with_json_output(f'kubectl apply -f {yaml_file_path} -o json', "bash")), 200
        elif provider == "aks":

            config_result= azure_aks_update_kube_config(body)
            if config_result['message'] != "PASS":
                return jsonify(config_result), 401

            return jsonify(execute_commads_with_json_output(f'kubectl apply -f {yaml_file_path} -o json', "bash")), 200
        else:
            return jsonify({"message": "unknown provider"}), 401
        
    except Exception as e:
        return json.dumps({'error': e}, default=str), 500
    finally:
        os.remove(yaml_file_path)

@app.route('/platform/<string:provider>/upload-delete-yaml', methods=['POST'])
def kubernetes_upload_delete_yaml(provider):
    """
    Send file name with type: example.yaml
    Use file to delete previously applied changes by that yaml file
    """
    
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        app.logger.info("start")

        body = request.json

        app.logger.info(body)

        ## convert JSON to YAML and save
        if 'yaml' not in body:
            return jsonify({"message": "error missing input data"}), 401
        
        yaml_file_path = f"scripts/{provider}/{payload['id']}"
        os.makedirs(yaml_file_path, exist_ok=True) 
        yaml_file_path += f"/yaml_file_{random.randint(10,99)}.yaml"

        f = open(yaml_file_path, "a")
        f.write(yaml.dump(body['yaml']))
        f.close()

        ## delete applied changes by yaml file

        if provider == "eks":

            config_result= aws_eks_update_kube_config(body)
            if config_result['message'] != "PASS":
                return jsonify(config_result), 401

            return jsonify(execute_commads_with_text_output(f'kubectl delete -f {yaml_file_path}', "bash")), 200
        elif provider == "aks":

            config_result= azure_aks_update_kube_config(body)
            if config_result['message'] != "PASS":
                return jsonify(config_result), 401

            return jsonify(execute_commads_with_text_output(f'kubectl delete -f {yaml_file_path}', "bash")), 200
        else:
            return jsonify({"message": "unknown provider"}), 401
    except Exception as e:
        return json.dumps({'error': e}, default=str), 500
    finally:
        os.remove(yaml_file_path)


@app.route('/platform/<string:provider>/exec-commands', methods=['POST'])
def execute_kubernetes_list_of_commands(provider):
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload

        body = request.json
        
        if not "list_of_commands" in body:
            return jsonify({"message": "error missing input data."}), 401

        commands_list = body['list_of_commands']

        if provider == "eks":
            config_result= aws_eks_update_kube_config(body)

            if config_result['message'] != "PASS":
                return jsonify(config_result), 401

            reuslt_list = execute_commads_list(commands_list)
        elif provider == "aks":
            config_result= azure_aks_update_kube_config(body)

            if config_result['message'] != "PASS":
                return jsonify(config_result), 401

            reuslt_list = execute_commads_list(commands_list)            
        else:
            return jsonify({"message": "unknown provider"}), 401

        return {'result': reuslt_list}
    except Exception as e:
        return json.dumps({'error': e}, default=str), 500
    

@app.route('/platform/<string:provider>/get-samples', methods=['GET'])
def get_samples(provider):
    if provider != "eks" and provider != "aks":
        return jsonify({"message": "unknown provider"}), 401
    
    samples_folder = os.path.join(os.path.dirname(__file__),"..","kubernetes_sample_files", provider)
    samples = {}

    for sample_name in os.listdir(samples_folder):
        sample_path = os.path.join(samples_folder, sample_name)

        if os.path.isfile(sample_path):
            with open(sample_path, 'r') as yaml_file:
                samples[sample_name.split('.')[0]] = list(yaml.safe_load_all(yaml_file))[0]

    return jsonify({"samples": samples})