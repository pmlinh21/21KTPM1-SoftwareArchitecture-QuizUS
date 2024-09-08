import axios from 'axios';
//import { USER_URL } from "../util/config";

const getAllPlayers = async () => {
  try {
    const url = `${process.env.REACT_APP_USER_URL}/api/player`;
    const response = await axios.get(url);
    
    if (response?.data)
      return response.data;
    else
      return [];
  }
  catch (err) {
    console.log(err.message);
    return []
  }
}

const searchPlayer = async (keyword) => {
  try {
    let url = `${process.env.REACT_APP_USER_URL}/api/player/search/${keyword}`;
    if (!keyword || keyword.length === 0)
      url = `${process.env.REACT_APP_USER_URL}/api/player`;
    const result = await axios.get(url);
    console.log(result);

    if (result.status === 200) 
      return result.data;
    else 
      return [];
  } catch (err) {
    console.log(err.message);
    return [];
  }
}

const getPlayerById = async (id) => {
  try {
    const url = `${process.env.REACT_APP_USER_URL}/api/player/${id}`;
    const response = await axios.get(url);
    
    if (response?.data)
      return response.data;
    else
      return null;
  }
  catch (err) {
    console.log(err.message);
    return null;
  }
}

const updatePlayer = async (updatedData) => {
  try {
    const url = `${process.env.REACT_APP_USER_URL}/api/player`;
    const response = await axios.put(url, updatedData);
    
    if (response.status === 200) 
      return true;
    else 
      return false;
  }
  catch (err) {
    console.log(err.message);
    return false;
  }
}

export {
  getAllPlayers,
  searchPlayer,
  getPlayerById,
  updatePlayer
};