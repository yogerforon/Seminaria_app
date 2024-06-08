import { LoaderFunction, useLoaderData } from "@remix-run/react"
import { db } from "~/utils/db.server";

export let loader: LoaderFunction = async () => {
  let products = await db.product.findMany();
  return { products };
};

export default function Products() {
  let { products } = useLoaderData();
  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name} - ${product.price}</li>
        ))}
      </ul>
    </div>
  );
}