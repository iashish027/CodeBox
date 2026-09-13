/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `problems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `constraints` to the `problems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inputFormat` to the `problems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outputFormat` to the `problems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sampleInput` to the `problems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sampleOutput` to the `problems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `problems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "constraints" TEXT NOT NULL,
ADD COLUMN     "inputFormat" TEXT NOT NULL,
ADD COLUMN     "outputFormat" TEXT NOT NULL,
ADD COLUMN     "sampleInput" TEXT NOT NULL,
ADD COLUMN     "sampleOutput" TEXT NOT NULL,
ADD COLUMN     "slug" VARCHAR(300) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "problems_slug_key" ON "problems"("slug");
