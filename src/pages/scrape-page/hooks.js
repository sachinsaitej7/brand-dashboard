import { getFirebase } from "../../firebase";
import { useQuery } from "react-query";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";

import {
  collection,
  query,
  where,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const { db, storage } = getFirebase();

export function getIdConverter() {
  const idConverter = {
    fromFirestore: function (snapshot, options) {
      const data = snapshot.data(options);
      return { ...data, id: snapshot.id };
    },
  };
  return idConverter;
}

const idConverter = getIdConverter();

const brandItemColRef = collection(db, "brandItem").withConverter(idConverter);
const categoryColRef = collection(db, "category").withConverter(idConverter);
const colorColRef = collection(db, "color").withConverter(idConverter);
const sizeColRef = collection(db, "size").withConverter(idConverter);

export function useProducts(brandId) {
  const brandsQuery = query(
    brandItemColRef,
    where("brand.id", "==", brandId),
    where("createdType", "==", "scrape")
  );
  return useCollectionData(brandsQuery);
}

export function useProductVariants(productId) {
  const q = query(collection(db, 'brandItem', productId, 'variants').withConverter(idConverter));
  return useCollectionData(q);
}

export function useProductImages(productId) {
  const q = query(collection(db, 'brandItem', productId, 'images').withConverter(idConverter));
  return useCollectionData(q);
}


const getData = async (url) => {
  try {
    if (!url) return null;
    const response = await fetch(url + "/products.json?limit=250");
    const data = await response.json();
    return data;
  } catch (error) {
    alert("Not Scrappable");
    return null;
  }
};

export function useScrapeData(url = "") {
  const response = useQuery(url, () => getData(url), {
    enabled: !!url,
  });
  return [response];
}

export function useBrandData(brandId) {
  const q = doc(db, "brand", brandId).withConverter(idConverter);
  return useDocumentData(q);
}

export function useCategoryData() {
  const q = query(categoryColRef, where("status", "==", true));
  return useCollectionData(q);
}

export function useSubcategoryData(categoryId) {
  const q = query(
    collection(db, "category", categoryId, "subcategory"),
    where("status", "==", true)
  ).withConverter(idConverter);
  return useCollectionData(q);
}

export function useColorData() {
  const q = query(colorColRef, where("status", "==", true));
  return useCollectionData(q);
}

export function useSizeData() {
  const q = query(sizeColRef, where("status", "==", true));
  return useCollectionData(q);
}

function parseProduct(product, brandData) {
  const {
    id,
    title,
    handle,
    body_html,
    product_type,
    tags = [],
    variants = [],
    images = [],
  } = product;

  const productData = {
    scrapedId: id,
    name: title,
    slug: handle,
    descriptionHtml: body_html,
    productType: product_type,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: true,
    tags: tags,
    brand: {
      id: brandData.id,
      name: brandData.name,
      image: brandData.image,
      logo: brandData.logo,
    },
    createdType: "scrape",
    createdBy: "admin",
    thumbnail: images[0]?.src,
    price:
      variants.length > 0
        ? {
            currentPrice: Number(variants[0].price),
            discount: null,
            mrp: Number(variants[0].price),
          }
        : null,
  };
  return productData;
}

export async function addProducts(products = [], brandData) {
  try {
    const response = await Promise.all(
      products.map(async (product) => {
        const productData = parseProduct(product, brandData);
        const docRef = await addDoc(collection(db, "brandItem"), productData);
        await Promise.all(
          product?.images.map((image) =>
            addDoc(collection(db, "brandItem", docRef.id, "images"), {
              url: image.src,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              id: image.id,
            })
          )
        );
        await Promise.all(
          product?.variants.map((variant) =>
            addDoc(collection(db, "brandItem", docRef.id, 'variants'), {
              ...productData,
              ...variant,
              scrapedId: variant.id,
              status: "created",
              productId: docRef.id,
              thumbnail: product?.images[0]?.src,
              price: {
                currentPrice: Number(variant.price),
                discount: null,
                mrp: Number(variant.price),
              },
              stock: {
                quantity: 10,
              },
            })
          )
        );
      })
    );
    return response;
  } catch (error) {
    console.log("error", error);
  }
  return null;
}

export async function updateBrandItem(docId, data) {
  try {
    const response = await updateDoc(doc(db, "brandItem", docId), data);
    return response;
  } catch (error) {
    console.log("error", error);
  }
  return null;
}

export async function updateBrandItemVariant(docId, variantId, data) {
  try {
    const response = await updateDoc(
      doc(db, "brandItem", docId, "variants", variantId),
      data
    );
    return response;
  } catch (error) {
    console.log("error", error);
  }
  return null;
}

export const addImages = async (id, files, user) => {
  const imagesRef = collection(db, `brandItem/${id}/images`).withConverter(
    idConverter
  );
  const savedImages = await getDocs(imagesRef);
  await Promise.all(
    savedImages.docs.map(async (image) => {
      if (files.find((file) => file.id === image.id)) return Promise.resolve();
      const imageRef = ref(
        storage,
        `temp/${user.displayName}/${image.data().name}`
      );
      try {
        await deleteObject(imageRef);
      } catch (e) {
        console.log(e, "error");
      }
      return await deleteDoc(doc(db, `brandItem/${id}/images/${image.id}`));
    })
  );

  return Promise.all(
    files.map(async (file) => {
      if (file.id) return Promise.resolve({ ...file });
      const storageRef = ref(storage, `temp/${user.displayName}/${file.name}`);
      await uploadBytes(storageRef, file.originFileObj, {
        contentType: file.type,
      });
      const url = await getDownloadURL(storageRef);
      let data = await addDoc(imagesRef, {
        name: file.name,
        url,
        type: file.type,
      });
      data = { id: data.id, name: file.name, url, type: file.type };
      return Promise.resolve(data);
    })
  );
};
