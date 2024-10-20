import axios from 'axios';
import { API_URL } from '../adapters/configuration';

export default axios.create({
  baseURL: API_URL,
  headers: {
    'Content-type': 'application/json'
  }
});
