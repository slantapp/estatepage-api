export class MonnifyHeader {
  static async Header() {
    const apiKey = process.env.MONNIFY_API_KEY;
    const secretKey = process.env.MONNIFY_SECRET_KEY;

    // Generate the Basic Auth token
    const authString = `${apiKey}:${secretKey}`;
    const encodedAuth = Buffer.from(authString).toString('base64');

    // Prepare the request headers
    const headers = {
      Authorization: `Basic ${encodedAuth}`,
      'Content-Type': 'application/json',
    };

    return headers;
  }
}
