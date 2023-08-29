from routes.functions import execute_commads_with_text_output

def azure_login(body):
    if not ("CLIENT_ID" in body and "SECRET" in body and "TENANT_ID" in body and "SUBSCRIPTION_ID" in body):
        return {"message": "error missing input key(s)"}
        
    if not (body["CLIENT_ID"] and body["SECRET"] and body["TENANT_ID"] and body["SUBSCRIPTION_ID"]):
        return {"message": "error missing input data"}

    client_id = body['CLIENT_ID']
    subscription_id = body['SUBSCRIPTION_ID']
    client_secret = body['SECRET']
    tenant = body['TENANT_ID']

    list_of_commands = [
        f"az login --service-principal -u {client_id} -p='{client_secret}' --tenant {tenant}",
        f"az account set --subscription {subscription_id}"
    ]

    for cmd in list_of_commands:
        res = execute_commads_with_text_output(cmd, "bash")
        if 'error' in res:
            return {"error":res['error']}
    
    return {"message": "PASS"}

def azure_logout():
    res = execute_commads_with_text_output('az logout', "bash")
    if 'error' in res:
        return {"error":res['error']}
    
    return {"message": "PASS"}