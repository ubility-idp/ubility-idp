import { Buffer } from 'buffer';
import { Octokit } from 'octokit';

type res_sha = {
  type: 'dir' | 'file' | 'submodule' | 'symlink';
  size: number;
  name: string;
  path: string;
  content?: string | undefined;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
};

const encode = (str: string): string =>
  Buffer.from(str, 'binary').toString('base64');

const editGithubFile = async (
  repo: string,
  owner: string,
  filePath: string,
  fileContent: string,
  githubToken: string,
  commit_message: string,
) => {
  try {
    const octokit = new Octokit({
      auth: githubToken,
    });

    const result_sha = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner: owner,
        repo: repo,
        path: filePath,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );

    const sha_data = result_sha.data as res_sha;
    const sha = sha_data.sha;

    const content = encode(fileContent);

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: owner,
      repo: repo,
      path: filePath,
      message: commit_message,
      committer: {
        name: 'OpenOps',
        email: 'openops@ubilityai.com',
      },
      content: content,
      sha: sha,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    return 'catalog-info.yaml updated successfully';
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default editGithubFile;
