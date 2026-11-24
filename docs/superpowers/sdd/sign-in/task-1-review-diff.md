Task 1 snapshot diff (Git repository unavailable; baseline captured immediately before implementation).

===== .gitignore =====
warning: in the working copy of 'docs\superpowers\sdd\sign-in\baseline\task-1\.gitignore', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of '.gitignore', LF will be replaced by CRLF the next time Git touches it
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\.gitignore" .gitignore
index 3ff38cc..cb08a66 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\.gitignore"
+++ .gitignore
@@ -1,3 +1,4 @@
 node_modules/
 dist/
 .vite/
+.env.local

===== package.json =====
warning: in the working copy of 'docs\superpowers\sdd\sign-in\baseline\task-1\package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\package.json" package.json
index cfd87b5..dc59251 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\package.json"
+++ package.json
@@ -9,6 +9,7 @@
     "preview": "vite preview"
   },
   "dependencies": {
+    "@clerk/react": "^6.19.4",
     "framer-motion": "^14.14.0",
     "react": "^19.3.1",
     "react-dom": "^19.3.1"

===== package-lock.json =====
warning: in the working copy of 'docs\superpowers\sdd\sign-in\baseline\task-1\package-lock.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'package-lock.json', LF will be replaced by CRLF the next time Git touches it
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\package-lock.json" package-lock.json
index bc3b4d4..ccf05e9 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\package-lock.json"
+++ package-lock.json
@@ -8,6 +8,7 @@
       "name": "fish-upon-the-sky-prototype",
       "version": "0.1.0",
       "dependencies": {
+        "@clerk/react": "^6.19.4",
         "framer-motion": "^14.14.0",
         "react": "^19.3.1",
         "react-dom": "^19.3.1"
@@ -17,6 +18,49 @@
         "vite": "^8.3.8"
       }
     },
+    "node_modules/@clerk/react": {
+      "version": "6.19.4",
+      "resolved": "https://registry.npmjs.org/@clerk/react/-/react-6.19.4.tgz",
+      "integrity": "sha512-UEnupKc+bama7L49tu7J1SlP0XmAClDs9sfYwCohYabNeJS1aIur/AZ7TMw1ukwAZVug2spt87/22F0JYQ2n0w==",
+      "license": "MIT",
+      "dependencies": {
+        "@clerk/shared": "^4.48.3"
+      },
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "peerDependencies": {
+        "react": "^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0",
+        "react-dom": "^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0"
+      }
+    },
+    "node_modules/@clerk/shared": {
+      "version": "4.48.3",
+      "resolved": "https://registry.npmjs.org/@clerk/shared/-/shared-4.48.3.tgz",
+      "integrity": "sha512-lcwTiQkmmmcN3KjAwEfycFv0+fNyLJQJjhC4T+zr405QyypkTZmvaNkoBQW7QpRdX8UlNW63IoTrIX/vT37EhQ==",
+      "license": "MIT",
+      "dependencies": {
+        "@tanstack/query-core": "^5.101.4",
+        "dequal": "2.0.3",
+        "glob-to-regexp": "0.4.1",
+        "js-cookie": "3.0.8"
+      },
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "peerDependencies": {
+        "react": "^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0",
+        "react-dom": "^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0"
+      },
+      "peerDependenciesMeta": {
+        "react": {
+          "optional": true
+        },
+        "react-dom": {
+          "optional": true
+        }
+      }
+    },
     "node_modules/@emnapi/core": {
       "version": "2.0.0-beta.2",
       "resolved": "https://registry.npmjs.org/@emnapi/core/-/core-2.0.0-beta.2.tgz",
@@ -382,6 +426,16 @@
       "dev": true,
       "license": "MIT"
     },
+    "node_modules/@tanstack/query-core": {
+      "version": "5.108.2",
+      "resolved": "https://registry.npmjs.org/@tanstack/query-core/-/query-core-5.108.2.tgz",
+      "integrity": "sha512-0l+0xDKqn71hfJBKaAvFP/X7WYM0TbscEk6nK1pHaWQUWUEA+WJD0VlT8wF+HIJANMV9B/DouPWwDnX3w/l9BA==",
+      "license": "MIT",
+      "funding": {
+        "type": "github",
+        "url": "https://github.com/sponsors/tannerlinsley"
+      }
+    },
     "node_modules/@tybys/wasm-util": {
       "version": "0.10.5",
       "resolved": "https://registry.npmjs.org/@tybys/wasm-util/-/wasm-util-0.10.5.tgz",
@@ -423,6 +477,15 @@
         }
       }
     },
+    "node_modules/dequal": {
+      "version": "2.0.3",
+      "resolved": "https://registry.npmjs.org/dequal/-/dequal-2.0.3.tgz",
+      "integrity": "sha512-0je+qPKHEMohvfRTCEo3CrPG6cAzAYgmzKyxRiYSSDkS6eGJdyVJm7WaYA5ECaAD9wLB2T4EEeymA5aFVcYXCA==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
     "node_modules/detect-libc": {
       "version": "2.1.2",
       "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
@@ -493,6 +556,18 @@
         "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
       }
     },
+    "node_modules/glob-to-regexp": {
+      "version": "0.4.1",
+      "resolved": "https://registry.npmjs.org/glob-to-regexp/-/glob-to-regexp-0.4.1.tgz",
+      "integrity": "sha512-lkX1HJXwyMcprw/5YUZc2s7DrpAiHB21/V+E1rHUrVNokkvB6bqMzT0VfV6/86ZNabt1k14YOIaT7nDvOX3Iiw==",
+      "license": "BSD-2-Clause"
+    },
+    "node_modules/js-cookie": {
+      "version": "3.0.8",
+      "resolved": "https://registry.npmjs.org/js-cookie/-/js-cookie-3.0.8.tgz",
+      "integrity": "sha512-yeJd4aNAdYZQjaon2bpD/Gb0B/omw7HQOsynXXcOiWVCacbBcPlgn8S/d1X6blFSaHao7ozqtW7NZW19xpCtIw==",
+      "license": "MIT"
+    },
     "node_modules/lightningcss": {
       "version": "1.33.0",
       "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",

===== .env.example =====
warning: in the working copy of '.env.example', LF will be replaced by CRLF the next time Git touches it
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\empty.txt" .env.example
index e69de29..4d8bc11 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\empty.txt"
+++ .env.example
@@ -0,0 +1 @@
+VITE_CLERK_PUBLISHABLE_KEY=

===== src/auth/auth-config.js =====
warning: in the working copy of 'src\auth\auth-config.js', LF will be replaced by CRLF the next time Git touches it
diff --git "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\empty.txt" "src\\auth\\auth-config.js"
index e69de29..1982b4b 100644
--- "docs\\superpowers\\sdd\\sign-in\\baseline\\task-1\\empty.txt"
+++ "src\\auth\\auth-config.js"
@@ -0,0 +1,2 @@
+export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? ''
+export const hasClerkConfiguration = Boolean(clerkPublishableKey)
