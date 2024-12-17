import axios from "axios";

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const api = axios;
export default api;