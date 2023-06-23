az login --service-principal --user="$1" --password="$2" --tenant="$3"
az account set --subscription "$4"