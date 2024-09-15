import { useQuery } from '@tanstack/react-query';
import localForage from 'localforage';

const fetchListData = async (listType) => {
  // In a real application, this would be an API call
  // For now, we'll simulate data fetching with localForage
  const data = await localForage.getItem(listType);
  if (!data) {
    throw new Error('Data not found');
  }
  return data;
};

const useListData = (listType) => {
  return useQuery({
    queryKey: [listType],
    queryFn: () => fetchListData(listType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });
};

export default useListData;
