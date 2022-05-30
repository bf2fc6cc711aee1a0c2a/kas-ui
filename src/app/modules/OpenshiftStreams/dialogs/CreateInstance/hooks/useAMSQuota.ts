import {
  useAuth,
  useConfig,
  Quota,
  QuotaValue,
  QuotaType,
} from "@rhoas/app-services-ui-shared";
import { Configuration, AppServicesApi } from "@rhoas/account-management-sdk";
import { InstanceType } from "@app/utils";

/**
 * Hook that fetches available entitelemts from AMS
 *
 * @returns
 */
export const useAMSQuota = () => {
  const config = useConfig();
  const auth = useAuth();

  // TODO we need this details to be shared to from app-servies-ui
  const quotaProductId = "RHOSAK";
  const trialQuotaProductId = "RHOSAKTrial";
  const resourceName = "rhosak";

  return async () => {
    const accessToken = await auth?.ams.getToken();
    const ams = new AppServicesApi({
      accessToken,
      basePath: config?.ams.apiBasePath || "",
    } as Configuration);

    const account = await ams.apiAccountsMgmtV1CurrentAccountGet();
    const orgId = account?.data?.organization?.id;
    const quotaData = new Map<QuotaType, QuotaValue>();
    // TODO remove service down and other values. Use different model?
    const filteredQuota: Quota = {
      loading: true,
      isServiceDown: false,
      data: undefined,
    };

    if (!orgId) {
      console.error("useQuota", "orgId is not defined");
      filteredQuota.loading = false;
      filteredQuota.isServiceDown = true;
      return filteredQuota;
    }

    try {
      const response =
        await ams.apiAccountsMgmtV1OrganizationsOrgIdQuotaCostGet(
          orgId,
          undefined,
          true
        );

      const quota = response?.data?.items?.find((q) =>
        q.related_resources?.find(
          (r) =>
            r.resource_name === resourceName && r.product === quotaProductId
        )
      );
      const trialQuota = response?.data?.items?.find((q) =>
        q.related_resources?.find(
          (r) =>
            r.resource_name === resourceName &&
            r.product === trialQuotaProductId
        )
      );

      // TODO logic here should include marketplace vs standard billing model.
      // We need to pick standard
      if (quota && quota.allowed > 0) {
        const remaining = quota?.allowed - quota?.consumed;
        quotaData?.set(QuotaType.kas, {
          allowed: quota?.allowed,
          consumed: quota?.consumed,
          remaining: remaining < 0 ? 0 : remaining,
        });
      }

      if (trialQuota) {
        quotaData?.set(QuotaType.kasTrial, {
          allowed: trialQuota?.allowed,
          consumed: trialQuota?.consumed,
          remaining: trialQuota?.allowed - trialQuota?.consumed,
        });
      }

      filteredQuota.loading = false;
      filteredQuota.data = quotaData;
    } catch (error) {
      filteredQuota.loading = false;
      filteredQuota.isServiceDown = true;
      console.error(error);
    }

    return filteredQuota;
  };
};

// Helper methods for busines logic handled in the UI
export function convertQuotaToInstanceType(
  quota: Map<QuotaType, QuotaValue> | undefined
) {
  let kasQuota: QuotaValue | undefined;
  try {
    kasQuota = quota?.get(QuotaType?.kas);
  } catch (e) {
    console.error("useAvailableProvidersAndDefault", "quota?.get exception", e);
  }
  if (kasQuota !== undefined && kasQuota.remaining >= 0) {
    return InstanceType.standard;
  } else {
    return InstanceType.developer;
  }
}

export function getQuotaType(quota: Map<QuotaType, QuotaValue> | undefined) {
  let kasQuota: QuotaValue | undefined;
  try {
    kasQuota = quota?.get(QuotaType?.kas);
  } catch (e) {
    console.error("useAvailableProvidersAndDefault", "quota?.get exception", e);
  }

  if (kasQuota !== undefined && kasQuota.remaining >= 0) {
    return "standard";
  }

  return "trial";
}
