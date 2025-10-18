import axios from 'axios';
import type { ApiResponse } from '../types';

const ARTIC_API_BASE_URL = 'https://api.artic.edu/api/v1';

export const fetchArtworks = async (page: number = 1): Promise<ApiResponse> => {
  const response = await axios.get<ApiResponse>(
    `${ARTIC_API_BASE_URL}/artworks?page=${page}`
  );
  return response.data;
};
