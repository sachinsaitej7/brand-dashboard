import { getFirebase } from "../../firebase";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const { db, storage } = getFirebase();

const brandsColRef = collection(db, "brandItem");

export const getData = async (user) => {
  const brandsQuery = query(brandsColRef, where("createdBy", "==", user.uid));
  const brandSnapshot = await getDocs(brandsQuery);
  const brandItems = brandSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return brandItems;
};

export const updateItem = async (id, values) => {
  const itemRef = doc(db, "brandItem", id);
  return await updateDoc(itemRef, values);
};

export const deleteItem = async (id) => {
  const itemRef = doc(db, "brandItem", id);
  return await deleteDoc(itemRef);
};

export const getDocRef = () => {
  const itemRef = doc(brandsColRef);
  return itemRef;
};

export const addItem = async (itemRef, item) => {
  return await setDoc(itemRef, item);
};

export const getImages = async (id) => {
  const imagesRef = collection(db, `brandItem/${id}/images`);
  const itemSnapshot = await getDocs(imagesRef);
  if (itemSnapshot.empty) return [];
  const images = itemSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return images;
};

export const addImages = async (id, files, user) => {
  const imagesRef = collection(db, `brandItem/${id}/images`);
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
      console.log(file);
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

export const addImage = async (id, image) => {
  const imagesRef = collection(db, "brandItem", id, "images");
  return await addDoc(imagesRef, image);
};

export const deleteImage = async (id, imageId) => {
  const imagesRef = collection(db, "brandItem", id, "images");
  const imageRef = doc(imagesRef, imageId);
  return await deleteDoc(imageRef);
};

export const updateImage = async (id, image) => {
  const imagesRef = collection(db, "brandItem", id, "images");
  const imageRef = doc(imagesRef, image.id);
  return await updateDoc(imageRef, image);
};
