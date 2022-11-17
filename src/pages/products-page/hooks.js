import { getFirebase } from "../../firebase";

import { collection, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

export function getIdConverter() {
  const idConverter = {
    fromFirestore: function (snapshot, options) {
      const data = snapshot.data(options);
      return { ...data, id: snapshot.id };
    },
  };
  return idConverter;
}

const { db } = getFirebase();

const productColRef = collection(db, "product").withConverter(getIdConverter());
const productVariantColRef = collection(db, "productVariant").withConverter(
  getIdConverter()
);

export function useProducts(brandId) {
  const productsQuery = query(productColRef, where("brand.id", "==", brandId));
  return useCollectionData(productsQuery);
}

export function useProductVaraints(productId) {
  const q = query(productVariantColRef, where("productId", "==", productId));
  return useCollectionData(q);
}
