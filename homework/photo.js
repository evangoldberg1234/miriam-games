/* Resize a worksheet photo before upload. Draws through createImageBitmap
   (or an Image) so EXIF rotation is applied, then exports a JPEG whose
   long side is at most 1600px and whose size stays under 2MB. */
(function () {
  var MAX_EDGE = 1600;
  var MAX_BYTES = 2 * 1024 * 1024;

  function fit(width, height, edge) {
    var longSide = Math.max(width, height);
    if (longSide <= edge) return { w: Math.max(1, width), h: Math.max(1, height) };
    var scale = edge / longSide;
    return {
      w: Math.max(1, Math.round(width * scale)),
      h: Math.max(1, Math.round(height * scale))
    };
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve({
          source: img,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          close: function () {}
        });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("photo"));
      };
      img.src = url;
    });
  }

  function decode(file) {
    if (window.createImageBitmap) {
      return createImageBitmap(file, { imageOrientation: "from-image" }).then(function (bitmap) {
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          close: function () { if (bitmap.close) bitmap.close(); }
        };
      }, function () {
        return createImageBitmap(file).then(function (bitmap) {
          return {
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            close: function () { if (bitmap.close) bitmap.close(); }
          };
        }, function () { return loadImage(file); });
      });
    }
    return loadImage(file);
  }

  function draw(source, sw, sh, edge) {
    var size = fit(sw, sh, edge);
    var canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, size.w, size.h);
    return canvas;
  }

  function toJpeg(canvas, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) reject(new Error("jpeg"));
        else resolve(blob);
      }, "image/jpeg", quality);
    });
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var text = String(reader.result || "");
        var comma = text.indexOf(",");
        resolve(comma >= 0 ? text.slice(comma + 1) : text);
      };
      reader.onerror = function () { reject(new Error("jpeg")); };
      reader.readAsDataURL(blob);
    });
  }

  function compress(source, sw, sh) {
    var edge = Math.min(MAX_EDGE, Math.max(sw, sh));
    var guard = 0;
    function attempt() {
      guard += 1;
      if (guard > 6) return Promise.reject(new Error("jpeg"));
      var canvas = draw(source, sw, sh, edge);
      var quality = 0.8;
      function step() {
        return toJpeg(canvas, quality).then(function (blob) {
          if (blob.size <= MAX_BYTES || (quality <= 0.5 && edge <= 800)) {
            return { blob: blob, width: canvas.width, height: canvas.height };
          }
          if (quality > 0.5) {
            quality = Math.round((quality - 0.1) * 10) / 10;
            return step();
          }
          edge = Math.max(800, Math.round(edge * 0.75));
          return attempt();
        });
      }
      return step();
    }
    return attempt();
  }

  function prepare(file) {
    if (!file) return Promise.reject(new Error("photo"));
    return decode(file).then(function (decoded) {
      return compress(decoded.source, decoded.width, decoded.height).then(function (jpeg) {
        decoded.close();
        return blobToBase64(jpeg.blob).then(function (base64) {
          var meta = {
            base64: base64,
            width: jpeg.width,
            height: jpeg.height,
            bytes: jpeg.blob.size
          };
          window.HomeworkPhoto.last = meta;
          return meta;
        });
      }, function (err) {
        decoded.close();
        throw err;
      });
    });
  }

  window.HomeworkPhoto = { prepare: prepare, last: null };
})();
