/**
 * Resolves a promise based on selection.
 * Validates data after picked (selected) values are passed or failed.
 */
Promise.pick = function (iterable, selector) {
  if (typeof selector !== "function") {
    throw new TypeError("selector must be a function");
  }

  const items = Array.from(iterable);
  if (items.length === 0) {
    return Promise.reject(new Error("No promises to pick from"));
  }

  return new Promise((resolve, reject) => {
    let remaining = items.length;
    let settled = false;
    let lastError;

    for (const item of items) {
      Promise.resolve(item).then(value => {
        if (settled) return;

        let matched;
        try {
          matched = selector(value);
        } catch (e) {
          settled = true;
          reject(e);
          return;
        }

        if (matched) {
          settled = true;
          resolve(value);
        }
      }).catch(err => {
        lastError = err;
      }).finally(() => {
        remaining--;
        if (remaining === 0 && !settled) {
          reject(lastError || new Error("No promise matched selector"));
        }
      });
    }
  });
};
