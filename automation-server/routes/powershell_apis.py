from flask import request
from app import app
from routes.functions import *
import json, os.path
import paramiko
import re
@app.route('/powershell/uploadFile', methods=['POST'])
def powershell_upload_file():
    try:
        # payload = check_for_token()
        # if 'id' not in payload:
        #     return payload
        file = request.files['file']
        if file.filename == '':
            return{'error':'No selected file'}
        body = request.form
        hostname = body["hostname"]
        username = body["username"]
        password = body["password"]
        print(hostname)
        os.makedirs('scripts/powershell', exist_ok=True)
        file.save(os.path.join("scripts/powershell/", file.filename))
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(hostname,username=username,password=password)
            print("Connected to %s" % hostname)
            try:
                ftp_client=ssh.open_sftp()
                ftp_client.put(f'scripts/powershell/{file.filename}',f'C:/Users/adminuser/Desktop/PowershellScripts/{file.filename}')
                ftp_client.close()
            except Exception as e:
                print(e)
                return {"error":e}
        except paramiko.AuthenticationException:
            return {"error":"Failed to connect to %s due to wrong username/password" %hostname}
        except Exception as e:
            print(e)    
            return {"error":e}
        return {"message": "File uploaded successfully"}
    except Exception as e:
        return json.dumps({'error': e}, default=str)

@app.route('/powershell/run', methods=['POST'])
def powershell_run():
    try:
        print('fet')
        # payload = check_for_token()
        # if 'id' not in payload:
        #     return payload
        body = request.json

        hostname = body["hostname"]
        username = body["username"]
        password = body["password"]
        file_name = body["file_name"]
        powershell_run_command = f"powershell.exe C:/Users/{username}/Desktop/PowershellScripts/{file_name}"
        if "powershell_variables" in body:
            powershell_vars = body["powershell_variables"]
            for key in powershell_vars:
                powershell_run_command = f'{powershell_run_command} -{key} {powershell_vars[key]} '
            powershell_run_command = powershell_run_command.strip()
        try:
            print(powershell_run_command)
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(hostname,username=username,password=password)
            print("Connected to %s" % hostname)
            try:
                stdin, stdout, stderr = ssh.exec_command(powershell_run_command)
            except Exception as e:
                print(e.message)
            err = ''.join(stderr.readlines())
            out = ''.join(stdout.readlines())
            final_output = str(out)+str(err)
            print(final_output)
            return {"message":final_output}
        except paramiko.AuthenticationException:
            return {"error":"Failed to connect to %s due to wrong username/password" %hostname}
        except Exception as e:
            print(e)    
            return {"error":e}
    except Exception as e:
        return json.dumps({'error': e}, default=str)
@app.route('/powershell/listScripts', methods=['POST'])
def powershell_list_scripts():
    try:
        payload = check_for_token()
        if 'id' not in payload:
            return payload
        body = request.json
        hostname = body["hostname"]
        username = body["username"]
        password = body["password"]
        cmd = "cd ./Desktop/PowershellScripts && dir"
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(hostname,username=username,password=password)
            print("Connected to %s" % hostname)
            try:
                stdin, stdout, stderr = ssh.exec_command(cmd)
            except Exception as e:
                print(e.message)
            err = ''.join(stderr.readlines())
            out = ''.join(stdout.readlines())
            final_output = str(out)+str(err)
            final_output = re.findall(r'\w+\.ps', final_output)
            print(final_output)
            return {"message":final_output}
        except paramiko.AuthenticationException:
            return {"error":"Failed to connect to %s due to wrong username/password" %hostname}
        except Exception as e:
            print(e)    
            return {"error":e}
    except Exception as e:
        return json.dumps({'error': e}, default=str)
@app.route('/powershell/deleteScripts', methods=['POST'])
def powershell_delete_scripts():
    try:

        payload = check_for_token()
        if 'id' not in payload:
            return payload
        body = request.json
        hostname = body["hostname"]
        username = body["username"]
        password = body["password"]
        filename = body["filename"]
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(hostname,username=username,password=password)
            print("Connected to %s" % hostname)
            try:
                sftp = ssh.open_sftp()
                sftp.remove(f'C:/Users/adminuser/Desktop/PowershellScripts/{filename}')
                sftp.close()
                ssh.close()
            except Exception as e:
                print(e.message)
            return {"message":f"File {filename} deleted siccessfully!"}
        except paramiko.AuthenticationException:
            return {"error":"Failed to connect to %s due to wrong username/password" %hostname}
        except Exception as e:
            print(e)    
            return {"error":e}
    except Exception as e:
        return json.dumps({'error': e}, default=str)