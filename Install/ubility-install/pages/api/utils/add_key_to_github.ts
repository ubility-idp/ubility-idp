const add_key_to_github = async (
  token: string,
  key: string
): Promise<boolean> => {
  const url = "https://api.github.com/user/keys";
  const title = "ubility-idp";

  // Create the JSON payload
  const data = {title, key};

  // Set the request headers with the authorization token
  const headers = {
    Authorization: `token ${token}`,
    "Content-Type": "application/json",
  };

  try {
    // Send the POST request
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (response.status === 201) {
      console.log("Key added successfully.");
      return true;
    } else {
      response.text().then((text) => {
        console.error(`Error: ${text}`);
      });
      return false;
    }
  } catch (error) {
    return false;
  }
};

export default add_key_to_github;
