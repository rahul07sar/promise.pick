/**
 * @file concurrency-stress-tests.js
 * @description
 * Advanced concurrency and stress test suite for Promise.pick.
 *
 * Validates:
 *  - Large iterable handling
 *  - Concurrent Promise.pick calls
 *  - Timing independence under load
 *  - Correct exhaustion behavior
 *  - Stability under async pressure
 */

(function () {

  const results = document.getElementById("results");
  const runBtn = document.getElementById("run");

  function log(message, type = "info") {
    const div = document.createElement("div");
    div.className = "log " + type;
    div.textContent = message;
    results.appendChild(div);
  }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  async function runTests() {
    results.innerHTML = "";
    log("Running Promise.pick concurrency & stress tests...\n");

    try {

      {
        const promises = Array.from({ length: 100 }, (_, i) =>
          Promise.resolve(i)
        );

        const result = await Promise.pick(
          promises,
          v => v === 99
        );

        assert(result === 99, "correctly handle large iterable");
        log("Test 1: handles large iterable (100 promises)", "pass");
      }

      {
        const promises = Array.from({ length: 50 }, (_, i) =>
          new Promise(res =>
            setTimeout(() => res(i), Math.random() * 50)
          )
        );

        const result = await Promise.pick(
          promises,
          v => v === 25
        );

        assert(result === 25, "select correct value under async randomness");
        log("Test 2: timing-independent under random delays", "pass");
      }

      {
        const tasks = [];

        for (let i = 0; i < 10; i++) {
          tasks.push(
            Promise.pick(
              [
                Promise.resolve(i),
                Promise.resolve(i + 100)
              ],
              v => v === i + 100
            )
          );
        }

        const resultsArr = await Promise.all(tasks);

        assert(resultsArr.length === 10, "resolve all concurrent picks");
        log("Test 3: handles multiple concurrent Promise.pick calls", "pass");
      }

      {
        let failed = false;

        try {
          const promises = Array.from({ length: 30 }, (_, i) =>
            Promise.resolve(i)
          );

          await Promise.pick(promises, v => v === 999);
        } catch {
          failed = true;
        }

        assert(failed, "reject after full exhaustion");
        log("Test 4: rejects correctly after exhausting iterable", "pass");
      }

      {
        const promises = [];

        for (let i = 0; i < 40; i++) {
          if (i % 2 === 0) {
            promises.push(Promise.reject("fail"));
          } else {
            promises.push(
              new Promise(res =>
                setTimeout(() => res(i), Math.random() * 30)
              )
            );
          }
        }

        const result = await Promise.pick(
          promises,
          v => v === 39
        );

        assert(result === 39, "tolerate many rejections and pick correct value");
        log("Test 5: stable under mixed resolve/reject pressure", "pass");
      }

      log("\nAll concurrency & stress tests passed ✔", "success");

    } catch (err) {
      log("Test failure: " + err.message, "fail");
    }
  }

  if (!runBtn || !results) {
    console.error("Concurrency tests require #run button and #results container.");
    return;
  }

  runBtn.addEventListener("click", runTests);

})();
