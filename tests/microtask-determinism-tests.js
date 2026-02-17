/**
 * @file 04-microtask-determinism-tests.js
 * @description
 * Microtask and determinism validation suite for Promise.pick.
 *
 * Validates:
 *  - No double resolution
 *  - Early-settle integrity
 *  - No cross-call contamination
 *  - Stable chaining behavior
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
    log("Running Promise.pick microtask & determinism tests...\n");

    try {

      {
        let resolveCount = 0;

        const result = await Promise.pick(
          [
            Promise.resolve(1),
            Promise.resolve(1)
          ],
          v => v === 1
        ).then(v => {
          resolveCount++;
          return v;
        });

        assert(result === 1, "resolve with 1");
        assert(resolveCount === 1, "resolve only once");
        log("Test 1: no double resolution", "pass");
      }

      {
        let executed = false;

        const slow = new Promise(res =>
          setTimeout(() => {
            executed = true;
            res(999);
          }, 50)
        );

        const fast = Promise.resolve(5);

        const result = await Promise.pick(
          [slow, fast],
          v => v === 5
        );

        assert(result === 5, "resolve with fast match");
        log("Test 2: early exit works correctly", "pass");
      }

      {
        const r1 = await Promise.pick(
          [Promise.resolve(10), Promise.resolve(20)],
          v => v === 20
        );

        const r2 = await Promise.pick(
          [Promise.resolve(r1), Promise.resolve(99)],
          v => v === 20
        );

        assert(r2 === 20, "Chained picks must remain deterministic");
        log("Test 3: chained Promise.pick stability", "pass");
      }

      {
        const a = Promise.pick(
          [Promise.resolve("A")],
          v => v === "A"
        );

        const b = Promise.pick(
          [Promise.resolve("B")],
          v => v === "B"
        );

        const resultsArr = await Promise.all([a, b]);

        assert(resultsArr[0] === "A", "First concurrent result correct");
        assert(resultsArr[1] === "B", "Second concurrent result correct");
        log("Test 4: no cross-call contamination", "pass");
      }

      {
        const result = await Promise.pick(
          [
            Promise.resolve({ value: 10 }),
            Promise.resolve({ value: 20 })
          ],
          obj => obj.value > 15
        );

        assert(result.value === 20, "Selector logic must remain intact");
        log("Test 5: selector stability", "pass");
      }

      log("\nAll microtask & determinism tests passed ✔", "success");

    } catch (err) {
      log("✗ Test failure: " + err.message, "fail");
    }
  }

  if (!runBtn || !results) {
    console.error("Microtask tests require #run button and #results container.");
    return;
  }

  runBtn.addEventListener("click", runTests);

})();
