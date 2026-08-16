-- Migration: add unique constraint on Product.name
CREATE UNIQUE INDEX "Product_name_key" ON "Product" ("name");
