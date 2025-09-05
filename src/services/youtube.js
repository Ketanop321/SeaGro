import { apiService } from './api';
import { handleError, AppError, ErrorTypes } from '../utils/errorHandler';

class YouTubeService {
  // Search for videos
  async searchVideos(query, maxResults = 10) {
    try {
      if (!query || typeof query !== 'string') {
        throw new AppError(ErrorTypes.VALIDATION, 'Search query is required');
      }

      if (query.length > 100) {
        throw new AppError(ErrorTypes.VALIDATION, 'Search query is too long');
      }

      const response = await apiService.get('/ai/youtube/search', {
        params: {
          q: query.trim(),
          maxResults: Math.min(maxResults, 25)
        }
      });

      return {
        videos: response.videos || [],
        totalResults: response.totalResults || 0
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error.response?.data?.error) {
        throw new AppError(ErrorTypes.SERVER, error.response.data.error);
      }

      throw new AppError(ErrorTypes.UNKNOWN, 'Failed to search videos');
    }
  }

  // Get video thumbnail URL
  getVideoThumbnail(videoId, quality = 'medium') {
    const qualities = {
      default: 'default',
      medium: 'mqdefault',
      high: 'hqdefault',
      standard: 'sddefault',
      maxres: 'maxresdefault'
    };

    const thumbnailQuality = qualities[quality] || qualities.medium;
    return `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
  }

  // Get video URL
  getVideoUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Format video duration (if available in snippet)
  formatDuration(duration) {
    if (!duration) return 'Unknown';
    
    // Parse ISO 8601 duration format (PT4M13S)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  // Extract video ID from URL
  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}

// Create singleton instance
const youtubeService = new YouTubeService();

export { youtubeService };
export default youtubeService;