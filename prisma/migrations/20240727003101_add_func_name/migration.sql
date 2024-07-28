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
    "order" INTEGER NOT NULL DEFAULT 1,
    "functionName" TEXT NOT NULL DEFAULT 'combinationSum'
);
INSERT INTO "new_Problem" ("constraints", "description", "execTime", "id", "order", "testCases", "title") SELECT "constraints", "description", "execTime", "id", "order", "testCases", "title" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
