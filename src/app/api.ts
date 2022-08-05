import { useAuth, useConfig } from "@rhoas/app-services-ui-shared";
import { AppServicesApi } from "@rhoas/account-management-sdk";
import { DefaultApi, Configuration } from "@rhoas/kafka-management-sdk";
import {
  AxiosCacheRequestConfig,
  createCacheAdapter,
} from "axios-simple-cache-adapter";
import axios from "axios";

const adapter = createCacheAdapter({
  debug: localStorage.getItem("log-axios") !== null,
});

export const useKms = () => {
  const auth = useAuth();
  const {
    kas: { apiBasePath: kasBasePath },
  } = useConfig();

  return () => {
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
  };
};

export const useAms = () => {
  const auth = useAuth();
  const {
    ams: { apiBasePath: amsBasePath },
  } = useConfig();

  return () => {
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
  };
};
