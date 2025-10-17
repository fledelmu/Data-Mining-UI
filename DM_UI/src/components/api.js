import axios from 'axios';

const BASE_URL = "http://127.0.0.1:8000"

const predict = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/predict/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching prediction:', error);
        throw error;
    }
}

const forecast = async (storeName, periods = 12) => {
  try {
    const response = await axios.post(`${BASE_URL}/forecast/`, {
      store_name: storeName,
      periods: periods
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching forecast: ", error);
    throw error;
  }
};


const clustering = async () => {
    try {
        const response = await axios.post(`${BASE_URL}/clustering/`)
        return response.data
    } catch (error) {
        console.error('Error fetching clusters: ', error)
        throw error
    }
}

const getNames = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/names/`)
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching names: ', error)
        throw error
    }
}

export { predict, forecast, clustering, getNames }