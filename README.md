# [WCAG 2.0](http://www.w3.org/TR/WCAG20/) compliance color contrast
====

[Try it online](http://prettydiff.com/ignore/colorContrast/colorContrast.html)

Rationale
---

I found several color contrast tools online, but I found none written in JavaScript and none that compared a plurality of colors. I tired of watching my coworkers endlessly comparing colors from a limited list of approved colors. There existed a need, so I built the tool.

The intention of this application is to create all contrast comparisons for a given set of colors once. Since all colors are visible in a pass or fail state it should be immediately clear what combinations will be allowed. There is no need to even know what the acceptable rules and limitations are if using a tool like this.

The following rules defined my approach:

* [Rationale for Chosen Contrast Ratios](http://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html)
* [Relative Luminance](http://www.w3.org/TR/WCAG20/#relativeluminancedef)
* [Contrast Ratio](http://www.w3.org/TR/WCAG20/#contrast-ratiodef)

The solution is achieved by computing the relative luminance for a given color and then comparing that color with the defined contrast ratio. The mathmatical definitions are available in the W3C links mentioned above. The JavaScript solution is available in the JavaScript function luminance of this page's source code.

The reason why I had trouble finding similar tools written in JavaScript is because JavaScript is bad at frational arithmetic. The solution to this problem is to proportionally multiply all values by a power of ten until you are far left of the decimal. A few extra digits is recommended for extra precision.

MIT License
---

Copyright (2015) Austin Cheney

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
