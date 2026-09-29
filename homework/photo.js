/* Resize a worksheet photo before upload.
   Decode with createImageBitmap so EXIF rotation is applied (an Image is
   the fallback, which is also how Safari decodes an iPad HEIC). The long
   side is at most 1600px and is never enlarged. The canvas is filled white,
   then exported as a JPEG at quality 0.82. Over 1.5MB, retry at 0.7 and
   then at 1280px. If that fails, the original file is uploaded instead.
   image_base64 is raw base64, without a data: prefix. */
(function (root) {
  var MAX_EDGE = 1600;
  var RETRY_EDGE = 1280;
  var MAX_BYTES = Math.round(1.5 * 1024 * 1024);
  var FIRST_QUALITY = 0.82;
  var RETRY_QUALITY = 0.7;

  function fitWithin(width, height, max) {
    var w = Number(width);
    var h = Number(height);
    var limit = Number(max);
    if (!(w > 0) || !(h > 0)) return { w: 1, h: 1 };
    w = Math.round(w);
    h = Math.round(h);
    if (!(limit > 0) || Math.max(w, h) <= limit) {
      return { w: Math.max(1, w), h: Math.max(1, h) };
    }
    var scale = limit / Math.max(w, h);
    return {
      w: Math.max(1, Math.round(w * scale)),
      h: Math.max(1, Math.round(h * scale))
    };
  }

  function bytesToBase64(bytes) {
    var chunk = 0x8000;
    var parts = [];
    var i;
    for (i = 0; i < bytes.length; i += chunk) {
      parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunk)));
    }
    return btoa(parts.join(""));
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var bytes = new Uint8Array(reader.result);
          reader.onload = null;
          reader.onerror = null;
          resolve(bytesToBase64(bytes));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = function () { reject(new Error("jpeg")); };
      reader.readAsArrayBuffer(blob);
    });
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      var settled = false;
      function fail() {
        if (settled) return;
        settled = true;
        URL.revokeObjectURL(url);
        img.onload = null;
        img.onerror = null;
        reject(new Error("photo"));
      }
      img.onload = function () {
        if (settled) return;
        settled = true;
        URL.revokeObjectURL(url);
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        if (!w || !h) {
          img.onload = null;
          img.onerror = null;
          reject(new Error("photo"));
          return;
        }
        resolve({
          source: img,
          width: w,
          height: h,
          close: function () {
            img.onload = null;
            img.onerror = null;
            img.src = "";
          }
        });
      };
      img.onerror = fail;
      img.src = url;
    });
  }

  function fromBitmap(bitmap) {
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: function () {
        if (bitmap.close) bitmap.close();
      }
    };
  }

  function decode(file) {
    if (typeof createImageBitmap !== "function") return loadImage(file);
    var pending;
    try {
      pending = createImageBitmap(file, { imageOrientation: "from-image" });
    } catch (err) {
      return loadImage(file);
    }
    return Promise.resolve(pending).then(function (bitmap) {
      if (!bitmap || !bitmap.width || !bitmap.height) {
        if (bitmap && bitmap.close) bitmap.close();
        return loadImage(file);
      }
      return fromBitmap(bitmap);
    }, function () {
      return loadImage(file);
    });
  }

  function draw(source, sw, sh, edge) {
    var size = fitWithin(sw, sh, edge);
    var canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("jpeg");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.w, size.h);
    ctx.imageSmoothingEnabled = true;
    if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, size.w, size.h);
    return canvas;
  }

  function releaseCanvas(canvas) {
    canvas.width = 1;
    canvas.height = 1;
  }

  function toJpeg(canvas, quality) {
    return new Promise(function (resolve, reject) {
      if (!canvas.toBlob) {
        reject(new Error("jpeg"));
        return;
      }
      try {
        canvas.toBlob(function (blob) {
          if (!blob || !blob.size) reject(new Error("jpeg"));
          else resolve(blob);
        }, "image/jpeg", quality);
      } catch (err) {
        reject(err);
      }
    });
  }

  function attempt(decoded, edge, quality) {
    var canvas;
    try {
      canvas = draw(decoded.source, decoded.width, decoded.height, edge);
    } catch (err) {
      return Promise.reject(err);
    }
    return toJpeg(canvas, quality).then(function (blob) {
      var size = { blob: blob, width: canvas.width, height: canvas.height };
      releaseCanvas(canvas);
      return size;
    }, function (err) {
      releaseCanvas(canvas);
      throw err;
    });
  }

  function shrink(decoded) {
    return attempt(decoded, MAX_EDGE, FIRST_QUALITY).then(function (first) {
      if (first.blob.size <= MAX_BYTES) return first;
      return attempt(decoded, MAX_EDGE, RETRY_QUALITY).then(function (second) {
        if (second.blob.size <= MAX_BYTES) return second;
        return attempt(decoded, RETRY_EDGE, RETRY_QUALITY);
      });
    });
  }

  function release(decoded) {
    try { decoded.close(); } catch (err) { /* the pixels can still be dropped */ }
    decoded.source = null;
  }

  function publish(base64, width, height, bytes) {
    var meta = {
      base64: base64,
      width: width,
      height: height,
      bytes: bytes
    };
    root.HomeworkPhoto.last = meta;
    return meta;
  }

  function originalFile(file) {
    return blobToBase64(file).then(function (base64) {
      root.HomeworkPhoto.last = null;
      return {
        base64: base64,
        width: 0,
        height: 0,
        bytes: file.size || 0
      };
    });
  }

  function prepare(file) {
    if (!file) return Promise.reject(new Error("photo"));
    return decode(file).then(function (decoded) {
      return shrink(decoded).then(function (jpeg) {
        var width = jpeg.width;
        var height = jpeg.height;
        var bytes = jpeg.blob.size;
        release(decoded);
        return blobToBase64(jpeg.blob).then(function (base64) {
          return publish(base64, width, height, bytes);
        }, function () {
          return originalFile(file);
        });
      }, function () {
        release(decoded);
        return originalFile(file);
      });
    });
  }

  root.HomeworkPhoto = {
    prepare: prepare,
    fitWithin: fitWithin,
    last: null
  };
  if (typeof module !== "undefined" && module.exports) module.exports = root.HomeworkPhoto;
})(typeof globalThis !== "undefined" ? globalThis : this);
