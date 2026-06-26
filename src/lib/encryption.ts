import Cryptr from "cryptr";

const cryptr = new Cryptr(process.env.ENCRYPTION_KEY as string);

export const encrypt = (value: string) => cryptr.encrypt(value);
export const decrypt = (value: string) => cryptr.decrypt(value);
