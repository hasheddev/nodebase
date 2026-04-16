import { string } from "zod";

interface IMockImage {
  src?: string;
  alt?: string;
}

export const MockImage = ({ alt, src }: IMockImage) => {
  return <img alt={alt} src={src} />;
};
