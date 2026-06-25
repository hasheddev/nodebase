import { useQueryStates } from "nuqs";
import { credentialParams } from "../params";

export const useCredentialsParams = () => useQueryStates(credentialParams);
