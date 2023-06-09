from flask import request
from app import app
from routes.functions import *
import json
import os.path

os.makedirs(f"scripts/shell", exist_ok=True)


@app.route('/platform/shell/uploadFile', methods=['POST'])
def shell_upload_file():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        if 'file' not in request.files:
            print('No file part')
        file = request.files['file']
        if file.filename == '':
            return{'error': 'No selected file'}
        os.makedirs('scripts/shell', exist_ok=True)
        file.save(os.path.join("scripts/shell/", file.filename))
        return {"message": "File uploaded successfully"}
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/platform/shell/run', methods=['POST'])
def shell_run():
    try:
        print('fet')
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        body = request.json
        file_path = body["file_path"]
        shell_run_command = f'sh scripts/shell/{file_path}'
        if "shell_variables" in body:
            shell_vars = body["shell_variables"]
            for item in shell_vars:
                shell_run_command = shell_run_command + " " + item
            shell_run_command = shell_run_command.strip()
        apply_result = execute_shell_command(shell_run_command, "shell")
        return apply_result
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/platform/shell/listScripts', methods=['GET'])
def shell_list_scripts():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        file_list = os.listdir('scripts/shell')
        print(file_list)
        return {"scripts": file_list}
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/platform/shell/deleteScripts', methods=['POST'])
def shell_delete_scripts():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        body = request.json
        directory_name = body["file_name"]
        # result = shutil.rmtree(f'scripts/shell/{directory_name}')
        result = os.remove(f'scripts/shell/{directory_name}')
        print(result)
        return {"scripts": "Script successfully deleted"}
    except Exception as e:
        return jsonify({'error': str(e)}), 500
