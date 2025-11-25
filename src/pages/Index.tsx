1s
Run npm run build

> vite_react_shadcn_ts@0.0.0 build
> vite build

vite v5.4.19 building for production...
transforming...
✓ 6 modules transformed.
x Build failed in 920ms
error during build:
[vite:esbuild] Transform failed with 1 error:
/home/runner/work/test/test/src/pages/Index.tsx:275:8: ERROR: Unexpected end of file before a closing "div" tag
file: /home/runner/work/test/test/src/pages/Index.tsx:275:8

Unexpected end of file before a closing "div" tag
273|            <Toast message={toast.message} type={toast.type} />
274|          </div>
275|        )}
   |          ^

    at failureErrorWithLog (/home/runner/work/test/test/node_modules/esbuild/lib/main.js:1472:15)
    at /home/runner/work/test/test/node_modules/esbuild/lib/main.js:755:50
    at responseCallbacks.<computed> (/home/runner/work/test/test/node_modules/esbuild/lib/main.js:622:9)
    at handleIncomingPacket (/home/runner/work/test/test/node_modules/esbuild/lib/main.js:677:12)
    at Socket.readFromStdout (/home/runner/work/test/test/node_modules/esbuild/lib/main.js:600:7)
    at Socket.emit (node:events:517:28)
    at addChunk (node:internal/streams/readable:368:12)
    at readableAddChunk (node:internal/streams/readable:341:9)
    at Readable.push (node:internal/streams/readable:278:10)
    at Pipe.onStreamRead (node:internal/stream_base_commons:190:23)
Error: Process completed with exit code 1.