import axios from "axios";

const API_URL = "http://localhost:3000"; 

export const getInstructorProfile = async (id: number) => {
  try {
    const res = await axios.get(`${API_URL}/instructors/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching instructor profile:", err);
    throw err;
  }
};
