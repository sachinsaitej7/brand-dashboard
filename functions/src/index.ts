import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { isEqual, omit } from "lodash";
import { processProductData } from "./utils";

admin.initializeApp();
const db = admin.firestore();

const productColRef = db.collection("product");
const brandItemColRef = db.collection("brandItem");
const productVariantRef = db.collection("productVariant");

exports.addProduct = functions.firestore
  .document("brandItem/{docId}/variants/{variantId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    if (
      !isEqual(newValue.status, previousValue.status) &&
      newValue.status === "approved"
    ) {
      const { docId, variantId } = context.params;
      console.log("1", docId, variantId);
      let productDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> | null =
        null;

      const productQuerySnapshot = await productColRef
        .where("sourcedId", "==", docId)
        .where("status", "==", true)
        .get();
      console.log("2", productQuerySnapshot.empty);
      if (productQuerySnapshot.empty)
        productDocRef = await createProduct(docId);
      else productDocRef = productQuerySnapshot.docs[0].ref;

      if (productDocRef) {
        return await createProductVariant(productDocRef, variantId, newValue);
      }
    }
    return null;
  });

async function createProduct(docId: string) {
  console.log("3", docId);
  const brandItemSnapshot = await brandItemColRef.doc(docId).get();
  console.log("3.1", brandItemSnapshot.exists);
  if (brandItemSnapshot.exists) {
    const productData: unknown = brandItemSnapshot.data();
    const productDocRef = await productColRef.add(
      processProductData(productData, docId)
    );
    await productDocRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const imagesSnapshot = await brandItemSnapshot.ref
      .collection("images")
      .get();
    if (!imagesSnapshot.empty) {
      const images = imagesSnapshot.docs.map((doc) => doc.data());
      images.forEach(async (image) => {
        const data = omit(image, ["createdAt", "updatedAt", "id"]);
        data.createdAt = admin.firestore.FieldValue.serverTimestamp();
        data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        return await productDocRef.collection("images").add(data);
      });
    }
    return productDocRef;
  }
  return null;
}

async function createProductVariant(
  productDocRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  variantId: string,
  variantData: FirebaseFirestore.DocumentData
) {
  console.log("4", variantId);
  const cleanedData = omit(variantData, [
    "createdAt",
    "updatedAt",
    "created_at",
    "createdType",
    "featured_image",
    "grams",
    "option1",
    "option2",
    "option3",
    "position",
    "product_id",
    "requires_shipping",
    "sku",
    "taxable",
    "title",
    "updated_at",
    "variant_id",
    "weight",
    "weight_unit",
    "productType",
    "scrapedId",
    "id",
    "compare_at_price",
    "available",
    "slug",
  ]);
  const productSnapshot = await productDocRef.get();
  const productImagesSnapshot = await productDocRef.collection("images").get();
  const productData = productSnapshot.exists ? productSnapshot.data() : {};

  const variantDocRef = await productVariantRef.add({
    ...cleanedData,
    ...productData,
    price: variantData.price,
    productId: productDocRef.id,
    sourcedId: variantId,
    weight: variantData.grams,
    status: true,
    superSubCategory: null,
    thumbnail: variantData.thumbnail,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  if (!productImagesSnapshot.empty) {
    const images = productImagesSnapshot.docs.map((doc) => doc.data());
    images.forEach(async (image) => {
      const data = omit(image, ["createdAt", "updatedAt", "id"]);
      data.createdAt = admin.firestore.FieldValue.serverTimestamp();
      data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      return await variantDocRef.collection("images").add(data);
    });
    return variantDocRef;
  }
  return null;
}
