-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MOVIE', 'SERIES');

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "mediaType" "MediaType" NOT NULL DEFAULT 'MOVIE';
