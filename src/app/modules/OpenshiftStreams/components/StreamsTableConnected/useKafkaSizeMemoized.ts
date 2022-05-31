import {
  useGetAvailableSizes,
  SizesData,
} from "@app/modules/OpenshiftStreams/dialogs/CreateInstance/hooks";

const cache = new Map();
export const useKafkaSizeMemoized = () => {
  const getKafkaSizes = useGetAvailableSizes();

  return async (provider: string, region: string): Promise<SizesData> => {
    const key = provider + region;
    if (!cache.has(key)) {
      const size = await getKafkaSizes(provider, region, []);
      cache.set(key, size);
    }
    return cache.get(key);
  };
};
