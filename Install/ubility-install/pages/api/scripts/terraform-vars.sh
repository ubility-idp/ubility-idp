cd ../Terraform/Create
terraform init
terraform apply -auto-approve -var resource_group_name="$1" -var acr_name="$2"
