Failed to compile.
./pages/index.tsx:53:32
Type error: Type '(error: any) => void' has no properties in common with type 'IImageOptions'.
  51 |                                 canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
  52 |                                 resolve();
> 53 |                             }, (error) => {
     |                                ^
  54 |                                 reject(`Failed to load background image ${bg}: ${error.message}`);
  55 |                             });
  56 |                         });
Error: Command "npm run build" exited with 1
