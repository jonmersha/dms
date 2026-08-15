import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface ContentBlock {
  page: string;
  section_key: string;
  content: string;
}

export function usePublicContent(page: string) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/public-pages/content-blocks/`);
        const blocks: ContentBlock[] = Array.isArray(response.data) ? response.data : (response.data.results || []);
        
        // Filter by page and map to a dictionary
        const pageContent = blocks
          .filter(b => b.page === page)
          .reduce((acc, curr) => {
            acc[curr.section_key] = curr.content;
            return acc;
          }, {} as Record<string, string>);
          
        setContent(pageContent);
      } catch (err) {
        console.error(`Failed to fetch public content for ${page}`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [page]);

  return { content, isLoading };
}
