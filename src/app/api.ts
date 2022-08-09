import { useAuth, useConfig } from "@rhoas/app-services-ui-shared";
import { AppServicesApi } from "@rhoas/account-management-sdk";
import { Configuration, DefaultApi } from "@rhoas/kafka-management-sdk";
import {
  AxiosCacheRequestConfig,
  createCacheAdapter,
} from "axios-simple-cache-adapter";
import axios from "axios";
import { useCallback } from "react";

const adapter = createCacheAdapter({
  debug: localStorage.getItem("log-axios") !== null,
});

export const useKms = () => {
  const auth = useAuth();
  const {
    kas: { apiBasePath: kasBasePath },
  } = useConfig();

  return useCallback(() => {
    const kmsApi = new DefaultApi(
      new Configuration({
        accessToken: auth.kas.getToken(),
        basePath: kasBasePath,
      }),
      undefined,
      axios.create({
        adapter,
        cache: 1000 * 15,
      } as AxiosCacheRequestConfig)
    );

    return kmsApi;
  }, [auth.kas, kasBasePath]);
};

export const useAms = () => {
  const auth = useAuth();
  const {
    ams: { apiBasePath: amsBasePath },
  } = useConfig();

  return useCallback(() => {
    const amsApi = new AppServicesApi(
      new Configuration({
        accessToken: auth.ams.getToken(),
        basePath: amsBasePath,
      }),
      undefined,
      axios.create({
        adapter,
        cache: 1000 * 15,
      } as AxiosCacheRequestConfig)
    );

    return amsApi;
  }, [amsBasePath, auth.ams]);
};
