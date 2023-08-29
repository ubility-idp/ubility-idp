from app import app


def validate_input_exists_not_empty(body, keys):
    for key in keys:
        if key not in body:
            app.logger.info(f"{key} not found!")
            return {"error": f"{key} was not sent"}
        if type(keys[key]) is dict:
            res = validate_input_exists_not_empty(body[key], keys[key])
            if "error" in res:
                return res
        elif type(keys[key]) is list:
            print(body[key], keys[key], body[key] not in keys[key])
            if body[key] not in keys[key]:
                app.logger.info(
                    f"{body[key]} is not a valid option. The valid options are {str(keys[key])}"
                )
                return {
                    "error": f"{body[key]} is not a valid option. The valid options are {str(keys[key])}"
                }
    return {"success": "true"}
