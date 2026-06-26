import { parseAsInteger } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

//search=""   clears search i.e deletes if value is default
export const executionParams = {
  page: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE)
    .withOptions({ clearOnDefault: true }),
  pageSize: parseAsInteger
    .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
    .withOptions({ clearOnDefault: true }),
};
