const add_key_to_github = async (
  token: string,
  key: string
): Promise<{pass: boolean; result: string}> => {
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
      return {pass: true, result: "success"};
    } else {
      const text = await response.text();
      console.log(`Github Error: ${text}`);

      return {pass: false, result: `Error: ${text}`};
    }
  } catch (error) {
    return {pass: false, result: error as string};
  }
};

export default add_key_to_github;
