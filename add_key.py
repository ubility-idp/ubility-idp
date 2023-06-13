import sys
import requests
import json

url = "https://api.github.com/user/keys"
token = sys.argv[1]  # Read the token from the command-line argument
title = "ubility-idp"

# Read the SSH public key from the .ssh/id_rsa.pub file
with open("./Github/.ssh/id_rsa.pub", "r") as key_file:
    key = key_file.read().strip()

# Create the JSON payload
data = {"title": title, "key": key}

# Set the request headers with the authorization token
headers = {"Authorization": f"token {token}", "Content-Type": "application/json"}

# Send the POST request
response = requests.post(url, headers=headers, data=json.dumps(data))

# Check the response status
if response.status_code == 201:
    print("Key added successfully.")
else:
    print(f"Error: {response.text}")
