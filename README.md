# HexViewer Extension

The master branch has the original HexViewer extension, and the typedArray branch has the typed array viewer version.

Both work the same: a window.view and a console.view methods are added to the inspected window.

- Select the HexViewer Panel (it has to be active so the panel can receive the data)
- In the console (opened as a drawer, since the panel still has to be visible), write
[console.]view( array )
for instance, in https://www.clicktorelease.com/code/polygon-shredder/#256
you can write view(mesh.geometry.attributes.position.array)

The perceived delay is due to the buffers being copied several times across the extension.

The HexViewer version uses BigNumber to convert selected byte ranges to number.
It has endianess support, and conversion to Signed/Unsigned int and Float.

The TypedArray version shows the original typed array data type.
It's missing Data Views conversion (it it were necessary)

Adding the console.view was a way of exposing the code to test, but ideally it should work on the Source Panel.
Unfortunately, it's not as easy to do with an extension: adding more panels to the Sources Panel; detecting the selected object to display its contents; and that if the execution is paused, the part in the extension that runs in the page context will be paused, too.

#### License ####

MIT licensed

Copyright (C) 2016 Jaume Sanchez Elias, http://www.clicktorelease.com
