import React, { Suspense } from "react";

const ProductsView = React.lazy(() => import("../products-page"));
const ScrapeView = React.lazy(() => import("../scrape-page"));
const UploadProductsView = React.lazy(() => import("../upload-products-page"));

export const ProductsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsView />
    </Suspense>
  );
};

export const ScrapePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScrapeView />
    </Suspense>
  );
};

export const UploadProductsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadProductsView />
    </Suspense>
  );
};
