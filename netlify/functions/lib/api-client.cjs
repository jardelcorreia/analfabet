const fetch = require('node-fetch');

const API_TOKEN = process.env.API_TOKEN;
const API_URL = 'https://api.api-futebol.com.br/v1';

const fetchLiveMatches = async () => {
  try {
    const response = await fetch(`${API_URL}/ao-vivo`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching live matches');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching live matches:', error);
    throw error;
  }
};

module.exports = {
  fetchLiveMatches,
};
