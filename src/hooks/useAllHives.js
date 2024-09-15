import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchAllHives = async ({ pageParam = 1 }) => {
  try {
    const { data } = await axios.get(`/api/hives/all`, {
      params: { page: pageParam, limit: 10 },
    });
    return data;
  } catch (error) {
    throw new Error('Failed to fetch all hives: ' + error.message);
  }
};

export const useAllHives = () => {
  return useInfiniteQuery({
    queryKey: ['allHives'],
    queryFn: ({ pageParam = 1 }) => fetchAllHives({ pageParam }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      hives: data.pages.flatMap((page) => page.hives),
    }),
  });
};
