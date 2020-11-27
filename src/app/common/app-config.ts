import { DefaultApi } from  '../../openapi/api';

// Initialize services.

export const BASE_PATH = 'https://api.stage.openshift.com';

export class Services {
  static getInstance() {
    if (Services.singleton === undefined) {
      Services.singleton = new Services();
    }

    return Services.singleton;
  }

  private static singleton: Services;
  public apiService = new DefaultApi();
}
