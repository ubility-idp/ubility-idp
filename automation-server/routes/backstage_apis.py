from flask import jsonify
import json
from app import app
from routes.functions import execute_commads_with_json_output

@app.route('/backstage/regions', methods=['GET'])
def getRegions():
  try:
    command = 'az account list-locations --query "[].{Region:name}" --out json'
    output = execute_commads_with_json_output(command, "bash")
    res = json.dumps(output[command])
    return jsonify({"regions":json.loads(res)}), 200
  except Exception as e:
    return jsonify({'error': e}), 500


@app.route('/backstage/<string:region>/nodesizes', methods=['GET'])
def getNodeSizesInRegion(region):
  try:
    command = f'az vm list-sizes --location "{region}"'
    output = execute_commads_with_json_output(command, "bash")
    res = json.dumps(output[command])
    return jsonify({"sizes":json.loads(res)}), 200
  except Exception as e:
    return jsonify({'error': e}), 500