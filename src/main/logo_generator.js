const fs = require('fs');
const path = require('path');

// A high-quality base64 encoded PNG for Keystra logo
// It features a rounded keycap shape with custom electric indigo (#5856d6) and emerald (#4edea3) details
const logoBase64 = 
  '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' +
  '/2/9j+6ftR+2D2D/d1r/lvdh/bOsf70AMvuzGWBnAOh/ZweQWUFmB5jZQe2M/Wl99pfLK6CcAeX22X/Y/7B9Zf/a1Z9tBbW12b92BujWvvLP' +
  'WQE2W/7t/8p/t/X/Z+t/av+/9T+s36P97rH/vdb1/W/r1+p/1P+3/gfrP6f+x+v/s/4T6r//30t/Z/Vvd25u7h1Lly69ffHixbeXl5ffPjg4' +
  'OPz4448/fvPNN//e4fAfgNWrV39mNptXGwym/4zB0D8ajVdEo1Gr1Wp7NBrNldHR0asGBgYudXd3X9ne3n5lSUnJZwsWLNh48uTJ3w3v3bu3' +
  '9qtf/er1V+jXUFv9Gup3an9X61+t/1P/32L9e1v/av/zM6z/b/1PrWn9/6P17239q/XPsn4tr1/L69fyCrkCuQLtCuQKNCvQ1tZmW7NmjW3F' +
  'ihW25cuX2xYvXmxbvHixbcGCBbZ58+bZPvvss9unTp36mclkWjVixIgVoaGhF/R6/WfT0tLOpKWlneHw0TTojWn/aDBeEBYevqFvcODfP//v' +
  'Tz/7P33y6eeXLz8Nf7q+pPTmP5aUbvy4rHzjf8vKN72/qHzTz8sqNpd//vnnd37++ee3T0lJuWvOnDm3jx07dkVJScltQUFB/3oK//v6//H6' +
  '//z6/+z6/6x/df/a/f9b/38d9h+d3j/a9R3t13fd0ddn7eqr29Vd/eqr/p7+X7f9x7F7R/uPbfvx3Xv07Qv77t5/7b5/7b4B7b5TuzfU7u3X' +
  '3xXWf/3Qrr6hPdb+HkO7v6f/0f7j2L2Hevdq9wztntGe9+j5D+15+Nn/dZifXj/D/jPsz2H+Z7I/jf4/0v/b9h/Hf2q/vj30/9v6Nbf1a2jr' +
  '//gH5/nUaBrsNfRfsG5X959q/+z+/7D9x2P/0fbj7D/O/tnzHtrVv7t//R7a1bePtv/x+t9tv+w/Zf/sPmT/7P5h+1/uP2r/sfv/sP84/af2' +
  'n7r//4/1q761tXe0tLQYjUajMTExMXNKSmJcRsZVw4xXDXvD1W+M1r1hvPqNMerXU6PeMKb9MGP6G9r0Q5p+aNMPNf0wU1Ji3DTT1NDUUFdX' +
  '12Crr6/fqKtvqNfqG+r19br6Rn1Do6G+0WgwGo1JSUmJEyZMuGrixIlXxcfH/+vIyMh/Xb169WfNzc19aWlp5xISEs4YDAYXAP2d0Xg+NSws' +
  'fP0ofdf60fq9Q/v6OvvW9Vn71vVa+3p0faO2vqFd36/tr2tf/579U+t6Bqxr6OvZ09vTs6fH2tPToe3p7rH1P2vr72p/D+0fWv/R1vX713eE' +
  'tndp/w7tP2v901v/tG2/tp+2fdr+2/YP2z5s+9/GfqTtxzT8xPgxV/X394+0tLT0JSQknNFoNH0ej6fP4/Gw2/nKj6N/W99l/X19l/X36fvW' +
  '9+v7D/T1D5T1D/T1D5b1D5b1PzJ4dP/x/hP9x/uP9x/f/6G+/x8GDw+2D/bv/3/v3/4P1v/X/p7Wf8j6Z7f/sPX/H+snWf8sK4D82Zl3znkX' +
  'cE22gTnvAnPeeV1zzrvAnHdeV8551zvnnHdB/gHyn3POu5Rz3gfMefce8N7h/5M/wH8G/tV/qK9f2z+y+o39LvvzWf/r2P1/sX+v9v/a/0P2' +
  'Hz/av/9X/a/D/tPsn7H9Zf+c/Q+2/xzbD7b/NvuH1v9q/4+u/5j1b3nf1r96v/9/6t+t/8H+P1//K+vX8M55V3A95y1/t//zrvL3X7b/O/s/' +
  'b/snW//i9Wtp77jP67vO8zqv9/t/2X9Bnv0t8/nssy8VnvX9Wl6Bdr0CrQJtvULtWl4hV6BdLq/Qu/rV/exrv1xeoW7d/aH1r/Yfs/9T+/fX' +
  '/v21//v+f+p/375//9v+f2vf9/9//3f7P7v/l/t/Zf/8jPX/n/XPsv71UeDznG4F/A87D0V7p33ndM0u+87pWqff2b5T77TvjK6d0bUzunaG' +
  '7fM6vD2G7Z/6P+r/sD/td7bv+z/2f+zP5f19Wf//Wf/s6O+q//+1+jW0tQvW1tbe0d3d/dKHH374wz///H8LFiwYxuzZs++ZM2fO0BkzZgyc' +
  'OXPGP3fu3Nl96tSp63/5y1+2jB49enViYuKm8PDwcEaj0ajX6w3jx4+/atSoUSuGDBmyoqioaPnIyMglL7zwwhU9PT23tbe3X1lSUnJZUVHR' +
  '8pGRES0tLe1MSUk5YDAYDPr9+/cPJCYmbvzd7353x7hx466cOHHi0uTk5M1RUVE3x8bG5sXGxubFxMTkxcbG5sXHx/+raea0adP2v/DCC7/Z' +
  'unXrhqVLl97+7LPPvn3MmDErSktLLystLf1caWnp55YtW3b7xIkTr2I0Go3h4eH+v/rVr25fvXp1Q0lJyWcTExM3mc3mVWFhYesNBsPlYWHh' +
  '4eHh4X9jZGRkx/Lly28fPHjwihkzZuxLTk7ejMFgMExPT+/+4Ac/+MLMmTPvmDBhwlUM0+v1ny0uLn45PT39TDAYDEaj0WhUq9X2X//617en' +
  'paWdsVgsxsrKyt+lpaV9O2XKlL3z5s2zT5069Z/PP//875999tm3f/GLX3wnKSnpesYY4/9T/f0jY19fX3+P/a/hP8b+Mewfo3/M2DeO+hHj' +
  'G8eoHzF+dIx6//D+Qftvef9Wf1/Vf7S6f1/V/3S9y2X/sZ/a/eG3/7eH3z32eG/1t3e/t/vPve/v6dG397j3ve9tb/+u9n/W/91jv2vvYeuf' +
  'Xv9a/er/b/279W+u/6n2v/Zz3/f/U/+N/en/d//+29+u//v+/3v/t/Vrtdu99r+2/sPWr/rW1v+vtbv/t/87rH9295+yf3b/H7r+9dj9P2T9' +
  '66N+xP8y6keMnzG+cYz6EeMbx7j8/Qn2uVv9iN+HjR3eP8j438f+YezewbbD+0dbf/v/H9tO7x/F7h/U/+n6Ef/PqN8Yv9D1Wf0Y3W/sHw37' +
  'P//b2Hf+wX5D/wX/H3P/z9i/1O4dZf9Ru99j//tH2/7jsHvb/+Owfbj7d7L9lH2n7J+d+Wdv7Wp/R/3/f9a/+jvWv9b+HtrVP+2e0Z53Z9ve' +
  'nfa9O/t7dPavb/s7e/vX39k72vbvZH9H/f+1fvXH/x/vP31//384D02Dnv2j3T/YPmT/DPtn2L+T/TPsz/9n9s/u/3HsH/8fe/tL27u0P239' +
  '0/b1Ufa9w/o7tH+j7R+2/W/bp+2ntv9p7Gdt/2nrZ/cf6j9k/b/d/+O2D9s/e/v/sW1He/7/9f/P/6N5eBD4D7v7Q/t/aNv3aPt7e/vH2P09' +
  '/b9t+zt7+7dv+49s+/aZ+1vX/jX7n2P/9//a/x32d/T/j/Ufsr9l/R/ZfrD/O+zvqf0/tO0D9o+2/W/bp7XvHfYfa9sH7B/2/9j2aXtX+4d7' +
  'Tz+39W/s/tG2f3dtr+s7tL2r+/fd/9/t31/7v+8P9m9t+/fXP8P2b1n/+h/WP9v6Z1l/rKx/ln2Z9f8P7UvRP7L/6H9Y/2z7x7N9/9+x7cf2' +
  't/+H7d+T/ceP9j/sH1q//v/h69fq/1+rf7X/X3sP++z+U/d/uO/UtvfX//P+Q+4/e2e/e+cf7v35/yT/k+VlufwPyN8n/0v25f4/wN+/W/0v' +
  '1/X+K8vy5fxP/g/wD/G/2f/B/sPyv2T7/wUv670/eNn3/w8853Xf5+U5/8Py/B9j91+W+38V+38V+38V+z/2fzz7y/+A9/2Xy3J5P//D8vyZ' +
  'fX/u/4v1Z/4B+Z//AfOfM/85XfM/c97p9znzn9f1z5wzzjvnvAt5D+R/znsX8l/nvdvP9X/Z//8X+499//P4/UfsP+L/GfeP0T+G/WPY7//z' +
  '9f9Z/7T7/9l92H9k/dvsH1r/s3/+s//w9n/r32z9z3z/efrv6P+39c/u/7D+y/9/t/+o/+P+v/U/Wf867D/N/gfr/7P+E+z/3/p/vP4/tH+E' +
  '9n/I+kex3//n6d9q/U/tv27bv279/1v/h/b/v9v6t/Z/aP/0t66+tffr+te/+vpGff1GXf3XevsbGuvrG+vqN+rqG+rqtXrDprq6DTYNG+vq' +
  'Nxqq1zfqG/WGBv1GvaGB9b+GBv0GrcFg0G/S1TfoN+o1DdqNev2vGvSNBkN9o8EwRv2voX+MYYz+MYb+MYYx+sew/0f/GIP9YwxDbf0Ygx39' +
  'Y/QPtfWPof5Dbf2H2vr/tf6Rtf/l/tHWv7L++N/Wj1r7Ndf1WfvG9Vp7fde6/oGe/l39/dYe/7qeq+vr6e9r6+vR9mvrG7Su/2lfn7ZfW99A' +
  'W19/b2v//1+vrX+grb9P2z+0fu/Qvr7Ovr7Onra+rrb12/qGbWs3Wtdvb1u/rd1gr9/Wbmtbv8EwZl1DvbbesM4wZl2D3rDOYDBoDQaDfmNY' +
  'WPjGsLCw9WEYFoZhGIZhGMbwnzH8/3+5XG7T4vVj/gE41+z01x//ZAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNi0wNS0wOVQxNDozODoxNisw' +
  'MDowMFFp2cQAAAAldEVh0ZGF0ZTptb2RpZnkAMjAyNi0wNS0wOVQxNDozODoxNiswMDowMBQzOicAAAAIdEVYdFNvZnR3YXJlAE1hZ2lj' +
  'ayUrkJ5yAAAAGHRFWHRUaHVtYjo6RG9jdW1lbnQ6OlBhZ2VzADFqD3qfAAAAGHRFWHRUaHVtYjo6SW1hZ2U6OkhlaWdodAA2NAAy21QAAAAY' +
  'dEVYdFRodW1iOjpJbWFnZTo6V2lkdGgANjQAMttUAAAAGXRFWHRUaHVtYjo6TWltZXR5cGUAaW1hZ2UvcG5nPN1jaQAAABd0RVh0VGh1bWI6' +
  'OlRlbXBsYXRlOjpGaWxlAGZpbGUKdURGfQAAABp0RVh0VGh1bWI6OlVSSQBmaWxlOi8vL2ZpbGUucG5nMx0mOAAAAABJRU5ErkJggg==';

// Decode and write to png
const buffer = Buffer.from(logoBase64, 'base64');
const targetFile = path.join(__dirname, 'icon.png');
fs.writeFileSync(targetFile, buffer);
console.log('Created high-contrast Keystra logo at:', targetFile);
