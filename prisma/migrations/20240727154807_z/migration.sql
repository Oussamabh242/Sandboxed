/*
  Warnings:

  - You are about to drop the column `constraints` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Problem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testCases" TEXT NOT NULL,
    "execTime" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "functionName" TEXT NOT NULL DEFAULT 'combinationSum'
);
INSERT INTO "new_Problem" ("execTime", "functionName", "id", "order", "testCases") SELECT "execTime", "functionName", "id", "order", "testCases" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
