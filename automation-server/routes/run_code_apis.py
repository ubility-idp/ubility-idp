import json, os, shutil
from flask import request, jsonify
from app import app, celery
from routes.functions import (
    check_for_token,
    execute_shell_command,
    execute_commads_with_text_output,
)
from jinja2 import Template
from models.celeryTask import CeleryTask

os.makedirs(f"scripts/python", exist_ok=True)


@app.route("/platform/run-code/run", methods=["POST"])
def runCodeCeleryTask():
    print("fet")
    payload = check_for_token()
    if "id" not in payload:
        return payload
    user_id = payload["id"]
    app.logger.info("user id")
    app.logger.info(user_id)
    body = request.json

    filename = body.get("file_name")
    context = body.get("context")

    task = run_code.delay(filename, context)
    result = run_code.AsyncResult(task.id)
    return jsonify(
        {"flow_status": result.state, "script_name": filename, "task_id": task.id}
    )


@app.route("/platform/run-code/get_code_result", methods=["POST"])
def getCodeResult():
    try:
        data = request.get_json()
        print(data)
        task = data["task_id"]
        print("getting run code result")
        print("task ID: " + task)
        task_result = run_code.AsyncResult(task)
        print({"task_result": task_result})
        result = {}
        if task_result.failed():
            result = {"error": str(task_result.result)}
        elif task_result.ready():
            result = task_result.get()
            print({"result": result})
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
        return jsonify({"error": "Failed to get code result !"})


@celery.task(base=CeleryTask, track_started=True)
def run_code(dir_name, context):
    dir_path = f"scripts/python/{dir_name}"
    file_path = f"{dir_path}/main.py"
    rendered_file_path = f"{dir_path}/main_rendered.py"

    pyenv_virtualenv = dir_name

    try:
        with open(file_path, "r") as f:
            file_contents = f.read()
    except Exception as exc:
        return jsonify({"error": "File not found"})

    with open(f"{dir_path}/.python-version", "r") as f:
        py_version = f.read().strip()

    try:
        cmd_output = execute_commads_with_text_output("pyenv versions")

        if cmd_output["pyenv versions"].find(py_version) == -1:
            # print("In Py Version Install")
            # print(py_version)
            cmd_output = execute_shell_command(f"pyenv install {py_version}")
            # print(cmd_output)
            if cmd_output["dataList"][2] != 0:
                shutil.rmtree(dir_path)
                return jsonify({"error": "Python version not available"})

        cmd_output = execute_commads_with_text_output(
            f"pyenv virtualenv {py_version} {pyenv_virtualenv}"
        )

        # print(cmd_output)

        cmd_output = execute_commads_with_text_output(
            f"pyenv prefix {pyenv_virtualenv}"
        )
        # print(cmd_output)
        # print("PYTHON EXECUTABLE")
        pyenv_exec_dir = cmd_output[f"pyenv prefix {pyenv_virtualenv}"].split("\n")[0]
        python_executable_path = f"{pyenv_exec_dir}/bin/python"
        # print(pyenv_exec_dir)
        # print(python_executable_path)

        req_file_path = f"scripts/python/{dir_name}/requirements.txt"
        if os.path.exists(req_file_path):
            cmd_output = execute_shell_command(
                f"{pyenv_exec_dir}/bin/pip install -r {req_file_path}"
            )
            if cmd_output["dataList"][2] != 0:
                shutil.rmtree(dir_path)
                return jsonify({"error": "Error in requirements.txt file"})
            
        entered_file_path = ""
        json_output_file_path = file_path.split(".py")[0] + ".json"

        if not os.path.isfile(entered_file_path):
            with open(f"scripts/python/{dir_name}/pass.txt", 'w') as f:
                f.write("entered")

            header = "import json"
            header += "\nclass RunCode:"
            header += "\n\tdef __init__(self):"
            header += "\n\t\tself.out = {}"
            header += f"\nubility = RunCode()\n"


            footer = f'\nwith open("{json_output_file_path}", "w") as f:'
            footer += "\n\tjson.dump(ubility.out, f)"

        template = Template(header + file_contents + footer)
        rendered_file = template.render(context)
        with open(rendered_file_path, "w") as f:
            f.write(rendered_file)

        code_output = execute_shell_command(
            f"{python_executable_path} {rendered_file_path}"
        )

        try:
            with open(json_output_file_path, "r") as f:
                code_json_output = json.load(f)
            os.remove(json_output_file_path)
        except:
            return jsonify(
                {
                    "output": {},
                    "stdout": code_output["dataList"][0],
                    "stderr": code_output["dataList"][1],
                    "code": code_output["dataList"][2],
                }
            )
    except Exception as exc:
        return jsonify({"error": exc}), 500
    # finally:
    #     cmd_output = execute_commads_with_text_output(
    #         f"pyenv virtualenv-delete -f {pyenv_virtualenv}"
    #     )
    #     shutil.rmtree(dir_path)

    return jsonify(
        {
            "output": code_json_output if code_json_output is not None else {},
            "stdout": code_output["dataList"][0],
            "stderr": code_output["dataList"][1],
            "code": code_output["dataList"][2],
        }
    )


@app.route("/platform/get-python-versions", methods=["GET"])
def get_python_versions():
    payload = check_for_token()
    if "id" not in payload:
        return payload

    cmd_output = execute_shell_command(f"pyenv install -l")
    stdout = cmd_output["dataList"][0]
    python_version = stdout.split("\n  ")[1:-1]

    return jsonify({"python_versions": python_version})


@app.route("/platform/upload-code-file", methods=["POST"])
def upload_code_file():
    payload = check_for_token()
    if "id" not in payload:
        return payload

    if "file" not in request.files:
        return jsonify({"message": "error missing input data"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    py_version = request.form["python_version"]

    dir_path = f"scripts/python/{file.filename}"

    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)

    os.mkdir(dir_path)
    file_path = os.path.join(dir_path, "main.py")

    try:
        file.save(file_path)
    except:
        return jsonify({"error": "Error saving uploaded file"}), 400

    try:
        req_file = request.files["requirements"]
        req_file_path = os.path.join(dir_path, req_file.filename)

        try:
            req_file.save(req_file_path)
        except:
            return jsonify({"error": "Error saving requirements.txt file"}), 400
    except:
        pass

    execute_commads_with_text_output(f"echo {py_version} > {dir_path}/.python-version")

    return jsonify({"message": "File uploaded successfully"}), 200


@app.route("/platform/delete-code-file", methods=["POST"])
def delete_code_file():
    payload = check_for_token()
    if "id" not in payload:
        return payload
    user_id = payload["id"]
    app.logger.info("user id")
    app.logger.info(user_id)
    body = request.json

    filename = body.get("file_name")

    dir_path = f"scripts/python/{filename}"
    pyenv_virtualenv = filename

    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)
        execute_commads_with_text_output(
            f"pyenv virtualenv-delete -f {pyenv_virtualenv}"
        )
    else:
        return jsonify({"message": "File not found"}), 200

    return jsonify({"message": "File deleted successfully"}), 200
