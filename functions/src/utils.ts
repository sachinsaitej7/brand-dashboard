import { omit } from "lodash";
import slugify from "slugify";

import { additionalKeys } from "./types";

export function processProductData<T>(data: T, docId: string): additionalKeys {
  const productData = cleanProductData(data) as additionalKeys;
  productData.sourcedId = docId;
  productData.status = true;
  productData.slug = slugify(productData.name || "", {
    lower: true,
    trim: true,
    locale: "en",
  });

  return productData;
}

export function cleanProductData<T>(data: T): T | Partial<T> {
  if (typeof data === "object")
    return omit(data, [
      "createdAt",
      "updatedAt",
      "status",
      "createdBy",
      "createdType",
      "productType",
      "scrapedId",
      "slug",
    ]);
  return data;
}
