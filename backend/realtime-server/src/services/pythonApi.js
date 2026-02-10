import axios from 'axios';
import { PYTHON_API_URL } from '../config/env.js';

export async function saveCanvas(roomId, strokes) {
  try {
    if (!Array.isArray(strokes)) {
      console.error("saveCanvas called with invalid strokes:", strokes);
      return;
    }

    await axios.post(`${PYTHON_API_URL}/canvas/save`, {
      roomId,
      strokes,
    });
  } catch (err) {
    console.error("Failed to save canvas:", err.message);
  }
}

export async function loadCanvas(roomId) {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/canvas/${roomId}`);
        return Array.isArray(response.data.strokes) ? response.data.strokes : [];
    } catch (error) {
        console.error('Failed to load canvas:', error.message);
        return null;
    }
}
export async function clearCanvas(roomId) {
    try {
        await axios.post(`${PYTHON_API_URL}/canvas/clear`, { roomId });
    } catch (error) {
        console.error('Failed to clear canvas:', error.message);
    }
}