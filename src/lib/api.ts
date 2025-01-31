import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NODE_ENV === "development" 
    ? "http://localhost:3000" 
    : process.env.NEXT_PUBLIC_PROD_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  }
});