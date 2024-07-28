/*
  Warnings:

  - Added the required column `execTime` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "testCases" TEXT NOT NULL,
    "constraints" TEXT NOT NULL,
    "execTime" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Problem" ("constraints", "description", "id", "testCases", "title") SELECT "constraints", "description", "id", "testCases", "title" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
