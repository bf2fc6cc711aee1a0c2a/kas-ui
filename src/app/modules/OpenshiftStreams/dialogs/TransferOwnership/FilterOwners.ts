import { useFederated } from "@app/contexts";
import { Principal } from "@rhoas/app-services-ui-shared";

export const filterUsers = (value: string, options: JSX.Element[]) => {
  if (!value) {
    return options;
  }
  const input = new RegExp(value, "i");
  return options?.filter(
    (userAccount) =>
      input.test(userAccount.props.value) ||
      input.test(userAccount.props.description)
  );
};

export const useGetAllUsers = () => {
  const { getAllUserAccounts } = useFederated() || {
    getAllUserAccounts: () => [],
  };
  const userAccounts = getAllUserAccounts && getAllUserAccounts();
  return userAccounts?.map((userAccount: Principal) => {
    const { id, displayName } = userAccount;
    return {
      id: id,
      displayName: displayName,
    };
  });
};
