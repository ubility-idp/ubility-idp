import jwt
from flask import request, jsonify
from config import SECRET_KEY
import json
import subprocess
import shlex
import re
import json
import sys
import glob
import hcl2


def check_for_token():
    auth = request.headers.get("Authorization", None)
    if not auth:
        return jsonify({"message": "authorization_header_missing"}), 401
    try:
        token = request.headers["Authorization"]
        token = str.replace(str(token), "Bearer ", "")

        if not token:
            return jsonify({"message": "Missing token"}), 403
        else:
            data = jwt.decode(token, SECRET_KEY, algorithms="HS256")
            return data
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Signature expired"}), 403
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 403
    except Exception:
        return jsonify({"message": "enter a correct Authorization bearer"}), 442


def execute_command(command, command_type=None, directory_name=None):
    result = subprocess.Popen(command, stderr=subprocess.PIPE)
    if result.wait() != 0:
        _, err1 = result.communicate()
        ansi_escape = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")
        error = ansi_escape.sub("", err1.decode("utf-8"))
        print(err1.decode("utf-8"), file=sys.stderr)
        return {"error": error}
    else:
        out1, _ = result.communicate()
        if command_type == "apply":
            with open(f"{directory_name}/terraform.tfstate", "r") as f:
                my_dict = json.load(f)
                print(my_dict)
                if "outputs" in my_dict and my_dict["outputs"] != {}:
                    print(my_dict["outputs"])
                    return my_dict["outputs"]
                else:
                    return {"success": "terraform initialzed successfully"}
        else:
            return {"success": out1}


def execute_ansible_command(command, command_type):
    proc = subprocess.Popen(
        shlex.split(command),
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    stdout = (proc.communicate()[0]).decode("utf-8")
    print(stdout)
    if proc.wait() != 0:
        stderr = (proc.communicate()[1]).decode("utf-8")
        return {"error": stderr if len(stderr) != 0 else stdout}
    else:
        # print(stdout)
        if command_type == "ansible-playbook":
            changed = re.findall(r"changed=(\d{1})", stdout)
            failed = re.findall(r"failed=(\d{1})", stdout)
            ok = re.findall(r"ok=(\d{1})", stdout)
            unreachable = re.findall(r"unreachable=(\d{1})", stdout)
            if int(failed[0]) != 0:
                return json.dumps({"message": "Failed to update change in ansible"})
            else:
                if int(unreachable[0]) != 0:
                    return json.dumps({"message": "Host Unreachable"})
                else:
                    if int(ok[0]) != 0:
                        if int(changed[0]) == 0:
                            return json.dumps({"message": True, "stdout": stdout})
                        else:
                            return json.dumps({"message": True, "stdout": stdout})
        else:
            return {"message": stdout}


def execute_shell_command(command, type=None, cwd=None):
    result = subprocess.Popen(
        command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=cwd
    )
    return_stdout, return_stderr = result.communicate()
    return_stdout = return_stdout.decode("utf-8")
    return_stderr = return_stderr.decode("utf-8")
    return_code = result.returncode
    ret = []
    ret.append(return_stdout)
    ret.append(return_stderr)
    ret.append(return_code)
    return {"dataList": ret}


def aws_eks_update_kube_config(body):
    if not (
        "aws_access_key_id" in body
        and "aws_secret_access_key" in body
        and "region" in body
        and "cluster_name" in body
    ):
        return {"message": "error missing input key(s)"}

    if not (
        body["aws_access_key_id"]
        and body["aws_secret_access_key"]
        and body["region"]
        and body["cluster_name"]
    ):
        return {"message": "error missing input data"}

    aws_access_key_id = body["aws_access_key_id"]
    aws_secret_access_key = body["aws_secret_access_key"]
    region = body["region"]
    cluster_name = body["cluster_name"]

    list_of_commands = [
        f"aws configure set aws_access_key_id {aws_access_key_id}",
        f"aws configure set aws_secret_access_key {aws_secret_access_key}",
        f"aws configure set default.region {region}",
        f"aws eks --region {region} update-kubeconfig --name {cluster_name}",
        f"kubectl config set-context --current --namespace=default",
    ]

    for cmd in list_of_commands:
        execute_commads_with_text_output(cmd, "bash")

    return {"message": "PASS"}


def azure_aks_update_kube_config(body):
    if not (
        "client_id" in body
        and "client_secret" in body
        and "tenant" in body
        and "subscription_id" in body
        and "resourcegroup_name" in body
        and "cluster_name" in body
    ):
        return {"message": "error missing input key(s)"}

    if not (
        body["client_id"]
        and body["client_secret"]
        and body["tenant"]
        and body["subscription_id"]
        and body["resourcegroup_name"]
        and body["cluster_name"]
    ):
        return {"message": "error missing input data"}

    client_id = body["client_id"]
    subscription_id = body["subscription_id"]
    client_secret = body["client_secret"]
    tenant = body["tenant"]
    resourcegroup_name = body["resourcegroup_name"]
    cluster_name = body["cluster_name"]

    list_of_commands = [
        f"az login --service-principal -u {client_id} -p='{client_secret}' --tenant {tenant}",
        f"az account set --subscription {subscription_id}",
        f"az aks get-credentials --resource-group {resourcegroup_name} --name {cluster_name} --overwrite-existing",
        f"kubectl config set-context --current --namespace=default",
    ]

    for cmd in list_of_commands:
        res = execute_commads_with_text_output(cmd, "bash")
        if "error" in res:
            return {"error": res["error"]}

    return {"message": "PASS"}


def execute_commads_with_text_output(command, type=None):
    result = subprocess.Popen(
        command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    if result.wait() != 0:
        err1 = result.communicate()[1].decode("utf-8")
        print(err1)
        return {"error": err1}
    return {command: result.communicate()[0].decode("utf-8")}


def execute_commads_with_json_output(command, type=None):
    result = subprocess.Popen(
        command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    try:
        data = json.loads(result.stdout.read())
    except:
        result = result
    if result.wait() != 0:
        err1 = result.communicate()[1].decode("utf-8")
        print(err1)
        return {"error": err1}
    return {command: data}


def execute_commads_list(commands_list):
    result_list = []

    cmdWithJsonOutput = [
        "kubectl apply",
        "kubectl run",
        "kubectl autoscale",
        "kubectl scale",
        "kubectl get",
        "kubectl edit",
        "kubectl create",
    ]

    for cmd in commands_list:
        word_list = cmd.split()
        if len(word_list) >= 2:
            wordsToCompare = word_list[0] + " " + word_list[1]

            if wordsToCompare in cmdWithJsonOutput:
                if cmd.__contains__("-o") and cmd.__contains__(" json"):
                    ## exist
                    result_list.append(execute_commads_with_json_output(cmd, "bash"))
                else:
                    ## add
                    result_list.append(
                        execute_commads_with_json_output(cmd + " -o json", "bash")
                    )
            else:
                result_list.append(execute_commads_with_text_output(cmd, "bash"))
        else:
            result_list.append(execute_commads_with_text_output(cmd, "bash"))
    return result_list


def extract_terraform_variables(dir_path):
    """
    Function description:
    This function search all files in a given directory of type .tf or .tfvars.json
    to extract input and ouptput variables.
    """
    credential_var_keys = [
        "CLIENT_ID",
        "SECRET",
        "SUBSCRIPTION_ID",
        "TENANT_ID",
        "AWS_ACCESS_KEY_ID",
        "AWS_ACCESS_SECRET",
    ]

    tf_files_list = glob.glob(f"{dir_path}/*.tf")
    json_files_list = glob.glob(f"{dir_path}/*.tfvars.json")

    inputs, outputs = {}, {}

    # check for input or output variables in files of type .tf
    for tf_file in tf_files_list:
        content = hcl2.load(open(tf_file, "r"))
        if "variable" in content:
            for v in content["variable"]:
                valid_key = True
                for k, val in v.items():
                    if type(val) is dict:
                        if k in credential_var_keys:
                            valid_key = False
                            break
                if valid_key:
                    inputs = dict(list(inputs.items()) + list(v.items()))
        if "output" in content:
            for v in content["output"]:
                outputs = dict(list(outputs.items()) + list(v.items()))

    # check for input variables in files of type .tfvars.json
    for json_file in json_files_list:
        inputs = dict(list(inputs.items()) + list(json.load(open(json_file)).items()))

    # remove additional level in json of key default in the inputs object
    for k, val in inputs.items():
        if type(val) is dict:
            if "default" in val:
                inputs[k] = val["default"]
            else:
                inputs[k] = ""
    # remove value from 'value' key
    for k in outputs:
        outputs[k]["value"] = ""
    return {"inputs": inputs, "outputs": outputs}
