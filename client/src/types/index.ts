// src/types/ArtworkTypes.ts
export interface Artwork {
  id: number;
  title: string;
  place_of_origin: string | null;
  artist_display: string | null;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
  next_url: string | null;
}

export interface ApiResponse {
  pagination: PaginationInfo;
  data: Artwork[];
}

export interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}
